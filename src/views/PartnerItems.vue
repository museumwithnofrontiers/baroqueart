<script setup>
import { computed } from 'vue'
import { removeEndingPoint, useI18n } from '@museumwnf/viewer-core'
import { CatalogueResultsView } from '@museumwnf/viewer-layout/views'
import { StandalonePagination, StandaloneResultsGrid } from '@museumwnf/viewer-layout/standalone'
import { useData } from '../composables/data.js'
import { partnerItemsSpec } from '../composables/partner.js'

// A partner's objects or monuments as legacy's pm_museum_items.php and
// pm_institution_items.php: the way back, the partner's name with its city
// and country, the Permanent Collection's tiles with "Partner Profile"
// beside them, and legacy's pages under both — the standalone family's
// partner objects page (viewer-layout's `mwnf-standalone-pmi`). Every word
// is legacy's own (baroqueart.pmi.*, baroqueart.pcr.*).

const props = defineProps({ id: { type: String, required: true } })

const { t, locale } = useI18n()
const { countryLabel, partnerById, tr } = useData()

const partner = computed(() => partnerById.value.get(props.id) ?? null)
const spec = computed(() => partnerItemsSpec(props.id, partner.value?.type))
const text = computed(() => tr('partners', props.id))
// "Brno, Czech Republic": the city, then the country.
const place = computed(() =>
  [removeEndingPoint(text.value.city ?? ''), partner.value?.country_id ? countryLabel(partner.value.country_id) : '']
    .filter(Boolean)
    .join(', '),
)

const list = (type) => ({ name: 'partners-results', query: { type, lang: locale.value } })
// Legacy's links back: the two partner lists and the Sponsors page.
const backLinks = computed(() => [
  { label: t('baroqueart.pmi.partnerMuseums'), to: list('museum') },
  { label: t('baroqueart.pmi.otherPartners'), to: list('institution') },
  { label: t('baroqueart.partner.sponsors'), to: { name: 'sponsors', query: { lang: locale.value } } },
])
</script>

<template>
  <CatalogueResultsView :spec="spec" class="mwnf-standalone-pcr mwnf-standalone-pmi">
    <template #before>
      <p class="mwnf-standalone-item__back mwnf-standalone-pcr__back">
        <button type="button" class="mwnf-standalone-item__back-link" @click="$router.back()">{{ t('baroqueart.pcr.back') }}</button>
        <RouterLink v-for="link in backLinks" :key="link.label" class="mwnf-standalone-item__back-link" :to="link.to">{{ link.label }}</RouterLink>
      </p>
      <div class="mwnf-standalone-pmi__heading">
        <h3 class="mwnf-standalone-pcr__heading">{{ removeEndingPoint(text.name ?? partner?.internal_name ?? '') }}</h3>
        <p><i>{{ place }}</i></p>
      </div>
    </template>

    <template #records="{ rows, empty }">
      <StandaloneResultsGrid :rows="rows" :see-label="t('baroqueart.pcr.see')" :empty="empty" />
    </template>

    <!-- Legacy's pages run under both columns: drawn after them. -->
    <template #pagination></template>

    <template #aside>
      <div class="mwnf-standalone-pcr__related">
        <p><RouterLink :to="{ name: 'partner', params: { id }, query: { lang: locale } }">{{ t('baroqueart.pmi.profile') }}</RouterLink></p>
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
