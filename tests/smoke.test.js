import { describe, expect, it, vi } from 'vitest'
import { loadEntities, mergeMessages, projectLabel } from '@museumwnf/viewer-core'
import { checkOfferedLanguages, checkRoutes, checkSectionMeta, checkTextsRendered, mountSite } from '@museumwnf/viewer-core/testing'
import { catalogues as sharedTexts } from '@museumwnf/viewer-i18n/standalone'
import manifest from '../node_modules/@museumwnf/baroqueart-data/manifest.json'
import config from '../src/dataset.config.js'
import { useData } from '../src/composables/data.js'
import minisites from '../src/minisites.json'

// The same two layers main.js assembles, in the same order: the shared bundle
// first, this website's own files last, one per language (the sheet's words
// come in every language its records are written in). Mounting without them
// would prove nothing about the chrome — every text would render as its own
// name.
const localeFiles = import.meta.glob('../locales/*.json', { eager: true })
const ownTexts = Object.fromEntries(
  Object.entries(localeFiles).map(([path, module]) => [path.split('/').pop().replace(/\.json$/, ''), module.default]),
)
const messages = mergeMessages(sharedTexts, ownTexts)

// Mounted on the address under test, as a visitor arrives from a link — the
// kit's own `mountSite`, curried over this website's config and messages.
function mount(hash = '#/') {
  return mountSite(config, messages, hash)
}

