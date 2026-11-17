<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'
import { I18nTextInline, useI18n, useSiteConfig } from '@museumwnf/viewer-core'
import { SocialLinks, chromeSource } from '@museumwnf/viewer-layout'
import { exhibitionsTree, minisiteHref } from '../composables/exhibitions.js'
import { useData } from '../composables/data.js'

// Legacy's Virtual Exhibitions landing page (exhibitions/BAR/index.php), a
// page apart from Discover Baroque Art's others, with a frame of its own: a
// 763px column on a sandy ground, its picture behind the whole column, its
// own header (the logo, the portal links and the language), the title, the
// exhibitions, the credits under them, then its menu and its footer. The
// shell leaves this route bare. Every size, colour and position is legacy's
// (_styles.css, _mainpage.css); its pictures are under
// theme/assets/exhibitions/.
//
// Each exhibition leads to its own website (its mini-site). The first ten
// fill the first column, the rest the second, as legacy split them; hovering
// one shows its picture, kept two seconds after the pointer leaves.

const { mdStrip, tr } = useData()
const { t, locale } = useI18n()
const config = useSiteConfig()

const standalone = computed(() => config.standalone ?? {})
const nav = computed(() => config.navigation ?? {})
const frame = (name) => chromeSource(config.chrome, `exhibitions/${name}`)

const logo = computed(() => frame(`logo_${locale.value}.gif`) ?? frame('logo_en.gif'))
const headerLinks = computed(() => standalone.value.headerLinks ?? [])
const languages = computed(() => nav.value.languages ?? [])
const year = new Date().getFullYear()

// The language, as the header's select sets it: viewer-core puts it in the address.
const language = computed({
  get: () => locale.value,
  set: (code) => { locale.value = code },
})

// The exhibition's legacy number names its picture (images/item_<n>.jpg).
const legacyNumber = (exhibition) => /^mwnf3:exhibitions:(\d+)$/.exec(exhibition.backward_compatibility ?? '')?.[1]

const exhibitions = computed(() => {
  const root = exhibitionsTree.root.value
  if (!root) return []
  return exhibitionsTree.children(root.id).map((exhibition) => {
    const number = legacyNumber(exhibition)
    return {
      id: exhibition.id,
      title: mdStrip(tr('collections', exhibition.id).title ?? exhibition.internal_name),
      href: minisiteHref(exhibition.id, locale.value) ?? undefined,
      picture: number ? frame(`item_${number}.jpg`) : null,
    }
  })
})
const columns = computed(() => [exhibitions.value.slice(0, 10), exhibitions.value.slice(10)].filter((column) => column.length))

const shown = ref(null)
let hideTimer = null
function show(exhibition) {
  window.clearTimeout(hideTimer)
  shown.value = exhibition.picture
}
function hide() {
  window.clearTimeout(hideTimer)
  hideTimer = window.setTimeout(() => { shown.value = null }, 2000)
}
onBeforeUnmount(() => window.clearTimeout(hideTimer))

// The menu under the picture, in legacy's order.
const MENU = [
  'baroqueart.nav.permanentCollection',
  'baroqueart.nav.database',
  'baroqueart.nav.exhibitions',
  'baroqueart.nav.timeline',
  'baroqueart.nav.partners',
  'baroqueart.nav.myCollection',
]
const menu = computed(() => MENU.map((label) => (nav.value.links ?? []).find((link) => link.label === label)).filter(Boolean))
const footerLinks = computed(() => nav.value.footerLinks ?? [])

// The words of the links above, each spelled out (the i18n check reads only
// written names); the links themselves are the config's.
const words = computed(() => ({
  'baroqueart.nav.portal': t('baroqueart.nav.portal'),
  'baroqueart.nav.home': t('baroqueart.nav.home'),
  'baroqueart.nav.permanentCollection': t('baroqueart.nav.permanentCollection'),
  'baroqueart.nav.database': t('baroqueart.nav.database'),
  'baroqueart.nav.exhibitions': t('baroqueart.nav.exhibitions'),
  'baroqueart.nav.timeline': t('baroqueart.nav.timeline'),
  'baroqueart.nav.partners': t('baroqueart.nav.partners'),
  'baroqueart.nav.myCollection': t('baroqueart.nav.myCollection'),
  'core.footer.aboutMwnf': t('core.footer.aboutMwnf'),
  'core.footer.contact': t('core.footer.contact'),
  'core.footer.legalNotice': t('core.footer.legalNotice'),
  'core.footer.credits': t('core.footer.credits'),
  'core.footer.languagePolicy': t('core.footer.languagePolicy'),
  'core.footer.cookies': t('core.footer.cookies'),
}))
</script>

