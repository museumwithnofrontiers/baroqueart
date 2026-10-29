import { languageLabels, mwnfLinks, offeredLanguages, useDataPackage } from '@museumwnf/viewer-core'
import { mwnfSocialLinks } from '@museumwnf/viewer-layout'
import { StandaloneShell } from '@museumwnf/viewer-layout/standalone'
import homeItems from './home-items.json'

// The chrome is legacy's own pictures, kept in this repository under
// theme/assets/ (decision D7; theme/assets/SOURCES.md names where each one
// was taken from), handed to the layout as one map that Vite builds and
// fingerprints. The config below names a file by its path under theme/assets/.
const chrome = import.meta.glob('../theme/assets/**/*.{jpg,jpeg,png,gif,svg}', {
  eager: true, query: '?url', import: 'default',
})

// The whole declaration of this website. Before it mounts, the website reads
// nothing from its package but the manifest: the languages it offers, their
// labels and its name come from `manifest.site`, and every record is loaded
// by the route that reads it.

const { manifest } = useDataPackage()

// The languages the package declares for this site, kept where the item
// translations actually carry them. An item sheet may offer more — whatever
// languages the record itself carries — from its own switcher, without
// touching the site language.
const languages = offeredLanguages()

// A route says which section it belongs to (kebab-case, one per top-level
// menu entry); the shell reads it through viewer-core's `useSection()` to
// mark the active menu entry, rather than deriving it from the path.
const meta = (section, entities = []) => ({ section, entities })