describe('website smoke test', () => {
  it('mounts against the configured data package', async () => {
    const { app, host } = await mount()

    expect(host.textContent).toContain(config.siteName)
    expect(host.querySelector('.mwnf-page')).not.toBeNull()

    // The home route renders legacy's home page (inventory-app#2233): the
    // standalone family's chrome around the side link and the item of the
    // day — no card grid, no welcome text legacy never had.
    expect(host.querySelector('.vc-home')).toBeNull()
    await vi.waitFor(() => expect(host.querySelector('.mwnf-standalone-highlight')).not.toBeNull(), { timeout: 15000 })
    expect(host.querySelector('.mwnf-cards')).toBeNull()
    expect([...host.querySelectorAll('.mwnf-standalone-home__links li')].map((li) => li.textContent.trim())).toEqual(['Credits'])
    expect(host.querySelector('.mwnf-standalone-highlight__heading').textContent).toBe('Today’s highlight from the Permanent Collection')
    // Legacy's menu, in its order, and its cooperation band under the page.
    expect([...host.querySelectorAll('.mwnf-nav__link')].map((l) => l.textContent.trim())).toEqual([
      'Permanent Collection', 'Database', 'Exhibitions', 'Partners', 'Timeline', 'My Collection',
    ])
    expect(host.querySelector('.mwnf-sponsors').textContent).toContain('Discover Baroque Art has been created in cooperation with partners from')

    app.unmount()
    // Longer than vitest's default 5s. This mounts the whole website against
    // the real data package; being the first test, it also pays for
    // transforming the composed views the home page is. A blocking check
    // that fails at random teaches people to re-run it rather than read it,
    // so it gets the minute the other page tests have.
  }, 60000)

  // The Permanent Collection list and the item sheet run on the platform's
  // composed views (metanull/viewer-core#50): the rows and the filter panel
  // come from the catalogue spec, the sheet's labels from the sheet spec,
  // and what only this website has fills the views' slots.
  // Legacy's pclist_all.php: the heading naming the selection with its
  // count, legacy's tiles, "Change your selection" with its lists, the
  // country's timeline under "Related Content".
  it('renders the Permanent Collection results as legacy drew them', async () => {
    const [items] = await loadEntities(['items'])
    const country = items.find((i) => i.country_id)?.country_id
    const { app, host } = await mount(`#/permanent-collection/results?country=${country}&lang=en`)
    await vi.waitFor(() => expect(host.querySelector('.mwnf-standalone-results__tile')).not.toBeNull(), { timeout: 20000 })
    const heading = host.querySelector('.mwnf-standalone-pcr__heading').textContent
    expect(heading).toMatch(/^Permanent Collection \| \S/)
    expect(heading).toMatch(/\[\d+ Objects|\[\d+ Monuments/)
    expect(host.querySelector('.mwnf-standalone-pcr__panel strong').textContent).toBe('Change your selection')
    expect([...host.querySelectorAll('.mwnf-standalone-pcr__date option')].slice(0, 2).map((o) => o.textContent)).toEqual(['Start Date', '1500 A.D.'])
    expect(host.querySelector('.mwnf-standalone-pcr__related a').textContent).toMatch(/^Timeline \| /)
    app.unmount()
  }, 60000)

  // Legacy's database_item.php in its three columns (the standalone family's
  // sheet): the way back and the pictures, the sheet opening on the record's
  // name under legacy's word, the Related Content column with Download.
  it('renders the item sheet as legacy drew it', async () => {
    const [items] = await loadEntities(['items'])
    const object = items.find((i) => i.type === 'object') ?? items[0]
    const { app, host } = await mount(`#/item/${encodeURIComponent(object.id)}?lang=en`)
    await vi.waitFor(() => expect(host.querySelector('.mwnf-sheet__label')).not.toBeNull(), { timeout: 20000 })
    expect(host.querySelector('.mwnf-standalone-item')).not.toBeNull()
    expect(host.querySelector('.mwnf-sheet__label').textContent).toBe('Name of Object:')
    expect([...host.querySelectorAll('.mwnf-standalone-item__back-link')].map((a) => a.textContent)).toEqual(['Back', 'Collection start page'])
    expect(host.querySelector('.mwnf-standalone-related__heading').textContent).toBe('Related Content')
    expect([...host.querySelectorAll('.mwnf-standalone-related__download button')].map((b) => b.textContent))
      .toEqual(['As PDF (including images)', 'As Word (text only)'])

    // The citation's permalink (viewer-core's sourceUrl), now that this site
    // declares site.origin — the sheet's own record, not a guessed address.
    const sourceCredit = host.querySelector('.mwnf-source-credit')
    expect(sourceCredit).not.toBeNull()
    const sourceLink = sourceCredit.querySelector('a')
    expect(sourceLink.textContent.startsWith(config.site.origin)).toBe(true)
    expect(sourceLink.textContent).toContain(`#/item/${object.id}`)

    // #1727 cleanup: `itemSheetSpec` no longer names a project for the citation
    // (composables/sheet.js), so `RecordView` resolves it from the record's
    // own `project_id` against the manifest — read here off the data
    // package rather than hardcoded, so the assertion tracks the source of
    // truth rather than repeating it.
    const expectedProjectName = projectLabel(manifest, object.project_id, 'en')
    expect(expectedProjectName).toBeTruthy()
    expect(host.querySelector('.mwnf-credits__citation').textContent).toContain(expectedProjectName)

    app.unmount()
  }, 60000)

  // Legacy printed a sheet's labels in the language the record is shown in
  // (db_GetTERM), whatever the site's: a Czech record's sheet is Czech.
  it("prints a Czech record's labels in legacy's Czech words", async () => {
    const [items] = await loadEntities(['items'])
    const czech = items.find((i) => i.type === 'object' && (i.languages ?? []).includes('cs'))
    expect(czech).toBeTruthy()
    const { app, host } = await mount(`#/item/${encodeURIComponent(czech.id)}?lang=en`)
    await vi.waitFor(() => expect(host.querySelector('.mwnf-languages')).not.toBeNull(), { timeout: 20000 })
    const button = [...host.querySelectorAll('.mwnf-languages button')].find((b) => /cs|če|cze/i.test(b.textContent))
    button.click()
    await vi.waitFor(() => expect(host.querySelector('.mwnf-sheet__label').textContent).toBe('Název díla:'), { timeout: 20000 })
    app.unmount()
  }, 60000)

  // The blocks after the sheet are viewer-layout's item-page blocks. This
  // dataset carries no `media` (unlike islamicart's), so only the THG
  // galleries exercise `RelatedMedia`/`OnDisplayIn` here: by name — the
  // package carries no address for them, and a same-page anchor would lead
  // the hash router to its not-found page.
  it('shows the THG galleries through the shared item-page blocks', async () => {
    const [items] = await loadEntities(['items'])
    const item = items.find((i) => i.thg_galleries?.length)
    expect(item).toBeTruthy()
    const { app, host } = await mount(`#/item/${encodeURIComponent(item.id)}?lang=en`)
    await vi.waitFor(() => expect(host.querySelector('.mwnf-on-display')).not.toBeNull(), { timeout: 20000 })

    const galleries = Array.from(host.querySelectorAll('.mwnf-on-display')).find((block) =>
      item.thg_galleries.every((g) => block.textContent.includes(g.name)))
    expect(galleries).toBeTruthy()
    expect(galleries.querySelector('a[href*="ThematicGallery"]')).toBeNull()

    app.unmount()
  }, 60000)

  // A monument's sub-details, embedded on the record as `details` — the old
  // hand-written page never read them, so this section renders for the
  // first time on this website.
  it('shows a monument\'s special features', async () => {
    const [items] = await loadEntities(['items'])
    const monument = items.find((i) => i.type === 'monument' && i.details?.length)
    expect(monument).toBeTruthy()
    const { app, host } = await mount(`#/item/${encodeURIComponent(monument.id)}?lang=en`)
    await vi.waitFor(() => expect(host.querySelector('.mwnf-special-features')).not.toBeNull(), { timeout: 20000 })

    expect(host.querySelectorAll('.mwnf-special-features__item').length).toBe(monument.details.length)

    app.unmount()
  }, 60000)

  // The Timeline entrance, results and gallery pages moved onto
  // viewer-layout's `TimelineResultsView`/`CatalogueResultsView` (metanull/baroqueart#64):
  // the country merge, the overlap filter and the pagination are the
  // platform's; the per-event link into the Permanent Collection results and
  // the gallery cross-link (decision D1, the legacy `hcr_gallery.php` this
  // site had dropped) are this website's own, declared in `composables/timeline.js`.
  it('renders the Timeline entrance on the composed results view', async () => {
    const { app, host } = await mount('#/timeline')
    await vi.waitFor(() => expect(host.querySelector('.mwnf-timeline')).not.toBeNull(), { timeout: 20000 })
    expect(host.querySelector('.mwnf-heading').textContent).toContain('Timeline')
    app.unmount()
  }, 30000)

  it('renders the Timeline results with events and offers the gallery cross-link', async () => {
    const { app, host } = await mount('#/timeline/results?country=hun')
    await vi.waitFor(() => expect(host.querySelector('.mwnf-timeline__row')).not.toBeNull(), { timeout: 20000 })

    // Every one of Hungary's sixty events, paginated fifteen a page (legacy's size).
    expect(host.querySelectorAll('.mwnf-timeline__row').length).toBe(15)

    // The per-event action, unchanged since before this page moved onto the spec.
    const action = host.querySelector('.mwnf-timeline__action')
    expect(action).not.toBeNull()
    expect(action.textContent).toContain('View items from this period')

    // Hungary carries objects, so the gallery cross-link must appear, with a count.
    const gallery = host.querySelector('.mwnf-timeline__gallery')
    expect(gallery).not.toBeNull()
    expect(gallery.textContent).toContain('See Gallery')
    expect(gallery.textContent).toContain('86')

    // Timeline events now carry their descriptions (inventory-app#1705):
    // verify a row's rendered description and date against the fixture.
    const descriptions = [...host.querySelectorAll('.mwnf-timeline__description')].map((el) => el.textContent.trim())
    const dates = [...host.querySelectorAll('.mwnf-timeline__date')].map((el) => el.textContent.trim())
    expect(descriptions.some((desc) => desc.startsWith('According to the double conquest theory'))).toBe(true)
    expect(dates).toContain('670/680')

    app.unmount()
  }, 30000)

  it('reaches the Permanent Collection objects of that country from the Timeline gallery', async () => {
    const { app, host } = await mount('#/timeline/gallery?country=hun')
    await vi.waitFor(() => expect(host.querySelector('.mwnf-list__row')).not.toBeNull(), { timeout: 20000 })

    expect(host.querySelector('.mwnf-heading').textContent).toContain('Timeline Gallery')
    // Twenty rows a page, the Permanent Collection's own page size.
    expect(host.querySelectorAll('.mwnf-list__row').length).toBe(20)
    // The Permanent Collection's own two-part count (objects, monuments) totalling 86.
    const counts = [...host.querySelectorAll('.mwnf-summary__count')].map((el) => Number(el.textContent))
    expect(counts.length).toBe(2)
    expect(counts.reduce((a, b) => a + b, 0)).toBe(86)

    app.unmount()
  }, 30000)

  // Each exhibition is a website of its own (a mini-site, inventory-app#2390):
  // this site lists the exhibitions and links each to its own address
  // (src/minisites.json), and an item sheet links the exhibition pages that
  // place the item, on the mini-site.
  it('lists the exhibitions, each leading to its own website', async () => {
    const [collections] = await loadEntities(['collections'])
    const root = collections.find((c) => c.purpose === 'exhibitions-root')
    expect(root).toBeTruthy()
    const exhibitions = collections.filter((c) => c.parent_id === root.id)
    for (const exhibition of exhibitions) expect(minisites[exhibition.id], exhibition.internal_name).toMatch(/^https:\/\//)

    const { app, host } = await mount('#/exhibitions?lang=en')
    await vi.waitFor(() => expect(host.querySelector('.mwnf-cards')).not.toBeNull(), { timeout: 20000 })
    expect(host.querySelector('.mwnf-heading').textContent).toContain('Exhibitions')
    const hrefs = Array.from(host.querySelectorAll('.mwnf-cards__link')).map((a) => a.getAttribute('href'))
    expect(hrefs).toHaveLength(exhibitions.length)
    for (const href of hrefs) expect(Object.values(minisites).some((base) => href.startsWith(base))).toBe(true)
    app.unmount()
  }, 30000)

  it('links an item to the exhibition pages that place it, on the mini-site', async () => {
    const [collections] = await loadEntities(['collections'])
    const byId = new Map(collections.map((c) => [c.id, c]))
    const up = (c, n) => (n === 0 || !c ? c : up(byId.get(c.parent_id), n - 1))
    const root = collections.find((c) => c.purpose === 'exhibitions-root')
    // A page: three levels below the exhibitions (exhibition, theme, page).
    const page = collections.find((c) => (c.items?.length ?? 0) > 0 && up(c, 3)?.id === root.id)
    expect(page).toBeTruthy()

    const { app, host } = await mount(`#/item/${encodeURIComponent(page.items[0].id)}?lang=en`)
    await vi.waitFor(() => expect(host.querySelector('.mwnf-on-display a[href*="#/exhibition/"]')).not.toBeNull(), { timeout: 20000 })
    const link = host.querySelector('.mwnf-on-display a[href*="#/exhibition/"]')
    expect(link.getAttribute('href')).toMatch(/^https:\/\/museumwithnofrontiers\.github\.io\/baroqueart-[a-z-]+\/#\/exhibition\/\d+\/\d+\?lang=en$/)
    app.unmount()
  }, 30000)

  // The Partners entrance stays this site's own (the museum/institution
  // choice); the results list and the profile sheet moved onto
  // viewer-layout's `PartnerListView`/`RecordView` (metanull/baroqueart#65):
  // the country grouping, the main/associated tiers and the nested
  // hierarchy are the platform's, over the republished partner shape
  // (`level`, `parent_id`, `item_count`) — this website's own composable
  // (`composables/partner.js`) supplies only the museum/institution axis,
  // the contact/logo blocks and the reverse item lookup.
  it('renders the Partners results on the composed list view, tiers nested by country', async () => {
    const [partners] = await loadEntities(['partners'])

    const { app, host } = await mount('#/partners/results?type=museum')
    await vi.waitFor(() => expect(host.querySelector('.mwnf-partner-list__row')).not.toBeNull(), { timeout: 20000 })

    expect(host.querySelector('.mwnf-partner-list')).not.toBeNull()
    expect(host.querySelector('.mwnf-heading, .mwnf-partner-list__title').textContent).toContain('Museums')

    // The "Partners found" count is the platform's own row count: a nested
    // associated partner is folded under its parent's row, not counted
    // again, so this is main museums plus the associated ones that stay
    // flat (no museum parent in the list) — not every museum record.
    const museums = partners.filter((p) => p.type === 'museum')
    const museumIds = new Set(museums.map((p) => p.id))
    const nestedCount = museums.filter((p) => p.parent_id && museumIds.has(p.parent_id)).length
    expect(host.querySelector('.mwnf-partner-list__count').textContent).toContain(`${museums.length - nestedCount}`)

    // Moravian Gallery (main, Czech Republic) and its associated City
    // Museum: the child nests under its own parent's row rather than a
    // flat "Associated" column, reading `parent_id` through `partnerHierarchy`.
    expect(host.textContent).toContain('Moravian Gallery')
    expect(host.textContent).toContain('City Museum')
    const parentRow = [...host.querySelectorAll('.mwnf-partner-list__row-block')].find((el) => el.textContent.includes('Moravian Gallery'))
    expect(parentRow?.querySelector('.mwnf-partner-list__children')?.textContent).toContain('City Museum')

    app.unmount()
  }, 30000)

  it('renders a partner profile on the composed record view, with contact and held items', async () => {
    // The Borghese Gallery: a museum with images, contact details and 50
    // held objects — enough to exercise the panel's contact tab and the
    // reverse `partner_id` lookup the platform's `related` cannot express
    // (partner.js's `heldItems`).
    const partnerId = 'fae81dae-0250-52ec-acc1-171da28b9eef'
    const { app, host } = await mount(`#/partner/${partnerId}`)
    await vi.waitFor(() => expect(host.querySelector('.mwnf-partner-panel--full')).not.toBeNull(), { timeout: 20000 })

    // The body is viewer-layout's `PartnerPanel` (inventory-app#2035).
    expect(host.querySelector('h1.mwnf-partner-panel__name').textContent).toContain('Borghese Gallery')
    expect(host.querySelector('.detail-type-badge').textContent.trim()).toBe('Museum')
    expect(host.querySelector('.mwnf-partner-panel__location').textContent).toBe('Rome, Italy')
    expect([...host.querySelectorAll('[role="tab"]')].map((tab) => tab.textContent)).toContain('Contact')

    // The contact tab's own lines, in the DOM behind the tab.
    expect(host.querySelector('.mwnf-partner-panel__panel--contact').textContent).toContain('+39 06 8413979')

    // "View objects (50)" — item_count is the package's own count, not a
    // scan of every item.
    const viewItems = host.querySelector('.mwnf-partner-panel__actions')
    expect(viewItems).not.toBeNull()
    expect(viewItems.textContent).toContain('View objects')
    expect(viewItems.textContent).toContain('50')
    expect(viewItems.querySelector('a').getAttribute('href')).toBe(`#/partner/${partnerId}/items`)

    app.unmount()
  }, 30000)

  // Legacy's pm_museum_items.php: the way back to the partner lists and the
  // Sponsors page, the partner's name and place, its objects as the
  // Permanent Collection's tiles, "Partner Profile" beside them.
  it("renders a partner's objects as legacy drew them", async () => {
    const [partners, items] = await loadEntities(['partners', 'items'])
    const partner = partners.find((p) => p.backward_compatibility === 'mwnf3:museums:Mus11:cz')
    const held = items.filter((i) => i.partner_id === partner.id && i.type === 'object')
    const { app, host } = await mount(`#/partner/${partner.id}/items?lang=en`)
    await vi.waitFor(() => expect(host.querySelector('.mwnf-standalone-results__tile')).not.toBeNull(), { timeout: 20000 })
    expect([...host.querySelectorAll('.mwnf-standalone-item__back-link')].map((a) => a.textContent))
      .toEqual(['Back', 'Partner Museums', 'Other Partners', 'Sponsors'])
    expect(host.querySelector('.mwnf-standalone-pmi__heading h3').textContent).toBe('Moravian Gallery')
    expect(host.querySelector('.mwnf-standalone-pmi__heading i').textContent).toBe('Brno, Czech Republic')
    expect(host.querySelectorAll('.mwnf-standalone-results__tile').length).toBe(Math.min(held.length, 20))
    expect(host.querySelector('.mwnf-standalone-pcr__related a').textContent).toBe('Partner Profile')
    app.unmount()
  }, 60000)


  // The Database entrance and its keyword results moved onto
  // viewer-layout's `SearchFormView`/`CatalogueResultsView` (metanull/baroqueart#66):
  // the rows, the AND/OR fold and the century presets are the platform's;
  // this website's own field map (`composables/catalogue.js`'s
  // `SEARCH_FIELDS`) and the two legacy expansions (decision D3) still run
  // the actual search.
  it('renders the Database entrance on the composed search form', async () => {
    const { app, host } = await mount('#/database')
    await vi.waitFor(() => expect(host.querySelector('.mwnf-search-form')).not.toBeNull(), { timeout: 20000 })
    expect(host.querySelector('.mwnf-heading').textContent).toContain('Database')
    // Legacy's three keyword rows, in their own order.
    expect(host.querySelectorAll('.mwnf-search-form__row').length).toBe(3)
    expect(host.textContent).toContain('Keyword 1')
    // The asymmetric century presets (database.php:88-124): "from" runs to
    // 2001, "to" only to 2000.
    const fromOptions = [...host.querySelectorAll('.mwnf-search-form__dates select')[0].options].map((o) => o.value)
    expect(fromOptions).toContain('2001')
    app.unmount()
  }, 20000)

  it('finds a record by field, and by its country name through the keyword expansion', async () => {
    // "Adoring Angel" (Hungarian National Gallery) carries no literal
    // "Hungary" in its own text — only "Hungarian" — so the second row can
    // only match through `countryExpansion` resolving "Hungary" to `hun`
    // and finding it in the `keyword` field's own haystack
    // (`composables/catalogue.js`'s `SEARCH_FIELDS`, decision D3).
    const { app, host } = await mount('#/database/results?q=Hungary&field=keyword&q2=Adoring+Angel&field2=name&op2=AND')
    await vi.waitFor(() => expect(host.querySelector('.mwnf-standalone-list__cell')).not.toBeNull(), { timeout: 20000 })
    const rows = host.querySelectorAll('.mwnf-standalone-list__cell')
    expect(rows.length).toBe(1)
    expect(rows[0].textContent).toContain('Adoring Angel')
    app.unmount()
  }, 20000)

  // Legacy's database_results.php: the "Refine your search" band, the way
  // back, the heading with the count, the list beside the first record's
  // preview, twelve a page.
  it('renders the database results as legacy drew them', async () => {
    const { app, host } = await mount('#/database/results?q=Brno&field=keyword&lang=en')
    await vi.waitFor(() => expect(host.querySelector('.mwnf-standalone-list__cell')).not.toBeNull(), { timeout: 20000 })
    expect([...host.querySelectorAll('.mwnf-standalone-refine__label')].map((l) => l.textContent)).toEqual(['Refine your search:', 'in'])
    expect([...host.querySelectorAll('.mwnf-standalone-refine option')].map((o) => o.textContent)).not.toContain('Other')
    expect([...host.querySelectorAll('.mwnf-standalone-item__back-link')].map((a) => a.textContent)).toEqual(['Back', 'Database start page'])
    expect(host.querySelector('.mwnf-standalone-pcr__heading').textContent).toMatch(/^Results of your search \| \d+ records$/)
    const cells = host.querySelectorAll('.mwnf-standalone-list__cell')
    expect(cells.length).toBeLessThanOrEqual(12)
    const first = cells[0].querySelector('.mwnf-standalone-list__name').textContent
    expect(host.querySelector('.mwnf-standalone-list__preview strong').textContent).toBe(first.replace(/,$/, ''))
    app.unmount()
  }, 30000)

  it('says so when nothing is found, in legacy\'s words', async () => {
    const { app, host } = await mount('#/database/results?q=zzqqxx&field=keyword&lang=en')
    await vi.waitFor(() => expect(host.querySelector('.mwnf-standalone-list__empty')).not.toBeNull(), { timeout: 20000 })
    expect(host.querySelector('.mwnf-standalone-list__empty').textContent).toBe('No result.\nPlease try a search with other criteria.')
    expect(host.querySelector('.mwnf-standalone-pcr__heading').textContent).toBe('Results of your search | 0 records')
    app.unmount()
  }, 30000)

  it('renders the Permanent Collection entrance on the composed search form, one filter at a time', async () => {
    const { app, host } = await mount('#/permanent-collection')
    await vi.waitFor(() => expect(host.querySelector('.mwnf-search-form--radio')).not.toBeNull(), { timeout: 20000 })
    expect(host.querySelector('.mwnf-heading').textContent).toContain('Permanent Collection')
    // The country radio's own options are the values the items actually
    // carry (`useFacets`), so a real country name must render, not an id.
    expect(host.textContent).toContain('Italy')
    app.unmount()
  }, 20000)

  it('declares every route by name, and leaves the catch-all to the router', () => {
    expect(checkRoutes(config, {
      names: [
        'home', 'permanent-collection', 'permanent-collection-results', 'database', 'database-results',
        'timeline', 'timeline-results', 'timeline-gallery', 'partners', 'partners-results', 'partner',
        'exhibitions', 'exhibition', 'exhibition-introduction', 'exhibition-theme', 'item', 'credits', 'sponsors',
      ],
    })).toEqual([])
    // This website has never been published under another URL shape.
    expect(config.legacyRoutes).toEqual([])
  })

  it('declares the entities every route reads', () => {
    // A view that renders records against `null` is the failure this prevents:
    // the router loads what a route names before the view is created.
    for (const route of config.extraViews) {
      expect(Array.isArray(route.meta?.entities), route.name).toBe(true)
    }
    expect(config.extraViews.find((r) => r.name === 'item').meta.entities).toContain('items')
  })

  it('declares the section every route belongs to', () => {
    // The shell marks the active menu entry off `meta.section`, read through
    // viewer-core's `useSection()` — a route with none would leave the menu
    // silently unmarked rather than fail.
    expect(checkSectionMeta(config)).toEqual([])
  })

  // The record lookups are viewer-core's shared indexes now, and a Map is not
  // an object: `byId(...)[id]` reads as undefined rather than failing, so a
  // page would simply render nothing. This is where that shows.
  it('resolves a record through the shared index', async () => {
    const { loadEntities } = await import('@museumwnf/viewer-core')
    const { itemById } = useData()
    const [items] = await loadEntities(['items'])
    expect(itemById.value).toBeInstanceOf(Map)
    expect(itemById.value.get(items[0].id)).toBe(items[0])
  }, 20000)

  it('offers the languages the package declares for the site, where the items carry them', () => {
    expect(checkOfferedLanguages(config)).toEqual([])
    expect(config.languages).toContain('en')
    const switcher = config.navigation.languages
    expect(switcher.map((l) => l.code)).toEqual(config.languages)
    expect(switcher.every((l) => Boolean(l.label))).toBe(true)
  })

  it('publishes no generic entity pages', () => {
    // Every page is a hand-built view. Leaving `entities` at the package
    // default would additionally publish one list and one detail page per
    // exported entity — routes the legacy site never had, exposing the data
    // package's shape (collections, timelines) rather than the site's.
    expect(config.features.entities).toEqual([])
  })

  // The chrome is now two layers, and either one failing is silent: a missing
  // entry renders as its own name rather than as an error. These assert the
  // rendered page, not the files, so a bundle that installs but never reaches
  // the components fails here too.
  it('renders the shared texts and its own over them', async () => {
    const { app, host } = await mount()

    const text = host.textContent
    // From viewer-i18n: the layout's skip link.
    expect(text).toContain('Skip to content')
    // The header's mark (the logo's name is its alt text), a menu entry.
    expect(host.querySelector('.mwnf-header__brand-logo').getAttribute('alt')).toBe('Discover Baroque Art - Virtual Museum')
    expect(text).toContain('Permanent Collection')
    // Nothing rendered as a bare entry name, which is what a missing text
    // looks like — there is no exception to throw for one. Every namespace
    // a page actually reads, not just this site's own: a raw shared key
    // (record.*, sheet.*, timeline.*, partner.*, exhibition.*, the shared
    // core/layout/catalogue chrome) would otherwise pass unseen.
    expect(checkTextsRendered(host, {
      namespaces: ['baroqueart', 'core', 'layout', 'catalogue', 'record', 'sheet', 'timeline', 'partner', 'exhibition'],
    })).toEqual([])

    app.unmount()
  }, 20000)

  // The footer is legacy's line (the standalone shell): its Legal Notice link is
  // the page the package's terms of use name, and there is no rights-holder
  // sentence, which legacy doesn't have (Pascal, 2026-10-20).
  it("links legacy's Legal Notice, the package's terms of use, from the footer", async () => {
    const { app, host } = await mount()

    const hrefs = [...host.querySelectorAll('.mwnf-footer__link')].map((a) => a.getAttribute('href'))
    expect(hrefs).toContain(manifest.rights.terms_url)
    expect(host.querySelector('.mwnf-footer__attribution')).toBeNull()

    app.unmount()
  }, 20000)
})