<template>
  <div class="exh-ground">
    <div class="exh-column">
      <div class="exh-edge" :style="{ backgroundImage: `url(${frame('bg_fading_left.gif')})` }" />
      <div class="exh-page" :style="{ backgroundImage: `url(${frame('bg.jpg')})` }">
        <header class="exh-header">
          <div class="exh-header__logo">
            <a :href="standalone.logo?.href"><img v-if="logo" :src="logo" :alt="t('baroqueart.identity.title')" height="60" /></a>
          </div>
          <div class="exh-header__nav">
            <div>
              <template v-for="(link, i) in headerLinks" :key="link.label">
                <template v-if="i">&nbsp;|&nbsp;</template>
                <RouterLink v-if="link.to" :to="link.to" class="exh-header__link">{{ words[link.label] }}</RouterLink>
                <a v-else :href="link.href" class="exh-header__link">{{ words[link.label] }}</a>
              </template>
            </div>
            <div v-if="languages.length">
              <select v-model="language" class="exh-header__language" :aria-label="t('layout.language.label')">
                <option v-for="option in languages" :key="option.code" :value="option.code">{{ option.label }}</option>
              </select>
            </div>
          </div>
        </header>

        <main id="mwnf-content" class="exh-home">
          <h1 class="exh-title"><span class="exh-title__high">{{ t('baroqueart.exhibitions.title') }}</span></h1>

          <I18nTextInline keypath="baroqueart.exhibitions.welcome" tag="h2" class="exh-menu-title" />

          <ul v-for="(column, c) in columns" :key="c" class="exh-menu" :class="`exh-menu--${c + 1}`">
            <li v-for="exhibition in column" :key="exhibition.id">
              &gt; <a :href="exhibition.href" @mouseenter="show(exhibition)" @focus="show(exhibition)" @mouseleave="hide" @blur="hide">{{ exhibition.title }}</a>
            </li>
          </ul>

          <div class="exh-item"><img v-if="shown" :src="shown" width="125" height="125" alt="" /></div>

          <div class="exh-credits">
            <I18nTextInline keypath="baroqueart.exhibitions.cooperation" tag="div" class="exh-credits__tab" />
            <I18nTextInline keypath="baroqueart.exhibitions.design" tag="div" class="exh-credits__tab" />
          </div>

          <div class="exh-partners"><SocialLinks :links="nav.socialLinks ?? []" /></div>
        </main>

        <nav class="exh-menu-bar" :aria-label="t('layout.nav.label')">
          <ul>
            <li v-for="link in menu" :key="link.label">
              <RouterLink v-if="link.to" :to="link.to">{{ words[link.label] }}</RouterLink>
              <a v-else :href="link.href" target="_blank" rel="noopener">{{ words[link.label] }}</a>
            </li>
          </ul>
        </nav>
        <div class="exh-strip" />
        <footer class="exh-footer">
          <template v-for="link in footerLinks" :key="link.label">
            <a :href="link.href" :target="link.external ? '_blank' : undefined" :rel="link.external ? 'noopener' : undefined">{{ words[link.label] }}</a>&nbsp;|&nbsp;
          </template>{{ t('baroqueart.footer.copyright') }} {{ year }}
        </footer>
      </div>
      <div class="exh-edge" :style="{ backgroundImage: `url(${frame('bg_fading_right.gif')})` }" />
    </div>
  </div>
</template>

<style scoped>
/* Legacy's reset and its Verdana, white on a sandy ground. */
.exh-ground {
  min-height: 100vh;
  background-color: #a6886a;
  font: normal 12px/14px Verdana, Arial, Helvetica, sans-serif;
  color: #fff;
}

.exh-ground :where(h1, h2, ul, li, p) {
  margin: 0;
  padding: 0;
  font-weight: normal;
}

.exh-ground a {
  color: inherit;
  text-decoration: none;
}

.exh-ground a:hover {
  text-decoration: underline;
}

.exh-column {
  display: flex;
  justify-content: center;
}

.exh-edge {
  flex: 0 0 5px;
  background-repeat: repeat-y;
}

/* The column, its picture at its top left (td.mainpagecol3). */
.exh-page {
  flex: 0 1 763px;
  min-width: 0;
  background-position: top left;
  background-repeat: no-repeat;
}

