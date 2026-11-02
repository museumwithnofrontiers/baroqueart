import { CATALOGUE_DATE_MODE, CATALOGUE_PAGE_SIZE, dateRange, removeEndingPoint, searchFields } from '@museumwnf/viewer-core'
import { useData } from './data.js'

// The catalogue spec: what this website's lists filter and search on. The
// engine — query state, options, dates, pages, the keyword grammar, the
// fields of the legacy search form, the result row — is viewer-core's
// catalogue layer and viewer-layout's views; what is declared here is only
// what is this website's: the two facets of the Permanent Collection, and
// the `permanentCollectionResultsSpec` that composes them for viewer-layout's
// `CatalogueResultsView`. Two entrances and two results pages read this one
// declaration.

const { countries, countryLabel, itemRoute, itemRow, partnerLabel, partners, tr, translations } = useData()

// The fields of database.php, each searching what database_results.php
// searched (decision D3), in the package's fields: Keywords every column of
// the object or monument, and of a monument's special features in the same
// language (legacy's `monument_details`, joined on the language); the other
// fields theirs. Legacy's Provenance, Material and Patron searches dropped
// their condition for the type the column did not belong to, and Other had
// none at all, so each listed everything; those fields search their own
// columns here, and Other the descriptive fields. Legacy's `period_activity`
// was not imported, so it is not searched.
const LEGACY_COLUMNS = (item, text) => [
  text.name, text.alternate_name, text.location, text.province, text.dates, text.dynasty, text.initial_owner,
  text.artist, text.keywords, text.materials, text.description, text.short_description, item.mwnf_reference,
  text.method_for_datation, item.owner_reference, text.type, item.start_date, item.end_date, text.owner,
  text.provenance, text.dimensions, text.artist_birthdate, text.artist_birthplace, text.artist_deathdate,
  text.artist_deathplace, text.place_of_production, text.workshop, text.method_for_provenance, text.obtention,
  text.bibliography, text.author, text.holder,
  text.architects, text.patrons, text.address, text.history,
]
// A monument's special features, in the language searched.
const featuresOf = (item, language) =>
  (item.details ?? []).map((detail) => translations('items', language)?.[detail.id]).filter(Boolean)
const inFeatures = (item, language, pick) => featuresOf(item, language).flatMap(pick)

export const SEARCH_FIELDS = {
  keyword: (item, text, language) => [
    ...LEGACY_COLUMNS(item, text),
    ...inFeatures(item, language, (f) => [f.name, f.description, f.location, f.dates, f.artist]),
  ],
  name: (item, text, language) => [text.name, text.alternate_name, ...inFeatures(item, language, (f) => [f.name])],
  location: (item, text, language) => [text.location, text.province, ...inFeatures(item, language, (f) => [f.location])],
  dynasty: (item, text) => (item.type === 'monument' ? [text.architects, text.dynasty] : text.dynasty),
  artist: (item, text, language) =>
    (item.type === 'monument' ? [text.architects, text.dynasty, ...inFeatures(item, language, (f) => [f.artist])] : text.artist),
  provenance: (item, text) => (item.type === 'monument' ? null : text.provenance),
  material: (item, text) => (item.type === 'monument' ? null : text.materials),
  patron: (item, text) => (item.type === 'monument' ? text.patrons : null),
  other: searchFields().other,
}

// Legacy's relevance (`nn`): the word in the keywords or the working number
// counts twice, in the name or the second name once, and so does the record's
// country when the word names it; a Name or a Location search counts the
// name. A monument found through a special feature in a Keywords search
// ranked that row on its own (the feature's location twice, its name once,
// the country once), and the better of the two rows came first; for Name
// and Location legacy set that rank under a misspelt key, so a feature's
// row counted nothing.
export const SEARCH_SCORE = {
  keyword: (like, item, text, inCountry, language) => Math.max(
    2 * like(text.keywords) + 2 * like(item.mwnf_reference) + like(text.name) + like(text.alternate_name) + (inCountry ? 1 : 0),
    ...featuresOf(item, language)
      .filter((f) => inCountry || like([f.name, f.description, f.location, f.dates, f.artist]))
      .map((f) => 2 * like(f.location) + like(f.name) + (inCountry ? 1 : 0)),
  ),
  name: (like, item, text) => Number(like(text.name)),
  location: (like, item, text) => Number(like(text.name)),
}
// ── The facets of the Permanent Collection ─────────────────────────────────
//
// Countries and institutions by name. A value the reference entity does not
// carry is not offered: the label would be an id.

