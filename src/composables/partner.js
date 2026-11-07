import { CATALOGUE_PAGE_SIZE, partnerView, removeEndingPoint } from '@museumwnf/viewer-core'
import { useData } from './data.js'
import { galleryTile, legacyOrder } from './catalogue.js'

// The partner pages: the partner lists on `/partners/results` (legacy's
// pm_partner_list.php, PartnersResults.vue), the profile on `/partner/:id`
// (pm_partner.php, viewer-layout's `StandalonePartnerPage`) and a partner's
// objects on `/partner/:id/items`. What is declared here is only this
// website's: the lists' groups, the partner's view-model with this
// website's routes, and the objects page's records.

const { countryLabel, md, mdInline, partners, tr } = useData()

// Legacy's ORDER BY, as MySQL's utf8_general_ci compares: case and accents
// folded, then character by character.
const folded = (text) => text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()
const legacyCompare = (a, b) => {
  const x = folded(a)
  const y = folded(b)
  return x < y ? -1 : x > y ? 1 : 0
}
const nameOf = (partner) => tr('partners', partner.id, 'en').name ?? partner.internal_name ?? ''
const furtherAssociated = (partner) => /^further associated /i.test(nameOf(partner))
// Legacy's lists join each partner to its English name (an INNER JOIN on
// `institutionnames`/`museumnames` with lang='en'): one without is not listed.
const named = (partner) => Boolean(tr('partners', partner.id, 'en').name)

/**
 * The partner lists, as legacy's pm_partner_list.php read them: per country
 * by its English name, the partners of one type by English name, each shown
 * as "name, city"; under them every associated partner of theirs by name and
 * city, the "Further Associated" entries (shown by name alone) last.
 * A partner with a region in the page's language (legacy's `regionnames`,
 * the translation's `region`) has a group of its own, "Italy / Bologna",
 * placed where its first partner falls in that order, as legacy keyed its
 * list by country and region in reading order.
 */
export function partnerListGroups(type) {
  const list = partners.value ?? []
  const label = (partner, withCity = true) => {
    const city = tr('partners', partner.id, 'en').city
    return withCity && city ? `${nameOf(partner)}, ${city}` : nameOf(partner)
  }
  const byLabel = (a, b) => legacyCompare(label(a), label(b))
  const country = (partner) => countryLabel(partner.country_id, 'en')
  const groups = new Map()
  const members = list
    .filter((p) => p.type === type && p.level === 'partner' && named(p))
    .sort((a, b) => legacyCompare(country(a), country(b)) || byLabel(a, b))
  for (const partner of members) {
    const region = tr('partners', partner.id).region
    const heading = region ? `${country(partner)} / ${region}` : country(partner)
    if (!groups.has(heading)) groups.set(heading, { label: heading, main: [], associated: [] })
    groups.get(heading).main.push(partner)
  }
  const entry = (partner, withCity) => ({ id: partner.id, label: label(partner, withCity), to: { name: 'partner', params: { id: partner.id } } })
  return [...groups.values()]
    .map((group) => {
      const main = group.main.sort(byLabel)
      const associated = main.flatMap((parent) => {
        const own = list.filter((p) => p.parent_id === parent.id && named(p))
        return [
          ...own.filter((p) => !furtherAssociated(p)).sort(byLabel).map((p) => entry(p, true)),
          ...own.filter(furtherAssociated).sort((a, b) => legacyCompare(nameOf(a), nameOf(b))).map((p) => entry(p, false)),
        ]
      })
      return { label: group.label, main: main.map((p) => entry(p, true)), associated }
    })
}

// Where a partner's "View Objects"/"View Monuments" lands: legacy's
// pm_museum_items.php and pm_institution_items.php (PartnerItems.vue).
export function partnerObjectsLink(partner) {
  return { name: 'partner-items', params: { id: partner.id } }
}

// The partner profile's pill to that page (PartnerDetail.vue): a museum's
// objects, an institution's monuments, for a partner that holds any.
export function partnerItemsLink(partner) {
  if (!partner?.item_count) return null
  return {
    label: partner.type === 'institution' ? 'baroqueart.pp.viewMonuments' : 'baroqueart.pp.viewObjects',
    to: partnerObjectsLink(partner),
  }
}

// The profile's view-model, read as legacy's pm_partner.php printed it: the
// name, the city and the contact lines without their ending period.
const plain = (value) => (value ? removeEndingPoint(String(value)) : value)
export function partnerProfileView(partner, text) {
  const own = text ?? {}
  const view = partnerViewOf(partner, {
    ...own,
    ...Object.fromEntries(['name', 'city', 'address', 'phone', 'fax', 'email'].map((key) => [key, plain(own[key])])),
  })
  view.persons = view.persons.map((person) =>
    Object.fromEntries(Object.entries(person).map(([key, value]) => [key, typeof value === 'string' ? plain(value) : value])),
  )
  return view
}

// Legacy listed no About tab for its "Further Associated" entries.
export const listsAbout = (partner) => !furtherAssociated(partner)

// That page's records: a museum's objects, an institution's monuments, in
// the Permanent Collection's order and tile, twenty a page.
export function partnerItemsSpec(partnerId, type) {
  const kind = type === 'institution' ? 'monument' : 'object'
  return {
    entity: 'items',
    keys: [],
    scope: (item) => item.partner_id === partnerId && item.type === kind,
    sort: legacyOrder,
    pageSize: CATALOGUE_PAGE_SIZE,
    record: galleryTile,
    summary: () => [],
    empty: 'baroqueart.pcr.empty',
  }
}

// The partner's view-model, which `PartnerPanel` renders on the partner page
// and under an item's holder text: this website's country label, its
// renderers (the glossary-bound ones) and its two routes.
export function partnerViewOf(partner, text) {
  return partnerView(partner, text, {
    countryLabel,
    md,
    mdInline,
    route: (p) => ({ name: 'partner', params: { id: p.id } }),
    objectsRoute: partnerObjectsLink,
  })
}
