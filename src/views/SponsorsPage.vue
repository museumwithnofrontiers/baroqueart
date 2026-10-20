<script setup>
// Legacy's Local Sponsors page (atrium_sponsor_detail.php?id=BAR&flg=local):
// one row per sponsor, in legacy's order. A row has the country label (on
// the first row of a country only, "ITALY/ROME" for an Italian region), the
// sponsor's region line and name, its web address, legacy's remarks (in
// italics, as legacy sets them) and its logo.
//
// Sponsors are website copy (Pascal, 2026-10-20), not inventory data. The
// rows come from legacy's sponsor tables through the extraction
// (inventory-app scripts/site-i18n), written to src/legacy/sponsors.json as
// `[{ label, region, name, web, remarks, logo }]`: `label` and `remarks`
// Markdown, `logo` the file's path under theme/assets (`sponsors/34.jpg`).
import { useI18n } from '@museumwnf/viewer-core'
import { assetMap, sponsorRows } from '../composables/sponsors.js'
import { hasText } from '../composables/texts.js'

const extracted = import.meta.glob('../legacy/sponsors.json', { eager: true, import: 'default' })

// theme/assets/sponsors, fingerprinted by Vite, keyed as the rows name them.
const logos = assetMap(
  import.meta.glob('../../theme/assets/sponsors/*', { eager: true, query: '?url', import: 'default' }),
  '../../theme/assets/',
)

const sponsors = sponsorRows(Object.values(extracted)[0], logos)

const { t } = useI18n()
const TITLE = 'baroqueart.sponsors.title'
const HEADING = 'baroqueart.sponsors.localHeading'

function back() {
  window.history.back()
}
</script>

<template>
  <div class="sponsors-page">
    <h1 v-if="hasText(t, TITLE)" class="mwnf-heading">{{ t(TITLE) }}</h1>

    <p class="sponsors-back">
      <a href="#" @click.prevent="back">{{ $t('core.action.back') }}</a>
      <router-link :to="{ name: 'partners-results', query: { type: 'museum' } }">{{ $t('partner.list.museums') }}</router-link>
      <router-link :to="{ name: 'partners-results', query: { type: 'institution' } }">{{ $t('standalone.partner.others') }}</router-link>
    </p>

    <h2 v-if="hasText(t, HEADING)" class="sponsors-heading">{{ t(HEADING) }}</h2>

    <div v-for="(sponsor, index) in sponsors" :key="index" class="sponsors-row">
      <div class="sponsors-row__label" v-html="sponsor.labelHtml"></div>
      <div class="sponsors-row__text">
        <p v-if="sponsor.region">{{ sponsor.region }}</p>
        <p v-if="sponsor.name">{{ sponsor.name }}</p>
        <p v-if="sponsor.web">
          <a :href="`http://${sponsor.web}`" target="_blank" rel="noopener">{{ sponsor.web }}</a>
        </p>
        <div v-if="sponsor.remarksHtml" class="sponsors-row__remarks" v-html="sponsor.remarksHtml"></div>
      </div>
      <div class="sponsors-row__logo">
        <img v-if="sponsor.logoUrl" :src="sponsor.logoUrl" :alt="sponsor.name" />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Legacy's rows: an empty sixth, the country label, then the text and the
   logo in a third each; stacked on a phone. */
.sponsors-back {
  display: flex;
  flex-wrap: wrap;
  gap: 1.25rem;
  font-size: 14px;
}
.sponsors-heading {
  font-size: 19px;
  font-weight: 400;
  color: var(--mwnf-heading-color);
}
.sponsors-row {
  display: grid;
  grid-template-columns: 1fr 1fr 2fr 2fr;
  gap: 1rem;
  padding-block: 0.5rem;
  font-size: 14px;
}
.sponsors-row__label {
  grid-column: 2;
}
.sponsors-row__label :deep(p),
.sponsors-row__text p,
.sponsors-row__remarks :deep(p) {
  margin: 0 0 0.5rem;
}
.sponsors-row__remarks {
  font-style: italic;
}
.sponsors-row__logo img {
  max-width: 100%;
}
@media (max-width: 767px) {
  .sponsors-row {
    grid-template-columns: 1fr;
  }
  .sponsors-row__label {
    grid-column: 1;
  }
}
</style>
