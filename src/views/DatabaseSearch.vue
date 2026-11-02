<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { SEARCH_LANGUAGE_KEY, centuryPresets, useI18n, useSearchLanguage } from '@museumwnf/viewer-core'
import { StandaloneDatabaseForm } from '@museumwnf/viewer-layout/standalone'

// The Database entrance as legacy's database.php, the standalone family's
// form (viewer-layout's `StandaloneDatabaseForm`): three keyword rows, each
// searched in a category, the second and third joined by "and"/"or"; the
// century range; the search language; Go; then the portal's complete
// listing. Go writes the query the results page reads (DatabaseResults.vue,
// composables/search.js). Every word is legacy's own (baroqueart.db.*, its
// translation table).

const router = useRouter()
const { t } = useI18n()
const { languages, language } = useSearchLanguage('items')

const labels = computed(() => ({
  criteria: t('baroqueart.db.criteria'),
  keywords: t('baroqueart.db.keywords'),
  category: t('baroqueart.db.category'),
  in: t('baroqueart.db.in'),
  and: t('baroqueart.db.and'),
  or: t('baroqueart.db.or'),
  date: t('baroqueart.db.date'),
  from: t('baroqueart.db.from'),
  to: t('baroqueart.db.to'),
  language: t('baroqueart.db.language'),
  go: t('baroqueart.db.go'),
  listing: t('baroqueart.db.listing'),
  listingTooltip: t('baroqueart.db.listingTooltip'),
}))

const FIELDS = computed(() => [
  { value: 'keyword', label: t('baroqueart.dbField.keyword') },
  { value: 'name', label: t('baroqueart.dbField.name') },
  { value: 'location', label: t('baroqueart.dbField.location') },
  { value: 'provenance', label: t('baroqueart.dbField.provenance') },
  { value: 'dynasty', label: t('baroqueart.dbField.dynasty') },
  { value: 'patron', label: t('baroqueart.dbField.patron') },
  { value: 'artist', label: t('baroqueart.dbField.artist') },
  { value: 'material', label: t('baroqueart.dbField.material') },
  { value: 'other', label: t('baroqueart.dbField.other') },
])

// Legacy's search languages: those its records are written in, named by
// legacy's `langnames` in English, those the package carries.
const LANGUAGE_NAMES = computed(() => ({
  cs: t('baroqueart.dbLang.cs'),
  de: t('baroqueart.dbLang.de'),
  en: t('baroqueart.dbLang.en'),
  it: t('baroqueart.dbLang.it'),
  pt: t('baroqueart.dbLang.pt'),
}))
const searchLanguages = computed(() =>
  languages.value.filter((code) => code in LANGUAGE_NAMES.value).map((code) => ({ code, name: LANGUAGE_NAMES.value[code] })),
)

const { from: FROM_YEARS, to: TO_YEARS } = centuryPresets()

function go({ rows, from, to }) {
  const query = {}
  rows.forEach((row, index) => {
    if (!row.keyword) return
    const n = index === 0 ? '' : String(index + 1)
    query[`q${n}`] = row.keyword
    query[`field${n}`] = row.field
    if (index) query[`op${n}`] = row.cond
  })
  if (from) query.from = String(from)
  if (to) query.to = String(to)
  if (language.value) query[SEARCH_LANGUAGE_KEY] = language.value
  return router.push({ name: 'database-results', query })
}

const LISTING = 'https://www.museumwnf.org/database_searchform.php'
</script>

<template>
  <StandaloneDatabaseForm
    v-model:language="language"
    :labels="labels"
    :fields="FIELDS"
    :from-years="FROM_YEARS"
    :to-years="TO_YEARS"
    :languages="searchLanguages"
    :listing-href="LISTING"
    @search="go"
  />
</template>
