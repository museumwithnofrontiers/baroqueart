<script setup>
import { timelineLinkFor, useI18n } from '@museumwnf/viewer-core'
import { OnDisplayIn, PartnerPanel, RelatedMedia, SpecialFeatures } from '@museumwnf/viewer-layout/content'
import { StandaloneItemSheet } from '@museumwnf/viewer-layout/standalone'
import { useData } from '../composables/data.js'
import { exhibitionLinksForItem, minisiteHref } from '../composables/exhibitions.js'
import { partnerViewOf } from '../composables/partner.js'
import { itemSheetSpec } from '../composables/sheet.js'

// The item sheet: legacy database_item.php in its three columns, the
// standalone family's `StandaloneItemSheet` over the spec in
// composables/sheet.js. What is this website's fills its slots: the holding
// museum's partner line in the sheet, a monument's special features under
// it, and, in the Related Content column, legacy's blocks in legacy's order
// — the timeline for this item, the related videos, then where the item is
// on display (the exhibitions and the THG galleries).

defineProps({ id: { type: String, required: true } })

const { mdInline, partnerById, tr } = useData()
const { locale } = useI18n()

const timelineLink = (record) => timelineLinkFor(record, { name: 'timeline-results' })

// The way back, as legacy's breadcrumbs: the previous page, then the
// collection's start page.
const back = [
  { label: 'baroqueart.item.back', history: true },
  { label: 'baroqueart.item.collectionStart', to: { name: 'permanent-collection' } },
]

// Related Content's own parts: the related records by type, and Download:
// the browser's print ("As PDF") and legacy's export.php ("As Word"), the
// sheet's texts as a .doc named after the record's legacy key and language
// (object;BAR;hu;Mus11;22;en → object_BAR_hu_Mus11_22_en.doc).
const wordFile = (record, language) => {
  const [, table, ...key] = String(record?.backward_compatibility ?? '').split(':')
  const type = { objects: 'object', monuments: 'monument' }[table] ?? 'item'
  return `${[type, ...key, language].join('_')}.doc`
}

const related = {
  heading: 'baroqueart.item.relatedContent',
  groups: [
    { heading: 'baroqueart.item.relatedObjects', type: 'object' },
    { heading: 'baroqueart.item.relatedMonuments', type: 'monument' },
  ],
  download: {
    heading: 'baroqueart.item.download',
    print: 'baroqueart.item.asPdf',
    word: 'baroqueart.item.asWord',
    title: 'baroqueart.item.wordTitle',
    wordFile,
  },
}

// The holding museum (decision D3, inventory-app#2035): the item's holder
// text, then the partner it refers to as `PartnerPanel`'s summary — "About
// {name}, {city}, {country}", linked to the partner's page. Legacy showed
// no such link for an associated museum (`associated_museums`, the
// package's `level: 'associated_partner'`), and neither does this page.
function holderPartner(record, language) {
  const partner = partnerById.value.get(record.partner_id)
  if (!partner || partner.level === 'associated_partner') return null
  return partnerViewOf(partner, tr('partners', partner.id, language))
}

// Each exhibition page that places the item, on the exhibition's own website
// (its mini-site), in the site's language.
const onDisplayInGroups = (record) => [{
  links: exhibitionLinksForItem(record.id).map((l) => ({
    label: mdInline(l.label),
    href: minisiteHref(l.exhibitionId, locale.value, l.at) ?? undefined,
  })),
}]

// The THG galleries, by name: the package carries no address for them yet,
// and the legacy page's same-page anchors lead nowhere in this one.
const thgGalleryGroups = (record) => [{
  links: (record.thg_galleries ?? []).map((g) => ({ id: g.name, label: mdInline(g.name) })),
}]
</script>

<template>
  <StandaloneItemSheet :spec="itemSheetSpec" :id="id" :back="back" :related="related">
    <template #holder="{ row, record, language, dir, glossary }">
      <span v-html="mdInline(row.value, { glossary })"></span>
      <PartnerPanel
        v-if="holderPartner(record, language)"
        variant="summary"
        :partner="holderPartner(record, language)"
        label="partner.info.about"
        :dir="dir"
      />
    </template>

    <template #after-sheet="{ record, language, dir, glossary }">
      <SpecialFeatures
        :features="record.details ?? []"
        :tr="(feature) => tr('items', feature.id, language)"
        :language="language"
        :glossary="glossary"
        :dir="dir"
        :picture-limit="6"
      />
    </template>

    <template #sidebar="{ record, language, dir }">
      <p v-if="timelineLink(record)" class="baroqueart-timeline-link">
        <RouterLink :to="timelineLink(record)">{{ $t('baroqueart.item.timeline') }}</RouterLink>
      </p>
      <RelatedMedia :media="record.media ?? []" :language="language" heading="baroqueart.item.relatedVideos" :dir="dir" />
      <div v-if="onDisplayInGroups(record)[0].links.length || thgGalleryGroups(record)[0].links.length" class="baroqueart-on-display">
        <br><p><strong><u>{{ $t('baroqueart.item.onDisplayIn') }}</u></strong></p>
      </div>
      <OnDisplayIn heading="baroqueart.item.exhibitions" :groups="onDisplayInGroups(record)" :dir="dir" />
      <OnDisplayIn heading="baroqueart.item.galleries" :groups="thgGalleryGroups(record)" :dir="dir" />
    </template>
  </StandaloneItemSheet>
</template>

<style scoped>
/* Legacy's "On display in": a line of the column's text, then the words on
   their own line, 16px under the block before them and 10px over the
   exhibitions (Baroque Art's template drew it as a block, Islamic Art's as a
   paragraph). */
.baroqueart-on-display {
  margin: 16px 0 10px;
}
</style>
