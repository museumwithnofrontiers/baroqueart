<script setup>
import { computed } from 'vue'
import { renderBlock, useI18n } from '@museumwnf/viewer-core'
import { useRouter } from 'vue-router'
import { creditTexts } from '../composables/credits.js'
import rows from '../legacy/credits.json'

// Legacy's own credits page (mwnf_credit.php), which no menu entry opens:
// other MWNF sites link to it. Its back link, then its text in legacy's
// centred column, each role beside its people as legacy's Bootstrap columns
// set them. The text is legacy's, extracted (inventory-app scripts/site-i18n)
// one entry per column; src/legacy/credits.json lists them row by row as
// `[[{ entry, md, sm, lead }]]`, each column's width of 12 from 992px (`md`)
// and from 768px (`sm`). Below 768px every column takes the full width,
// legacy's `col-xs-12`. A column with no text has no entry. `lead` counts the
// line breaks legacy puts over a column's paragraph, outside it: lines in the
// column's own font, which legacy leaves the browser's default.
//
// Legacy prints the page twice on a phone: the copy it means for small
// screens opens inside a comment, so neither is hidden. This page prints it
// once.

const { t } = useI18n()
const router = useRouter()
const texts = computed(() => creditTexts(t))
const html = (column) => (column.entry ? renderBlock(texts.value[column.entry]) : '')
</script>

<template>
  <p class="mwnf-standalone-item__back baroqueart-credits__back">
    <button type="button" class="mwnf-standalone-item__back-link" @click="router.back()">{{ t('baroqueart.item.back') }}</button>
  </p>
  <article class="mwnf-standalone-page baroqueart-credits">
    <div v-for="(row, r) in rows" :key="r" class="baroqueart-credits__row">
      <div v-for="(column, c) in row" :key="c" class="baroqueart-credits__column" :style="{ '--md': column.md, '--sm': column.sm }">
        <div v-if="column.lead" class="baroqueart-credits__lead"><br v-for="n in column.lead" :key="n" /></div>
        <div class="mwnf-standalone-page__body" v-html="html(column)"></div>
      </div>
    </div>
  </article>
</template>

<style scoped>
/* Legacy's back link: its row 22px high, the link's text 1px down in it,
   then 15px to the text's row. */
.baroqueart-credits__back {
  min-height: 22px;
  margin: 0 0 15px;
  padding-top: 1px;
  line-height: normal;
  align-items: flex-start;
}

/* Bootstrap's twelve columns and their 30px gutters. */
.baroqueart-credits__row {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  column-gap: 30px;
}

.baroqueart-credits__column {
  grid-column: span 12;
}

/* Phone: one column under another, each with legacy's col-xs 15px under it. */
@media (max-width: 47.9375rem) {
  .baroqueart-credits__column {
    margin-bottom: 15px;
  }
}

@media (min-width: 48rem) {
  .baroqueart-credits__column {
    grid-column: span var(--sm);
  }
}

@media (min-width: 62rem) {
  .baroqueart-credits__column {
    grid-column: span var(--md);
  }
}

/* The browser's default font, which legacy's columns keep. */
.baroqueart-credits__lead {
  font: 16px/normal 'Times New Roman', serif;
}

/* The heading's second line: legacy's <br/> in its h3, which Markdown
   cannot keep in a heading, so the line follows as a paragraph. */
.baroqueart-credits :deep(h3 + p),
.baroqueart-credits :deep(h3 + p:not(:last-child)) {
  margin: -15px 0 15px;
  font-size: var(--mwnf-standalone-page-heading-size, 1.1875rem);
  line-height: normal;
}

/* On a phone the heading keeps 5px under it. */
@media (max-width: 47.9375rem) {
  .baroqueart-credits :deep(h3 + p),
  .baroqueart-credits :deep(h3 + p:not(:last-child)) {
    margin: -5px 0 5px;
  }
}
</style>
