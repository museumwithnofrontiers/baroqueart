<script setup>
import { useRouter } from 'vue-router'
import { I18nText } from '@museumwnf/viewer-core'

const router = useRouter()

function browse(type) {
  router.push({ path: '/partners/results', query: { type } })
}
</script>

<template>
  <div>
    <h1 class="mwnf-heading">{{ $t('core.nav.partners') }}</h1>

    <div class="mwnf-panel">
      <!-- Legacy's "About" text for this page (4:PartnerMuseumIntro_DBA). -->
      <I18nText tag="p" class="intro-text" keypath="baroqueart.partner.about" />

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

      <!-- Legacy's last two links on this page: its Sponsors page and the
           MWNF credits, on the portal. -->
      <p class="partners-sponsors">
        <router-link :to="{ name: 'sponsors' }">{{ $t('baroqueart.partner.sponsors') }}</router-link>
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
