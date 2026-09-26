import { CATALOGUE_DATE_MODE, CATALOGUE_PAGE_SIZE, objectsAndMonumentsSummary, searchFields } from '@museumwnf/viewer-core'
import { useData } from './data.js'

// The catalogue spec: what this website's lists filter and search on. The
// engine — query state, options, dates, pages, the keyword grammar, the
// fields of the legacy search form, the result row — is viewer-core's
// catalogue layer and viewer-layout's views; what is declared here is only
// what is this website's: the two facets of the Permanent Collection, and
// the `permanentCollectionResultsSpec` that composes them for viewer-layout's
// `CatalogueResultsView`. Two entrances and two results pages read this one
// declaration.

const { countries, countryLabel, itemRow, partnerLabel, partners } = useData()

// The eight fields of database.php: no period/dynasty on this site. Decision
// D3's country expansion reads the raw ids the keyword and location fields
// carry.
export const SEARCH_FIELDS = searchFields()

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

export const permanentCollectionResultsSpec = {
  entity: 'items',
  keys: ['country', 'partner', 'begin', 'end'],
  facets: FACETS,
  facetScope: 'all',
  controls: [
    { key: 'country', label: 'catalogue.facet.country', anyLabel: 'catalogue.facet.any' },
    { key: 'partner', label: 'catalogue.facet.holdingInstitution', anyLabel: 'catalogue.facet.any' },
    { key: 'begin', type: 'year', label: 'catalogue.facet.fromYear', placeholder: 'timeline.form.fromYearHint' },
    { key: 'end', type: 'year', label: 'catalogue.facet.toYear', placeholder: 'timeline.form.toYearHint' },
  ],
  filterMode: 'apply',
  filterTitle: 'catalogue.filter.heading',
  dates: { mode: CATALOGUE_DATE_MODE },
  sort: 'chronological',
  pageSize: CATALOGUE_PAGE_SIZE,
  variant: 'list',
  recordRoute: 'item',
  empty: 'catalogue.results.noResultsFilter',
  pagination: { window: 7 },
  record: itemRecord,
  summary: objectsAndMonumentsSummary,
}
