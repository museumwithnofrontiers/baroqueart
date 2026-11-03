import { CATALOGUE_PAGE_SIZE } from '@museumwnf/viewer-core'
import { useData } from './data.js'
import { QUARTER_CENTURIES, galleryTile, legacyOrder } from './catalogue.js'

// The Timeline, as legacy's hcr_home.php, hcr_result.php and hcr_gallery.php
// read it, drawn by viewer-layout's standalone family (TimelineEntrance.vue,
// TimelineResults.vue, TimelineGallery.vue). What is declared here is only
// this website's: which events a search finds and in what order, the lists
// the pages offer, the line that says the search in words, and the records
// the gallery shows. Every word is legacy's own (baroqueart.tl.*, its
// translation table).
//
// The query: `country` (`none` when no country was chosen, empty for all
// countries) and `start`/`end` (`none` for a list left on its first entry),
// as legacy's own lists sent them; `page` for the results' pages. The item
// sheet and the dynasty pages link with `begin` for the start and
// `country=all`, which read the same.

const { countryLabel, items, md, timelineEvents, tr } = useData()

/** Legacy's period when a date was left on its first entry. */
const DEFAULT_START = 1500
const DEFAULT_END = 1800

/** Fifteen events a page, as hcr_result.php showed them. */
export const EVENTS_PAGE_SIZE = 15

const chosen = (value) => value !== undefined && value !== null && value !== '' && value !== 'none'

/** The search a query stands for: the country (empty for all) and the period. */
export function timelineQuery(query) {
  return {
    country: query.country === 'all' ? '' : query.country ?? '',
    start: query.start ?? query.begin ?? 'none',
    end: query.end ?? 'none',
  }
}

export function timelineSearch(raw) {
  const query = timelineQuery(raw)
  return {
    country: query.country,
    start: chosen(query.start) ? Number(query.start) : DEFAULT_START,
    end: chosen(query.end) ? Number(query.end) : DEFAULT_END,
  }
}

/** "[DATE] A.D.", legacy's `AD` word, for a year. */
export const yearLabel = (t, year) => t('baroqueart.tl.ad').replace('[DATE]', String(year))

// HCRList::Search: an event with an end runs into the period, one without
// falls inside it, both bounds left open; the country, when one is chosen;
// in order of its first year.
export function findEvents(search) {
  const { country, start, end } = search
  return (timelineEvents.value ?? [])
    .filter((event) => {
      const from = Number(event.year_from) || 0
      const to = Number(event.year_to) || 0
      const inPeriod = to ? to > start && from < end : from > start && from < end
      return inPeriod && (!country || event.country_id === country)
    })
    .sort((a, b) => (a.year_from - b.year_from) || (a.display_order - b.display_order))
}

/** An event as hcr_result.php printed it: its years, its country, its description. */
export function eventRow(event, t) {
  const text = tr('timeline_events', event.id)
  let years = event.year_from ? String(event.year_from) : ''
  if (event.year_to) years += ` - ${event.year_to}`
  return {
    id: event.id,
    date: yearLabel(t, years),
    country: event.country_id ? countryLabel(event.country_id) : '',
    html: text.description ? md(text.description) : '',
  }
}

// The countries, by name. The entrance lists those with events and Discover
// Baroque Art objects, as legacy's query did; the results page every
// country with events.
const byName = (list) => [...list].sort((a, b) => a.label.localeCompare(b.label))
const eventCountries = () => new Set((timelineEvents.value ?? []).map((event) => event.country_id).filter(Boolean))

export function entranceCountries() {
  const withObjects = new Set((items.value ?? []).filter((item) => item.type === 'object').map((item) => item.country_id))
  return byName([...eventCountries()].filter((id) => withObjects.has(id)).map((id) => ({ value: id, label: countryLabel(id) })))
}

export function resultCountries() {
  return byName([...eventCountries()].map((id) => ({ value: id, label: countryLabel(id) })))
}

/** The start and end lists: legacy's quarter centuries, 1500 to 1800, the same on both. */
export function dateOptions(t) {
  const list = QUARTER_CENTURIES.map((year) => ({ value: year, label: yearLabel(t, year) }))
  return { starts: list, ends: list }
}

// hcr_result.php's line over the lists: the period, then the country in
// capitals, or all countries.
export function searchLine(search, t) {
  const country = search.country ? countryLabel(search.country) : t('baroqueart.tl.allCountries')
  return `${yearLabel(t, search.start)} to ${yearLabel(t, search.end)} | ${country.toUpperCase()}`
}

// export_hcr_content.php: its line ("TIMELINE | 1600 to 1700 | ITALY") and
// its file's name.
export function wordLine(search, t) {
  const country = search.country ? countryLabel(search.country) : t('baroqueart.tl.allCountries')
  return `${t('baroqueart.tl.title').toUpperCase()} | ${search.start} to ${search.end} | ${country.toUpperCase()}`
}
export const wordFile = (search) => `DBA_${search.country}-${search.start}-${search.end}-en.doc`

// hcr_gallery.php: the objects and monuments dated inside the period, in
// the country when one is chosen, in legacy's order (the start, then the
// end, then the record's key), twenty a page.
const galleryScope = (search) => (item) =>
  (!search.country || item.country_id === search.country)
  && Number.isFinite(item.start_date) && item.start_date >= search.start
  && Number.isFinite(item.end_date) && item.end_date <= search.end

export function galleryItems(search) {
  return (items.value ?? []).filter(galleryScope(search))
}

const galleryOrder = (list) =>
  legacyOrder(list).sort((a, b) => (a.start_date - b.start_date) || (a.end_date - b.end_date))

export function gallerySpec(search) {
  return {
    entity: 'items',
    keys: [],
    scope: galleryScope(search),
    sort: galleryOrder,
    pageSize: CATALOGUE_PAGE_SIZE,
    record: galleryTile,
    summary: () => [],
    empty: 'baroqueart.tl.empty',
  }
}

// ── hcr.php: the item's timeline window ─────────────────────────────────────

/** Whether the sheet offers the window: legacy's, when the item's country has events. */
export function hasEvents(country) {
  return Boolean(country) && (timelineEvents.value ?? []).some((event) => event.country_id === country)
}

// The window's search: the country and century it was changed to, else the
// item's own country and dates; a chosen century runs a hundred years.
export function itemTimelineSearch(item, query) {
  const country = query.country || item?.country_id || ''
  if (chosen(query.start)) return { country, start: Number(query.start), end: Number(query.start) + 100 }
  return { country, start: Number(item?.start_date) || 0, end: Number(item?.end_date) || 0 }
}

// Its time range: the country's centuries, from its earliest event's to
// the period, the period itself, then on from the period's end to its last
// event, each "1400 - 1500 A.D.", as legacy listed them.
export function rangeOptions(search, t) {
  const years = (timelineEvents.value ?? [])
    .filter((event) => event.country_id === search.country)
    .map((event) => Number(event.year_from) || 0)
  const min = years.length ? Math.min(...years) : 0
  const max = years.length ? Math.max(...years) : 0
  const option = (value, from, to) => ({ value, label: yearLabel(t, `${from} - ${to}`) })
  const list = []
  let year = Math.floor(min / 100) * 100
  while (year + 100 < search.start) {
    list.push(option(year, year, year + 100))
    year += 100
  }
  list.push(option(year, year, search.start))
  list.push(option(search.start, search.start, search.end))
  for (year = search.end; year < max; year += 100) list.push(option(year, year, year + 100))
  return list
}
