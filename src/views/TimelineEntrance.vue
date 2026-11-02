<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from '@museumwnf/viewer-core'
import { StandaloneTimelineEntrance } from '@museumwnf/viewer-layout/standalone'
import { dateOptions, entranceCountries } from '../composables/timeline.js'

// The Timeline entrance as legacy's hcr_home.php, the standalone family's
// (viewer-layout's `StandaloneTimelineEntrance`): the country, the start and
// end centuries, Go. Go writes the query the results page reads
// (composables/timeline.js). Every word is legacy's own (baroqueart.tl.*);
// the alerts are the ones legacy's page script wrote, in English.

const router = useRouter()
const { t } = useI18n()

const labels = computed(() => ({
  selectCountry: t('baroqueart.tl.selectCountry'),
  allCountries: t('baroqueart.tl.allCountries'),
  startDate: t('baroqueart.tl.startDate'),
  endDate: t('baroqueart.tl.endDate'),
  go: t('baroqueart.db.go'),
}))
const alerts = computed(() => ({
  country: t('baroqueart.tl.alertCountry'),
  countryOrDates: t('baroqueart.tl.alertCountryOrDates'),
  startDate: t('baroqueart.tl.alertStartDate'),
  endDate: t('baroqueart.tl.alertEndDate'),
  period: t('baroqueart.tl.alertPeriod'),
}))
const dates = computed(() => dateOptions(t))

function go({ country, start, end }) {
  return router.push({ name: 'timeline-results', query: { country, start: String(start), end: String(end) } })
}
</script>

<template>
  <StandaloneTimelineEntrance
    :labels="labels"
    :alerts="alerts"
    :countries="entranceCountries()"
    :starts="dates.starts"
    :ends="dates.ends"
    @search="go"
  />
</template>
