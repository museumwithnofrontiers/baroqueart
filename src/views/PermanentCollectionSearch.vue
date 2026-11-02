<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { I18nText, useFacets, useI18n } from '@museumwnf/viewer-core'
import { useData } from '../composables/data.js'
import { FACETS, QUARTER_CENTURIES } from '../composables/catalogue.js'

// The Permanent Collection entrance as legacy's pc_entrance.php, the
// standalone family's (viewer-layout's `mwnf-standalone-pc`): "Sort by" and
// its lists on the left, each opening the results as soon as a value is
// picked (legacy's onchange submits), and "About" with legacy's text on the
// right. Every word is legacy's own (baroqueart.pc.*, baroqueart.pcr.*); the
// lists' values are the records' own.

const { items } = useData()
const { t, locale } = useI18n()
const router = useRouter()
const options = useFacets(items, FACETS)

const countries = computed(() => [...(options.value.country ?? [])].sort((a, b) => a.label.localeCompare(b.label, locale.value)))

// Legacy's "[DATE] A.D.".
const ad = (year) => t('baroqueart.pcr.ad').replace('[DATE]', year)

function open(key, value) {
  if (value) router.push({ name: 'permanent-collection-results', query: { [key]: String(value), lang: locale.value } })
}

// Legacy's Partners list led to its partner museums.
function openPartners(value) {
  if (value === 'BAR') router.push({ name: 'partners-results', query: { type: 'museum', lang: locale.value } })
}
</script>

<template>
  <div class="mwnf-standalone-pc">
    <div class="mwnf-standalone-pc__lists">
      <h3 class="mwnf-standalone-pc__heading">{{ t('baroqueart.pc.sortBy') }}</h3>
      <p>
        <select @change="open('country', $event.target.value)">
          <option value="">{{ t('baroqueart.pcr.country') }}</option>
          <option v-for="o in countries" :key="o.value" :value="o.value">{{ o.label }}</option>
        </select>
      </p>
      <p>
        <select @change="openPartners($event.target.value)">
          <option value="">{{ t('baroqueart.pc.partners') }}</option>
          <option value="BAR">{{ t('baroqueart.pc.partnersBar') }}</option>
        </select>
      </p>
      <p>
        <select @change="open('begin', $event.target.value)">
          <option value="">{{ t('baroqueart.pcr.startDate') }}</option>
          <option v-for="y in QUARTER_CENTURIES" :key="y" :value="y">{{ ad(y) }}</option>
        </select>
      </p>
      <p>
        <select @change="open('end', $event.target.value)">
          <option value="">{{ t('baroqueart.pcr.endDate') }}</option>
          <option v-for="y in QUARTER_CENTURIES" :key="y" :value="y">{{ ad(y) }}</option>
        </select>
      </p>
    </div>
    <div class="mwnf-standalone-pc__about">
      <h3 class="mwnf-standalone-pc__heading">{{ t('baroqueart.pc.about') }}</h3>
      <I18nText tag="div" keypath="baroqueart.pc.text" />
    </div>
  </div>
</template>
