import {
  CATALOGUE_DATE_MODE, SEARCH_LANGUAGE_KEY, centuryPresets, removeEndingPoint, searchFieldOptions, searchRowKeys,
  useLegacySearch,
} from '@museumwnf/viewer-core'
import { useData } from './data.js'
import { SEARCH_FIELDS, SEARCH_SCORE } from './catalogue.js'

// The search pages: what viewer-layout's `SearchFormView` renders on
// `/database` (the three-row keyword form), and what its
// `CatalogueResultsView` sibling renders on `/database/results` over the
// same field grammar. The row/AND-OR fold, the field grammar, the keyword
// rows and the index are the platform's; what is declared here is only this
// website's: which fields the rows search (`catalogue.js`'s
// `SEARCH_FIELDS`), the refine row's own extra keyword, and legacy's row.

const { countryLabel, itemRoute } = useData()

// ── `/database`: the three-row keyword entrance ────────────────────────────

export const databaseSearchSpec = {
  mode: 'rows',
  fields: searchFieldOptions(SEARCH_FIELDS),
  dates: { presets: centuryPresets() },
  language: 'items',
  target: 'database-results',
}

// ── `/database/results`: the keyword search ────────────────────────────────
//
// `SearchFormView`'s own query keys (`q`/`field`, `q2`/`field2`/`op2`,
// `q3`/`field3`/`op3`, `from`, `to`, `searchlanguage`), read the same way here as the
// form writes them. `q4`/`field4`/`op4` are the refine row's own — the
// site's, not the platform's, since the entrance is always three rows.

// The search is legacy's (decision D3, viewer-core's `useLegacySearch`):
// every language unless one is chosen, the columns database_results.php
// searched, a country's records for a word naming it in Keywords and
// Location, a glossary term's spellings in Keywords, legacy's relevance and
// then the start date. The results page waits for `prepare()`, which loads
// every language searched.
export const databaseSearch = useLegacySearch({
  fields: SEARCH_FIELDS,
  score: SEARCH_SCORE,
  countryFields: ['keyword', 'location'],
  glossaryFields: ['keyword'],
})

export const databaseResultsSpec = {
  entity: 'items',
  keys: [...searchRowKeys(), 'from', 'to', SEARCH_LANGUAGE_KEY],
  narrow: databaseSearch.narrow,
  dates: { mode: CATALOGUE_DATE_MODE, begin: 'from', end: 'to' },
  // The search already put the matches in legacy's order; resorting here
  // would discard it.
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
