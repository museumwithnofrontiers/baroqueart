<script setup>
import { computed } from 'vue'
import { useFacets, useI18n } from '@museumwnf/viewer-core'
import { CatalogueResultsView } from '@museumwnf/viewer-layout/views'
import { StandalonePagination, StandaloneResultsGrid } from '@museumwnf/viewer-layout/standalone'
import { useData } from '../composables/data.js'
import { FACETS, QUARTER_CENTURIES, dateWindow, permanentCollectionResultsSpec } from '../composables/catalogue.js'

// The Permanent Collection results as legacy's pclist_all.php: the way back,
// the heading naming the selection and its count, legacy's tiles with
// "Change your selection" and "Related Content" beside them, and legacy's
// pages under both — the standalone family's results page
// (viewer-layout's `mwnf-standalone-pcr`). The query, the filters and the
// pages are viewer-layout's `CatalogueResultsView` (composables/catalogue.js's
// spec); every word is legacy's own (baroqueart.pcr.*).

const { t, locale } = useI18n()
const { items, countryLabel } = useData()

const options = useFacets(items, FACETS)
const byLabel = (list) => [...(list ?? [])].sort((a, b) => a.label.localeCompare(b.label, locale.value))
const countries = computed(() => byLabel(options.value.country))
// Legacy's provinces: those of the chosen country's records, by name.
function provinces(filters) {
  const list = (items.value ?? []).filter((item) => !filters.country || item.country_id === filters.country)
  const values = new Set(list.flatMap((item) => FACETS.province.values(item)))
  return [...values].sort((a, b) => a.localeCompare(b, locale.value))
}

// Legacy's "[DATE] A.D.".
const ad = (year) => t('baroqueart.pcr.ad').replace('[DATE]', year)

// "Permanent Collection | Czech Republic | Moravia", or "| 1500 A.D. to 1600
// A.D." for a date window.
function selection(filters) {
  const window = dateWindow(filters)
  if (window) return [`${ad(window.begin)} ${t('baroqueart.pcr.to')} ${ad(window.end)}`]
  return [filters.country ? countryLabel(filters.country) : '', filters.province ?? ''].filter(Boolean)
}

// "[49 Objects, 36 Monuments]", each part only when it counts something.
function count(matching) {
  const monuments = matching.filter((item) => item.type === 'monument').length
  const objects = matching.length - monuments
  const parts = []
  if (objects) parts.push(`${objects} ${t('baroqueart.pcr.objects')}`)
  if (monuments) parts.push(`${monuments} ${t('baroqueart.pcr.monuments')}`)
  return parts.length ? `[${parts.join(', ')}]` : ''
}

const isDate = (key) => key === 'begin' || key === 'end'
const picked = (filters, key) => (isDate(key) ? dateWindow(filters)?.[key] ?? '' : filters[key] || '')

// Legacy's lists replaced the selection: a country (its province list then
// its own), a province within the country, or both dates together; a start
// after the end is not taken.
function choose(event, apply, filters, key) {
  const value = event.target.value
  const next = { country: '', province: '', partner: '', begin: '', end: '' }
  if (isDate(key) && value) Object.assign(next, dateWindow({ begin: filters.begin, end: filters.end, [key]: value }))
  else if (key === 'province') Object.assign(next, { country: filters.country ?? '', province: value })
  else next[key] = value
  if (!value || Number(next.begin) > Number(next.end)) {
    event.target.value = picked(filters, key)
    return
  }
  apply(next)
}

const timelineLink = (country) => ({ name: 'timeline-results', query: { country, lang: locale.value } })
</script>

<template>
  <CatalogueResultsView :spec="permanentCollectionResultsSpec" class="mwnf-standalone-pcr">
    <template #before="{ filters, matching }">
      <p class="mwnf-standalone-item__back mwnf-standalone-pcr__back">
        <button type="button" class="mwnf-standalone-item__back-link" @click="$router.back()">{{ t('baroqueart.pcr.back') }}</button>
        <RouterLink class="mwnf-standalone-item__back-link" :to="{ name: 'permanent-collection', query: { lang: locale } }">{{ t('baroqueart.pcr.startPage') }}</RouterLink>
      </p>
      <h3 class="mwnf-standalone-pcr__heading">
        {{ t('baroqueart.pcr.title') }}<template v-for="part in selection(filters)" :key="part"> | <b>{{ part }}</b></template>
        <template v-if="count(matching)">{{ ' ' }}<span class="mwnf-standalone-pcr__count">{{ count(matching) }}</span></template>
      </h3>
    </template>

    <template #records="{ rows, empty }">
      <StandaloneResultsGrid :rows="rows" :see-label="t('baroqueart.pcr.see')" :empty="empty" />
    </template>

    <!-- Legacy's pages run under both columns: drawn after them. -->
    <template #pagination></template>

    <template #aside="{ filters, apply }">
      <form class="mwnf-standalone-pcr__panel" @submit.prevent>
        <p>
          <strong>{{ t('baroqueart.pcr.changeSelection') }}</strong>
          <select :value="picked(filters, 'country')" @change="choose($event, apply, filters, 'country')">
            <option value="">{{ t('baroqueart.pcr.country') }}</option>
            <option v-for="o in countries" :key="o.value" :value="o.value">{{ o.label }}</option>
          </select>
          <select v-if="provinces(filters).length" :value="picked(filters, 'province')" @change="choose($event, apply, filters, 'province')">
            <option value="">{{ t('baroqueart.pcr.province') }}</option>
            <option v-for="p in provinces(filters)" :key="p" :value="p">{{ p }}</option>
          </select>
        </p>
        <p>
          <span class="mwnf-standalone-pcr__date">
            <select :value="picked(filters, 'begin')" @change="choose($event, apply, filters, 'begin')">
              <option value="">{{ t('baroqueart.pcr.startDate') }}</option>
              <option v-for="y in QUARTER_CENTURIES" :key="y" :value="String(y)">{{ ad(y) }}</option>
            </select>
          </span>
          <span class="mwnf-standalone-pcr__date">
            <select :value="picked(filters, 'end')" @change="choose($event, apply, filters, 'end')">
              <option value="">{{ t('baroqueart.pcr.endDate') }}</option>
              <option v-for="y in QUARTER_CENTURIES" :key="y" :value="String(y)">{{ ad(y) }}</option>
            </select>
          </span>
        </p>
      </form>
      <div v-if="filters.country" class="mwnf-standalone-pcr__related">
        <p><strong>{{ t('baroqueart.pcr.related') }}</strong></p>
        <p><RouterLink :to="timelineLink(filters.country)">{{ t('baroqueart.pcr.timeline') }} | {{ countryLabel(filters.country) }}</RouterLink></p>
      </div>
    </template>

    <template #after="{ pageInfo, goToPage }">
      <StandalonePagination
        :page-info="pageInfo"
        :previous-label="t('baroqueart.pcr.previous')"
        :next-label="t('baroqueart.pcr.next')"
        @navigate="goToPage"
      />
    </template>
  </CatalogueResultsView>
</template>
