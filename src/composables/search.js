import { computed } from 'vue'
import {
  CATALOGUE_DATE_MODE, CATALOGUE_PAGE_SIZE, centuryPresets, searchFieldOptions, searchRowKeys, searchSummary, useFacets, useFieldSearch,
} from '@museumwnf/viewer-core'
import { useData } from './data.js'
import { FACETS, SEARCH_FIELDS } from './catalogue.js'

// The search pages: what viewer-layout's `SearchFormView` renders on
// `/database` (the three-row keyword form) and `/permanent-collection`
// (the one-filter-at-a-time radio form), and what its `CatalogueResultsView`
// sibling renders on `/database/results` over the same field grammar. The
// row/AND-OR fold, the facet derivation, the field grammar, the keyword rows,
// the index and the "searched for" line are the platform's; what is declared
// here is only this website's: which fields the rows search (`catalogue.js`'s
// `SEARCH_FIELDS`), and the refine row's own extra keyword.

const { items, itemRow } = useData()

// ── `/database`: the three-row keyword entrance ────────────────────────────

export const searchEntrance = {
  mode: 'rows',
  fields: searchFieldOptions(SEARCH_FIELDS),
  dates: { presets: centuryPresets() },
  language: 'items',
  target: 'database-results',
}

// ── `/permanent-collection`: one filter at a time ──────────────────────────
//
// The country/holding-institution options are the same derivation the
// Permanent Collection results page's own facets use (`catalogue.js`'s
// `FACETS`) — a value the reference entity does not carry is not offered.

const pcFacetOptions = useFacets(items, FACETS)

export const permanentCollectionSearch = computed(() => ({
  mode: 'radio',
  facets: [
    { key: 'country', label: 'catalogue.facet.country', options: pcFacetOptions.value.country },
    { key: 'partner', label: 'catalogue.facet.holdingInstitution', options: pcFacetOptions.value.partner },
    { key: 'begin', label: 'catalogue.facet.startDate', type: 'year' },
    { key: 'end', label: 'catalogue.facet.endDate', type: 'year' },
  ],
  target: 'permanent-collection-results',
}))

// ── `/database/results`: the keyword search ────────────────────────────────
//
// `SearchFormView`'s own query keys (`q`/`field`, `q2`/`field2`/`op2`,
// `q3`/`field3`/`op3`, `from`, `to`, `lang`), read the same way here as the
// form writes them. `q4`/`field4`/`op4` are the refine row's own — the
// site's, not the platform's, since the entrance is always three rows.

const { narrow } = useFieldSearch({ fields: SEARCH_FIELDS })

export const searchResults = {
  entity: 'items',
  keys: [...searchRowKeys(), 'from', 'to', 'lang'],
  narrow,
  dates: { mode: CATALOGUE_DATE_MODE, begin: 'from', end: 'to' },
  // Already ranked by `narrow` (`rank: 'hits'`) — a second, chronological
  // sort here would undo it.
  sort: false,
  pageSize: CATALOGUE_PAGE_SIZE,
  variant: 'list',
  recordRoute: 'item',
  filterMode: 'apply',
  empty: 'catalogue.results.noResultsSearch',
  pagination: { window: 7 },
  // Legacy database_results.php's own row: the country, the date and the
  // location, distinct from the Permanent Collection's.
  record: (item) => itemRow(item, ['country', 'dates', 'location']),
  summary: (ctx) => searchSummary(ctx),
}
