<script setup>
import { computed } from 'vue'
import { mwnfLinks, useI18n } from '@museumwnf/viewer-core'
import { StandalonePartnersEntrance } from '@museumwnf/viewer-layout/standalone'

// Discover Baroque Art's Partners entrance, legacy's partners.php (the menu's
// Partners): the project's box, its About text (4:PartnerMuseumIntro_DBA) and
// links. Every word is legacy's own (baroqueart.partner.*, its translation
// table and the project's name).

const { t } = useI18n()
const projects = computed(() => [
  {
    name: t('baroqueart.partner.projectName'),
    about: t('baroqueart.partner.about'),
    links: [
      { label: t('baroqueart.partner.museums'), to: { name: 'partners-results', query: { type: 'museum' } } },
      { label: t('baroqueart.partner.others'), to: { name: 'partners-results', query: { type: 'institution' } } },
      { label: t('baroqueart.partner.sponsors'), to: { name: 'sponsors' } },
      { label: t('core.footer.credits'), href: mwnfLinks.credits },
    ],
  },
])
</script>

<template>
  <StandalonePartnersEntrance :projects="projects" :about-label="t('baroqueart.partner.aboutLink')" :close-label="t('core.action.close')" />
</template>
