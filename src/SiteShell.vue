<script setup>
// A mount of the layout's SiteShell: the menu links, the active entry (off
// `meta.section` through viewer-core's `useSection()`) and the offered
// languages all come from `dataset.config.js`'s `navigation`, read inside
// SiteShell itself through `useSiteConfig()`. What is left here:
//
// - the header lockup, through the `#brand` slot (SiteShell renders it beside
//   the computed nav links, unlike a full `#header` override): legacy's MWNF
//   logo, linked to the portal as legacy links it, beside "Baroque Art";
// - legacy's footer line, through the `#footer` slot: its links to the MWNF
//   portal, in its order, then "© … 2004 – <year>". It replaces the layout's
//   footer, whose rights-holder line legacy doesn't have;
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

// Legacy prints its `footer5` text and the current year straight after it.
const year = new Date().getFullYear()

const cooperation = computed(() => (section.value === 'home' ? md(t('baroqueart.home.cooperation')) : ''))
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
      <!-- Language Policy and Cookies open in a new tab, as legacy opens them. -->
      <ul class="mwnf-footer__links">
        <li><a class="mwnf-footer__link" href="https://www.museumwnf.org/about">{{ $t('core.footer.aboutMwnf') }}</a></li>
        <li><a class="mwnf-footer__link" href="https://www.museumwnf.org/about/contact">{{ $t('core.footer.contact') }}</a></li>
        <li><a class="mwnf-footer__link" href="https://www.museumwnf.org/about/legal-notice">{{ $t('core.footer.legalNotice') }}</a></li>
        <li><a class="mwnf-footer__link" href="https://www.museumwnf.org/about/credits">{{ $t('core.footer.credits') }}</a></li>
        <li><a class="mwnf-footer__link" href="https://www.museumwnf.org/about/language-policy" target="_blank" rel="noopener">{{ $t('core.footer.languagePolicy') }}</a></li>
        <li><a class="mwnf-footer__link" href="https://www.museumwnf.org/about/cookies" target="_blank" rel="noopener">{{ $t('core.footer.cookies') }}</a></li>
      </ul>
      <p class="mwnf-footer__text">{{ $t('baroqueart.footer.copyright') }}{{ year }}</p>
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
