import { computed } from 'vue'
import {
  CATALOGUE_DATE_MODE, SEARCH_LANGUAGE_KEY, centuryPresets, removeEndingPoint, searchFieldOptions, searchRowKeys, useFacets,
  useFieldSearch,
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

const { countryLabel, itemRoute, items } = useData()

// ── `/database`: the three-row keyword entrance ────────────────────────────

export const databaseSearchSpec = {
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

export const permanentCollectionSearchSpec = computed(() => ({
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
// `q3`/`field3`/`op3`, `from`, `to`, `searchlanguage`), read the same way here as the
// form writes them. `q4`/`field4`/`op4` are the refine row's own — the
// site's, not the platform's, since the entrance is always three rows.

const { narrow } = useFieldSearch({ fields: SEARCH_FIELDS })

export const databaseResultsSpec = {
  entity: 'items',
  keys: [...searchRowKeys(), 'from', 'to', SEARCH_LANGUAGE_KEY],
  narrow,
  dates: { mode: CATALOGUE_DATE_MODE, begin: 'from', end: 'to' },
  // Already ranked by `narrow` (`rank: 'hits'`) — a second, chronological
  // sort here would undo it.
  sort: false,
  // Legacy's twelve a page.
  pageSize: 12,
  record: databaseRow,
  // The count is in the heading, as legacy's "| 88 records".
  summary: () => [],
  empty: 'baroqueart.dbr.empty',
}

// Legacy's row (database_results.php): the name and the location with the
// country's name; the date, cut at 145 characters past 150, and the
// free-text dynasty. Its preview: the date line uncut, an object's holding
// museum, and the location, the province and the country.
export function databaseRow(item, { tr, renderInline }) {
  const text = tr('items', item.id)
  const plain = (value) => removeEndingPoint(String(value ?? '').replace(/[\r\n]/g, ''))
  const date = plain(text.dates)
  const listed = String(text.dates ?? '').length > 150 ? `${date.slice(0, 145)}...` : date
  const dynasty = plain(text.dynasty)
  const country = countryLabel(item.country_id)
  const line = (...parts) => renderInline(parts.filter(Boolean).join(', '))
  return {
    id: item.id,
    to: itemRoute(item),
    image: item.images?.[0]?.url ?? '',
    name: renderInline(plain(text.name ?? item.internal_name)),
    place: line(plain(text.location), country),
    dates: line(listed, dynasty),
    preview: {
      lines: [line(date, dynasty)],
      holder: item.type === 'object' && text.holder ? renderInline(plain(text.holder)) : '',
      location: line(plain(text.location), plain(text.province), country),
    },
  }
}