/* The header (#header), on the picture: the logo on the left, the links and
   the language on the right. */
.exh-header {
  position: relative;
  height: 71px;
}

.exh-header__logo {
  position: absolute;
  top: 0;
  left: 0;
}

.exh-header__logo img {
  display: block;
}

.exh-header__nav {
  position: absolute;
  top: 0;
  right: 13px;
  padding-top: 13px;
  text-align: right;
}

.exh-header__link,
.exh-header__nav {
  font: normal 11px Verdana, Arial, Helvetica, sans-serif;
  color: #fff;
}

.exh-header__language {
  margin-top: 8px;
  padding: 1px;
  border: none;
  font: normal 11px Verdana, Arial, Helvetica, sans-serif;
  color: #000;
  background-color: #eee;
}

/* The picture (#homePage) and what stands on it. */
.exh-home {
  position: relative;
  height: 670px;
}

.exh-title {
  position: absolute;
  top: 40px;
  left: 20px;
  width: 290px;
  font: normal 25px/32px Georgia, 'Times New Roman', Times, serif;
  color: #fff;
}

.exh-title__high {
  font: normal 49px Georgia, 'Times New Roman', Times, serif;
}

.exh-menu-title {
  position: absolute;
  top: 175px;
  left: 20px;
  font: bold 13px Georgia, 'Times New Roman', Times, serif;
  color: #fdb303;
}

.exh-menu {
  position: absolute;
  list-style: none;
  font: normal 13px/19px Georgia, 'Times New Roman', Times, serif;
}

.exh-menu--1 { top: 230px; left: 20px; width: 250px; }
.exh-menu--2 { top: 320px; left: 460px; width: 290px; }

.exh-menu a:hover {
  color: #fdb303;
}

.exh-item {
  position: absolute;
  bottom: 105px;
  left: 21px;
  width: 125px;
  height: 125px;
}

.exh-item img {
  display: block;
}

/* The credits (#Block3's two #tab_01), their links underlined. */
.exh-credits {
  position: absolute;
  top: 606px;
  left: 20px;
}

.exh-credits__tab {
  float: left;
  width: 200px;
  font: normal 9px/12px Verdana, Arial, Helvetica, sans-serif;
}

.exh-credits__tab :deep(a) {
  color: #fff;
  text-decoration: underline;
}

/* The social icons (#Partners, #icons, #social-media), white. */
.exh-partners {
  display: flow-root;
  position: absolute;
  right: 5px;
  bottom: 0;
  width: 200px;
  padding: 10px 15px;
  text-align: right;
  font-size: 20px;
  --mwnf-footer-social-color: #fff;
}

/* The shared list sits in the flow here, at the box's right. */
.exh-partners :deep(.mwnf-footer__social) {
  position: static;
  justify-content: flex-end;
}

/* The menu (#btmMenu), the line under it and the footer. */
.exh-menu-bar {
  padding: 5px 0 6px;
  background-color: #1f282f;
  text-align: center;
  font: normal 9px Verdana, Arial, Helvetica, sans-serif;
}

.exh-menu-bar ul {
  list-style: none;
}

.exh-menu-bar li {
  display: inline;
  padding: 0 20px;
}

.exh-menu-bar a {
  font-size: 10px;
  color: #999;
}

.exh-menu-bar a:hover {
  text-decoration: none;
}

.exh-strip {
  height: 1px;
  background-color: #556775;
}

.exh-footer {
  padding: 5px 0 6px;
  background-color: #1f282f;
  text-align: center;
  font: normal 9px Verdana, Arial, Helvetica, sans-serif;
  color: #999;
}

/* Narrower than the column: the picture's places no longer fit, so what
   stands on it follows one under the other. */
@media (max-width: 772px) {
  .exh-home {
    display: flex;
    flex-direction: column;
    gap: 16px;
    height: auto;
    padding: 24px 16px;
  }

  .exh-title,
  .exh-menu-title,
  .exh-menu,
  .exh-credits,
  .exh-partners {
    position: static;
    width: auto;
  }

  .exh-item {
    display: none;
  }

  .exh-credits {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
  }

  .exh-credits__tab {
    float: none;
  }

  .exh-partners {
    padding: 0;
    text-align: left;
  }

  .exh-menu-bar li {
    padding: 0 8px;
  }

  .exh-header__nav {
    right: 8px;
  }

  .exh-header__logo img {
    height: 44px;
    width: auto;
  }
}
</style>