export default {
  // The dataset package this website renders. Must match the alias in
  // vite.config.js and the dependency in package.json.
  datasetPackage: '@museumwnf/baroqueart-data',

  siteName: manifest.site?.names?.en ?? 'Baroque Art',

  // The deployed origin, read by `sourceUrl()` for the citation permalink and
  // the source credit's link. GitHub Pages serves this repo at
  // museumwithnofrontiers.github.io/<repo>, the same base path the build's BASE_PATH sets
  // in vite.config.js — this changes if the site ever moves to its own domain.
  site: { origin: 'https://museumwithnofrontiers.github.io/baroqueart' },

  // All pages are website-specific views (below) — no generic entity pages.
  features: {
    entities: [],
  },

  languages,

  // viewer-layout's standalone family shell: legacy Discover Baroque Art's
  // chrome (index.php, dbaTemplates/, includes/header_bottom.php), read from
  // `standalone` below. Every text in this file is an entry of locales/,
  // extracted from legacy by inventory-app's `scripts/site-i18n`
  // (`extract:standalone`).
  shell: StandaloneShell,

  chrome,

  standalone: {
    // The logo links to the MWNF portal, as legacy's did.
    logo: {
      src: 'logo_bar_en.png',
      alt: 'baroqueart.identity.title',
      href: mwnfLinks.portal,
      print: 'logo_print.gif',
    },
    heading: 'baroqueart.identity.heading',
    headerLinks: [
      { label: 'baroqueart.nav.portal', href: mwnfLinks.portal },
      { label: 'baroqueart.nav.home', to: { name: 'home' }, on: 'inner' },
    ],
    banner: { home: 'banner.jpg', inner: 'banner_inside.jpg' },
    // libs/config.inc.php offers English only: no switcher.
    languages: false,
    copyright: 'baroqueart.footer.copyright',
    // The band above the footer on the home page (dbaTemplates/bottomSection1.php):
    // legacy's two words, its country names linked to the Partners page.
    sponsors: {
      on: 'home',
      columns: [{ width: 12, text: 'baroqueart.home.cooperation' }],
    },
    // The home page's two columns (dbaTemplates/leftLink.php, randomText.php):
    // the one side link, and the item of the day from legacy's own list
    // (data/home_items_img_dba_new.txt).
    home: {
      links: [
        { label: 'baroqueart.home.credits', href: mwnfLinks.credits },
      ],
      highlight: {
        list: homeItems,
        heading: 'baroqueart.home.highlight',
        alsoKnownAs: 'baroqueart.home.alsoKnownAs',
        action: 'baroqueart.home.viewDescription',
        route: 'item',
        // Legacy's own picture of the day (libs/class.homepage_item.inc.php):
        // random_image/DBA_new/1.jpg to 75.jpg, a cycle of its own by the day
        // of the year, kept under theme/assets/.
        pictures: Array.from({ length: 75 }, (_, i) => `random_image/DBA_new/${i + 1}.jpg`),
      },
    },
  },

  // The menu, in legacy's order (index.php, includes/header_bottom.php): each
  // label an entry name, the entry whose `section` matches the route's
  // `meta.section` marked active. My Collection leaves for the portal, as
  // legacy's did. It sits under the home page's picture, and above every
  // other page's band.
  navigation: {
    languages: languageLabels(languages),
    links: [
      { section: 'permanent-collection', label: 'baroqueart.nav.permanentCollection', to: { name: 'permanent-collection' } },
      { section: 'database', label: 'baroqueart.nav.database', to: { name: 'database' } },
      { section: 'exhibitions', label: 'baroqueart.nav.exhibitions', to: { name: 'exhibitions' } },
      { section: 'partners', label: 'baroqueart.nav.partners', to: { name: 'partners' } },
      { section: 'timeline', label: 'baroqueart.nav.timeline', to: { name: 'timeline' } },
      { label: 'baroqueart.nav.myCollection', href: mwnfLinks.myCollection, external: true },
    ],
    placement: ({ section }) => (section === 'home' ? 'after-banner' : 'before-banner'),
    // Legacy's footer links to the MWNF portal (includes/footer.php), in its
    // order; only Language Policy and Cookies open in a new tab, as on legacy.
    // The copyright line and the year follow (`standalone.copyright`).
    footerLinks: [
      { label: 'core.footer.aboutMwnf', href: mwnfLinks.about },
      { label: 'core.footer.contact', href: mwnfLinks.contact },
      { label: 'core.footer.legalNotice', href: mwnfLinks.legalNotice },
      { label: 'core.footer.credits', href: mwnfLinks.credits },
      { label: 'core.footer.languagePolicy', href: 'https://www.museumwnf.org/about/language-policy', external: true },
      { label: 'core.footer.cookies', href: mwnfLinks.cookies, external: true },
    ],
    // Legacy's six social-network icons, after the footer line.
    socialLinks: mwnfSocialLinks,
    // The title on each section's band (legacy's SectionTitle() per page).
    sectionTitles: {
      'permanent-collection': 'baroqueart.section.permanentCollection',
      database: 'baroqueart.section.database',
      partners: 'baroqueart.section.partners',
      timeline: 'baroqueart.nav.timeline',
    },
  },

  // The route map: every route named, kebab-case sections, the package id in
  // the path, and the page and every filter in the query. Each route declares
  // the entities its view reads, so the router loads them before the view is
  // created and no page renders against records that are not there yet.
  //
  // The 'home' name replaces viewer-core's generic home route.
  extraViews: [
    {
      path: '/',
      name: 'home',
      component: () => import('@museumwnf/viewer-layout/standalone').then((family) => family.StandaloneHome),
      meta: meta('home', ['items', 'countries']),
    },
    {
      path: '/permanent-collection',
      name: 'permanent-collection',
      component: () => import('./views/PermanentCollectionSearch.vue'),
      meta: meta('permanent-collection', ['items', 'countries', 'partners']),
    },
    {
      path: '/permanent-collection/results',
      name: 'permanent-collection-results',
      component: () => import('./views/PermanentCollectionResults.vue'),
      meta: meta('permanent-collection', ['items', 'countries', 'partners']),
    },
    {
      path: '/database',
      name: 'database',
      component: () => import('./views/DatabaseSearch.vue'),
      meta: meta('database'),
    },
    {
      path: '/database/results',
      name: 'database-results',
      component: () => import('./views/DatabaseResults.vue'),
      meta: meta('database', ['items', 'countries', 'partners']),
    },
    {
      path: '/timeline',
      name: 'timeline',
      component: () => import('./views/TimelineEntrance.vue'),
      meta: meta('timeline', ['timelines', 'timeline_events', 'countries']),
    },
    {
      path: '/timeline/results',
      name: 'timeline-results',
      component: () => import('./views/TimelineResults.vue'),
      // 'items' is read only to decide whether the gallery cross-link
      // appears (decision D1) — the results themselves are events.
      meta: meta('timeline', ['timelines', 'timeline_events', 'countries', 'items']),
    },
    {
      path: '/timeline/gallery',
      name: 'timeline-gallery',
      component: () => import('./views/TimelineGallery.vue'),
      // Same three entities the Permanent Collection results route reads:
      // this page renders the same row, scoped rather than re-described.
      meta: meta('timeline', ['items', 'countries', 'partners']),
    },
    {
      path: '/partners',
      name: 'partners',
      component: () => import('./views/PartnersEntrance.vue'),
      meta: meta('partners', ['items', 'partners', 'countries']),
    },
    {
      path: '/partners/results',
      name: 'partners-results',
      component: () => import('./views/PartnersResults.vue'),
      meta: meta('partners', ['partners', 'countries']),
    },
    {
      // Legacy's Local Sponsors page (atrium_sponsor_detail.php?id=BAR&flg=local),
      // opened from the Partners page. Website copy, not inventory data:
      // its rows come from legacy through the extraction, its logos from
      // theme/assets/sponsors.
      path: '/sponsors',
      name: 'sponsors',
      component: () => import('./views/SponsorsPage.vue'),
      meta: meta('partners'),
    },
    {
      path: '/partner/:id',
      name: 'partner',
      component: () => import('./views/PartnerDetail.vue'),
      props: (route) => ({ id: decodeURIComponent(route.params.id) }),
      meta: meta('partners', ['partners', 'items', 'countries']),
    },
    {
      // Legacy's own credits page (mwnf_credit.php), which no menu entry
      // opens: other MWNF sites link to it. Its text is legacy's, extracted.
      path: '/credits',
      name: 'credits',
      component: () => import('@museumwnf/viewer-layout/views').then((views) => views.TextPageView),
      props: {
        spec: {
          heading: 'core.section.credits',
          body: 'baroqueart.credits.body',
          back: false,
        },
      },
      meta: meta('credits'),
    },
    {
      path: '/exhibitions',
      name: 'exhibitions',
      component: () => import('./views/ExhibitionsEntrance.vue'),
      meta: meta('exhibitions', ['collections']),
    },
    // Each exhibition is a website of its own now (src/minisites.json): the
    // addresses this site gave its pages lead there.
    {
      path: '/exhibitions/:exhibitionId',
      name: 'exhibition',
      component: () => import('./views/ExhibitionMoved.vue'),
      props: true,
      meta: meta('exhibitions', ['collections']),
    },
    {
      path: '/exhibitions/:exhibitionId/introduction',
      name: 'exhibition-introduction',
      component: () => import('./views/ExhibitionMoved.vue'),
      props: true,
      meta: meta('exhibitions', ['collections']),
    },
    {
      path: '/exhibitions/:exhibitionId/theme/:themeId',
      name: 'exhibition-theme',
      component: () => import('./views/ExhibitionMoved.vue'),
      props: true,
      meta: meta('exhibitions', ['collections']),
    },
    {
      path: '/item/:id',
      name: 'item',
      component: () => import('./views/ItemDetail.vue'),
      props: (route) => ({ id: decodeURIComponent(route.params.id) }),
      // No single nav entry owns this page — it opens from the Permanent
      // Collection, the Database search and Exhibitions alike — but its own
      // full-text lookup is the Database entry, so that is the section it
      // carries (matching carpets' item route, itself under 'database').
      meta: meta('database', ['items', 'collections', 'partners', 'countries', 'glossary']),
    },
  ],

  // This website has never been published under any other URL shape: its
  // routes are the canonical ones, so there is nothing to redirect from.
  legacyRoutes: [],
}
