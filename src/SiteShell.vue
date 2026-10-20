<script setup>
// A mount of the layout's SiteShell: the menu links, the active entry (off
// `meta.section` through viewer-core's `useSection()`), the offered
// languages, the footer's links and its social icons all come from
// `dataset.config.js`'s `navigation`, read inside SiteShell itself through
// `useSiteConfig()`. What is left here:
//
// - the header lockup, through the `#brand` slot (SiteShell renders it beside
//   the computed nav links, unlike a full `#header` override): legacy's MWNF
//   logo, linked to the portal as legacy links it, beside "Baroque Art";
// - the footer line after the links, "© … 2004 – <year>", as legacy prints
//   it. The layout draws no rights-holder line unless a site asks for it,
//   and legacy has none;
// - legacy's cooperation band on the home page (its `section.sponsors`), in
//   the layout's sponsors section;
// - `site-inner-page` on every page but the home page, which overrides.css
//   reads to cut the inner banner to legacy's band.
//
// The texts are legacy's, extracted by inventory-app scripts/site-i18n into
// locales/en.json.
import { computed } from 'vue'
import { md, useI18n, useSection } from '@museumwnf/viewer-core'
import { SiteShell } from '@museumwnf/viewer-layout/components'
import logo from '../theme/assets/logo_bar_en.png'

const { t } = useI18n()
const section = useSection()

// Legacy prints its `footer5` text and the current year after it. The stored
// text ends in spaces the browser collapses to one; the extraction trims
// them, so the line puts that one space back itself.
const copyright = computed(() => `${t('baroqueart.footer.copyright')} ${new Date().getFullYear()}`)

const cooperation = computed(() => (section.value === 'home' ? md(t('baroqueart.home.cooperation')) : ''))
</script>

<template>
  <SiteShell v-bind="$attrs" :class="{ 'site-inner-page': section !== 'home' }" :footer-text="copyright">
    <template #brand>
      <span class="site-brand">
        <a class="site-portal-logo" href="https://www.museumwnf.org">
          <img :src="logo" :alt="$t('standalone.identity.organisation')" width="120" height="50" />
        </a>
        <a class="site-logo" href="#/">{{ $t('baroqueart.identity.title') }}</a>
      </span>
    </template>
    <slot />
    <template v-if="cooperation" #sponsors>
      <div class="site-cooperation" v-html="cooperation"></div>
    </template>
  </SiteShell>
</template>

<style scoped>
.site-brand {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}
.site-portal-logo {
  display: block;
  line-height: 0;
}
.site-logo {
  color: var(--mwnf-header-text);
  font-size: 28px;
  font-weight: 400;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  text-decoration: none !important;
}
.site-logo:hover {
  color: var(--mwnf-header-text);
}
</style>
