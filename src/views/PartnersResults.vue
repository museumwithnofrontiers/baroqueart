<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from '@museumwnf/viewer-core'
import { StandalonePartnerList } from '@museumwnf/viewer-layout/standalone'
import { partnerListGroups } from '../composables/partner.js'

// Discover Baroque Art's partner museums or institutions as legacy's
// pm_partner_list.php, the standalone family's list (viewer-layout's
// `StandalonePartnerList`): Back, the other list and the Sponsors page, the
// two headings, then one row a country. Every word is legacy's own
// (baroqueart.pl.*, baroqueart.pmi.*).

const route = useRoute()
const { t, locale } = useI18n()

const type = computed(() => (route.query.type === 'institution' ? 'institution' : 'museum'))
const museums = computed(() => type.value === 'museum')

const groups = computed(() =>
  partnerListGroups(type.value).map((group) => ({
    ...group,
    main: group.main.map((p) => ({ ...p, to: { ...p.to, query: { lang: locale.value } } })),
    associated: group.associated.map((p) => ({ ...p, to: { ...p.to, query: { lang: locale.value } } })),
  })),
)

const list = (other) => ({ name: 'partners-results', query: { type: other, lang: locale.value } })
const back = computed(() => [
  { label: t('baroqueart.pcr.back'), history: true },
  museums.value
    ? { label: t('baroqueart.pmi.otherPartners'), to: list('institution') }
    : { label: t('baroqueart.pmi.partnerMuseums'), to: list('museum') },
  { label: t('baroqueart.partner.sponsors'), to: { name: 'sponsors', query: { lang: locale.value } } },
])
const heads = computed(() =>
  museums.value
    ? [t('baroqueart.pmi.partnerMuseums'), t('baroqueart.pl.associatedMuseums')]
    : [t('baroqueart.pmi.otherPartners'), t('baroqueart.pl.associatedInstitutions')],
)
</script>

<template>
  <StandalonePartnerList
    :type="type"
    :groups="groups"
    :back="back"
    :heads="heads"
    :see-associated="t('baroqueart.pl.seeAssociated')"
    :no-associated="t('baroqueart.pl.noAssociated')"
  />
</template>
