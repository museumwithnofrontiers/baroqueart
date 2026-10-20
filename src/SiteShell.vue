<script setup>
// A mount of the layout's SiteShell: the menu links, the active entry (off
// `meta.section` through viewer-core's `useSection()`) and the offered
// languages all come from `dataset.config.js`'s `navigation`, read inside
// SiteShell itself through `useSiteConfig()`. What is left here:
//
// - the header lockup, through the `#brand` slot (SiteShell renders it beside
//   the computed nav links, unlike a full `#header` override): legacy's MWNF
//   logo, linked to the portal as legacy links it, beside "Baroque Art";
// - legacy's footer line, through the `#footer` slot: the portal links of
//   `navigation.footerLinks`, then "© … 2004 – <year>". It replaces the
//   layout's footer, whose rights-holder line legacy doesn't have. A link
//   whose label the extraction (scripts/site-i18n) has not delivered yet is
//   left out rather than printing its name;
// - legacy's cooperation band on the home page (its `section.sponsors`), in
//   the layout's sponsors section, once its text is there;
// - `site-inner-page` on every page but the home page, which overrides.css
//   reads to cut the inner banner to legacy's band.
import { computed } from 'vue'
import { md, useI18n, useSection, useSiteConfig } from '@museumwnf/viewer-core'
import { SiteShell } from '@museumwnf/viewer-layout/components'
import logo from '../theme/assets/logo_bar_en.png'
import { hasText } from './composables/texts.js'

const { t } = useI18n()
const section = useSection()
const siteConfig = useSiteConfig()

const footerLinks = computed(() => (siteConfig.navigation?.footerLinks ?? [])
  .filter((link) => hasText(t, link.label))
  .map((link) => ({ ...link, label: t(link.label) })))

// Legacy prints its `footer5` text and the current year after it. Until the
// extraction delivers that text, the shared line stands in.
const COPYRIGHT = 'baroqueart.footer.copyright'
const copyright = computed(() => (
  hasText(t, COPYRIGHT) ? `${t(COPYRIGHT)}${new Date().getFullYear()}` : t('standalone.identity.copyright')
))

const COOPERATION = 'baroqueart.home.cooperation'
const cooperation = computed(() => (
  section.value === 'home' && hasText(t, COOPERATION) ? md(t(COOPERATION)) : ''
))
</script>

<template>
  <SiteShell v-bind="$attrs" :class="{ 'site-inner-page': section !== 'home' }">
    <template #brand>
      <span class="site-brand">
        <a class="site-portal-logo" href="https://www.museumwnf.org">
          <img :src="logo" :alt="$t('standalone.identity.organisation')" width="120" height="50" />
        </a>
        <a class="site-logo" href="#/">{{ $t('baroqueart.identity.title') }}</a>
      </span>
    </template>
    <slot />
    <!-- Always passed: AppSponsors (viewer-layout 3.3.0) reads whether it has
         a slot in a computed, which never updates, so a slot that appears
         after the first render (the route resolves after it) would never
         show. overrides.css hides the section while it holds no band. -->
    <template #sponsors>
      <div v-if="cooperation" class="site-cooperation" v-html="cooperation"></div>
    </template>
    <template #footer>
      <ul class="mwnf-footer__links">
        <li v-for="link in footerLinks" :key="link.href">
          <a
            class="mwnf-footer__link"
            :href="link.href"
            :target="link.external ? '_blank' : undefined"
            :rel="link.external ? 'noopener' : undefined"
          >{{ link.label }}</a>
        </li>
      </ul>
      <p class="mwnf-footer__text">{{ copyright }}</p>
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
/* Legacy's one line: "… | Cookies | © Museum With No Frontiers …". */
.mwnf-footer__links + .mwnf-footer__text::before {
  content: "|";
  padding-inline-end: var(--mwnf-footer-gap, 0.5rem);
}
</style>
