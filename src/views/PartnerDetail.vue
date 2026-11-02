<script setup>
import { computed, watch } from 'vue'
import { useI18n } from '@museumwnf/viewer-core'
import { StandalonePartnerPage } from '@museumwnf/viewer-layout/standalone'
import { useData } from '../composables/data.js'
import { listsAbout, partnerItemsLink, partnerProfileView } from '../composables/partner.js'

// The partner profile as legacy's pm_partner.php: the standalone family's
// page (viewer-layout's `StandalonePartnerPage`), with what is this
// website's: its ways back, its link to the partner's objects or monuments,
// the languages its band offers, and every word legacy's own
// (baroqueart.pp.*, baroqueart.pmi.*).

const props = defineProps({ id: { type: String, required: true } })

const { locale } = useI18n()
const { loadTranslations, partnerById, translations } = useData()

// Legacy's band offered the languages whose text has a description
// (getAvailableLang's `description<>''`): every one the partner carries is
// loaded to tell.
watch(
  () => partnerById.value.get(props.id)?.languages,
  (codes) => (codes ?? []).forEach((code) => loadTranslations('partners', code)),
  { immediate: true },
)
const described = (record, code) => Boolean(translations('partners', code)?.[record.id]?.description)

const list = (type) => ({ name: 'partners-results', query: { type, lang: locale.value } })
const back = () => [
  { label: 'baroqueart.pcr.back', history: true },
  { label: 'baroqueart.pmi.partnerMuseums', to: list('museum') },
  { label: 'baroqueart.pmi.otherPartners', to: list('institution') },
  { label: 'baroqueart.partner.sponsors', to: { name: 'sponsors', query: { lang: locale.value } } },
]

// Legacy named the homepage after the partner's type.
const labels = computed(() => ({
  about: 'baroqueart.pp.about',
  contact: 'baroqueart.pp.contact',
  logo: 'baroqueart.pp.logo',
  homepage: partnerById.value.get(props.id)?.type === 'institution' ? 'baroqueart.pp.institutionHomepage' : 'baroqueart.pp.museumHomepage',
  addresses: 'baroqueart.pp.addresses',
  phone: 'baroqueart.pp.phone',
  fax: 'baroqueart.pp.fax',
  map: 'baroqueart.pp.map',
}))
</script>

<template>
  <StandalonePartnerPage
    :id="id"
    :view="partnerProfileView"
    :back="back"
    :items="partnerItemsLink"
    :about="listsAbout"
    :languages="described"
    :labels="labels"
  />
</template>