export const FACETS = {
  country: {
    field: 'country_id',
    label: countryLabel,
    include: (id) => (countries.value ?? []).some((c) => c.id === id),
  },
  partner: {
    field: 'partner_id',
    label: partnerLabel,
    include: (id) => (partners.value ?? []).some((p) => p.id === id),
  },
  // Legacy's Province list (pclist_all.php): each record's own province, as
  // its English row wrote it.
  province: {
    values: (item) => [tr('items', item.id, 'en').province ?? ''].filter(Boolean),
    label: (value) => value,
  },
}

// ── Legacy's dates ──────────────────────────────────────────────────────────
//
// The results page's Start and End Date lists: every quarter century from
// 1500 to 1800, as legacy's pclist_all.php offered them. Legacy filtered only
// when both were picked; one alone takes the list's other end.
export const QUARTER_CENTURIES = Array.from({ length: 13 }, (_, i) => 1500 + 25 * i)

export function dateWindow(filters) {
  if (!filters.begin && !filters.end) return null
  return {
    begin: filters.begin || String(QUARTER_CENTURIES[0]),
    end: filters.end || String(QUARTER_CENTURIES[QUARTER_CENTURIES.length - 1]),
  }
}

// ── The Permanent Collection, as a spec ─────────────────────────────────────
//
// What viewer-layout's `CatalogueResultsView` renders on
// `/permanent-collection/results`: the two facets over every record, as
// legacy offered them, the two years, the standalone date rule,
// chronological order, twenty rows a page, and legacy's count phrased as
// "[N objects, M monuments]". Every text is an entry name; the check that
// every name resolves reads them here.

// The row: the thumbnail, the name, the country, the date and the holder,
// the holder only when the package carries the partner, so a label is
// never an id. Shared with the Timeline gallery (composables/timeline.js).
export const itemRecord = (item) => itemRow(item, ['country', 'dates', 'holder'])

// Legacy's order: `ORDER BY start_date * 1, project, country, partner code,
// number`, a record with no start first (MySQL's NULL), the four keys read
// from the record's legacy key (mwnf3:objects:BAR:cz:Mus11_E:1; the partner
// code without its first two letters, as legacy's SUBSTRING(museum_id, 3)).
const legacyKey = (item) => {
  const [, , project = '', country = '', partner = '', number = '0'] = (item.backward_compatibility ?? '').split(':')
  return { project, country, partner: partner.slice(2), number: Number(number) || 0 }
}
const byText = (a, b) => (a < b ? -1 : a > b ? 1 : 0)
export function legacyOrder(list) {
  const start = (item) => (Number.isFinite(item.start_date) ? item.start_date : -Infinity)
  return [...list].sort((a, b) => {
    const ka = legacyKey(a)
    const kb = legacyKey(b)
    return (start(a) - start(b) || 0)
      || byText(ka.project, kb.project) || byText(ka.country, kb.country)
      || byText(ka.partner, kb.partner) || ka.number - kb.number
  })
}

// Legacy's tile (pclist_all.php): the name; the date, cut at 150 characters,
// and the free-text dynasty; the artist; the holding museum; the location,
// the province and the country's name, each without its ending period.
export function resultTile(item, { tr, renderInline }) {
  const text = tr('items', item.id)
  const plain = (value) => removeEndingPoint(String(value ?? '').replace(/[\r\n]/g, ''))
  let date = String(text.dates ?? '').replace(/[\r\n]/g, '')
  if (date.length > 150) date = `${date.slice(0, 150)}. . .`
  const dates = [date, plain(text.dynasty)].filter(Boolean).join(', ')
  const location = [plain(text.location), plain(text.province), countryLabel(item.country_id)].filter(Boolean).join(', ')
  return {
    id: item.id,
    to: itemRoute(item),
    image: item.images?.[0]?.url ?? '',
    name: renderInline(plain(text.name ?? item.internal_name)),
    lines: [dates ? renderInline(dates) : '', text.artist ? renderInline(plain(text.artist)) : ''].filter(Boolean),
    holder: text.holder ? renderInline(plain(text.holder)) : '',
    location: renderInline(location),
  }
}

export const permanentCollectionResultsSpec = {
  entity: 'items',
  keys: ['country', 'province', 'partner', 'begin', 'end'],
  facets: FACETS,
  facetScope: 'all',
  narrow: (list, filters) => {
    const window = dateWindow(filters)
    return window ? dateRange(list, { ...window, mode: CATALOGUE_DATE_MODE }) : list
  },
  sort: legacyOrder,
  pageSize: CATALOGUE_PAGE_SIZE,
  record: resultTile,
  // The count is in the heading, as legacy's "[N Objects, M Monuments]".
  summary: () => [],
  empty: 'baroqueart.pcr.empty',
}
