<script setup>
import { useRouter } from 'vue-router'
import { I18nText, useI18n } from '@museumwnf/viewer-core'
import { hasText } from '../composables/texts.js'

const router = useRouter()
const { t } = useI18n()

// Legacy's "About" text for this page (4:PartnerMuseumIntro_DBA), delivered
// by the extraction; nothing is shown in its place until it is there.
const ABOUT = 'baroqueart.partner.about'
// Legacy's label of the Sponsors link (3:pm_home_sponsors).
const SPONSORS = 'baroqueart.partner.sponsors'

function browse(type) {
  router.push({ path: '/partners/results', query: { type } })
}
</script>

<template>
  <div>
    <h1 class="mwnf-heading">{{ $t('core.nav.partners') }}</h1>

    <div class="mwnf-panel">
      <I18nText v-if="hasText(t, ABOUT)" tag="p" class="intro-text" :keypath="ABOUT" />

      <table class="mwnf-form-table filter-table">
        <tbody>
          <tr>
            <th><label>{{ $t('partner.list.museums') }}</label></th>
            <td>
              <button class="mwnf-button" @click="browse('museum')">{{ $t('standalone.action.browseMuseums') }} →</button>
            </td>
          </tr>
          <tr>
            <th><label>{{ $t('standalone.partner.others') }}</label></th>
            <td>
              <button class="mwnf-button" @click="browse('institution')">{{ $t('standalone.action.browseInstitutions') }} →</button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Legacy's last two links on this page: its Sponsors page (once its
           label is extracted) and the MWNF credits, on the portal. -->
      <p v-if="hasText(t, SPONSORS)" class="partners-sponsors">
        <router-link :to="{ name: 'sponsors' }">{{ t(SPONSORS) }}</router-link>
      </p>
      <p class="partners-credits">
        <a href="https://www.museumwnf.org/about/credits">{{ $t('core.footer.credits') }}</a>
      </p>
    </div>
  </div>
</template>

<style scoped>
.intro-text {
  font-size: 13px;
  line-height: 1.65;
  color: var(--mwnf-color-muted);
  margin-bottom: 16px;
  font-family: 'Roboto', sans-serif;
}

.filter-table th {
  text-align: left;
  font-weight: normal;
  padding: 10px 16px 10px 0;
  font-family: 'Roboto', sans-serif;
  font-size: 13px;
  color: var(--mwnf-color-text);
  vertical-align: middle;
  width: auto;
}
</style>
