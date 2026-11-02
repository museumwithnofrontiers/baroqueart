<script setup>
import { computed } from 'vue'
import { useI18n } from '@museumwnf/viewer-core'
import { StandaloneSponsorList } from '@museumwnf/viewer-layout/standalone'
import { assetMap, sponsorRows } from '../composables/sponsors.js'
import rows from '../legacy/sponsors.json'

// Legacy's Local Sponsors page (atrium_sponsor_detail.php?id=BAR&flg=local),
// the standalone family's list (viewer-layout's `StandaloneSponsorList`):
// one row per sponsor, in legacy's order, with the country label on a
// group's first row ("ITALY/ROME" for an Italian region), then the
// sponsor's region line, name, web address, remarks and logo.
//
// Sponsors are website copy (Pascal, 2026-10-20), not inventory data. The
// rows come from legacy's sponsor tables through the extraction
// (inventory-app scripts/site-i18n), written to src/legacy/sponsors.json as
// `[{ label, region, name, web, remarks, logo }]`: `label` and `remarks`
// Markdown, `logo` the file's path under theme/assets (`sponsors/34.jpg`).

// theme/assets/sponsors, fingerprinted by Vite, keyed as the rows name them.
const logos = assetMap(
  import.meta.glob('../../theme/assets/sponsors/*', { eager: true, query: '?url', import: 'default' }),
  '../../theme/assets/',
)
const sponsors = sponsorRows(rows, logos)

const { t, locale } = useI18n()
const list = (type) => ({ name: 'partners-results', query: { type, lang: locale.value } })
const back = computed(() => [
  { label: t('core.action.back'), history: true },
  { label: t('partner.list.museums'), to: list('museum') },
  { label: t('standalone.partner.others'), to: list('institution') },
])
</script>

<template>
  <StandaloneSponsorList :heading="t('baroqueart.sponsors.localHeading')" :rows="sponsors" :back="back" />
</template>
