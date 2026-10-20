import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it, vi } from 'vitest'
import { mergeMessages } from '@museumwnf/viewer-core'
import { mountSite } from '@museumwnf/viewer-core/testing'
import { catalogues as sharedTexts } from '@museumwnf/viewer-i18n/standalone'
import ownTexts from '../locales/en.json'
import sponsorRows from '../src/legacy/sponsors.json'
import config from '../src/dataset.config.js'

// Legacy's chrome on this website (inventory-app#2233: A5, T2, T7): its
// pictures from theme/assets, its footer line, the home page's cooperation
// band, the Partners page's About text and its Sponsors and Credits links,
// legacy's credits page and its Sponsors page. The texts are legacy's,
// extracted by inventory-app scripts/site-i18n into locales/en.json and
// src/legacy/sponsors.json; these tests check where they land, not what
// they say.

const messages = mergeMessages(sharedTexts, { en: ownTexts })

// Vitest runs from the repository's root.
const root = (path) => resolve(process.cwd(), path)

// Mounted on an address and waited on until its page has rendered, so the
// route (and with it the section the shell reads) is the one under test.
async function mountOn(hash, selector) {
  const mounted = await mountSite(config, messages, hash)
  await vi.waitFor(() => expect(mounted.host.querySelector(selector)).not.toBeNull(), { timeout: 30000 })
  return mounted
}
const HOME = '.mwnf-home__welcome'
const PARTNERS = '.partners-credits'

describe("legacy's chrome", () => {
  it("declares legacy's favicon, served from public/", () => {
    const html = readFileSync(root('index.html'), 'utf8')
    expect(html).toMatch(/<link rel="icon" href="%BASE_URL%favicon\.ico"/)
    expect(existsSync(root('public/favicon.ico'))).toBe(true)
  })

  it('keeps no text legacy does not have in place of an extracted one', () => {
    expect(ownTexts).not.toHaveProperty('baroqueart.partner.introDiscover')
  })

  it("puts legacy's MWNF logo in the header, linked to the portal", async () => {
    const { app, host } = await mountOn('#/', HOME)
    const link = host.querySelector('.site-portal-logo')
    expect(link.getAttribute('href')).toBe('https://www.museumwnf.org')
    const img = link.querySelector('img')
    expect(img.getAttribute('src')).toContain('logo_bar_en')
    expect(img.getAttribute('alt')).toBe(sharedTexts.en['standalone.identity.organisation'])
    app.unmount()
  }, 60000)

  it("shows legacy's home banner on the home page and its band on the others", async () => {
    const home = await mountOn('#/', HOME)
    expect(home.host.querySelector('.mwnf-banner__image').getAttribute('src')).toMatch(/banner\.jpg|banner-/)
    expect(home.host.querySelector('.site-inner-page')).toBeNull()
    home.app.unmount()

    const inner = await mountOn('#/partners', PARTNERS)
    expect(inner.host.querySelector('.site-inner-page')).not.toBeNull()
    expect(inner.host.querySelector('.mwnf-banner__image').getAttribute('src')).toContain('banner_inside')
    inner.app.unmount()
  }, 60000)

  it("draws legacy's footer line: the portal's pages, then the copyright and the year", async () => {
    const { app, host } = await mountOn('#/', HOME)
    const links = [...host.querySelectorAll('.mwnf-footer__link')]
    expect(links.map((a) => [a.getAttribute('href'), a.textContent])).toEqual([
      ['https://www.museumwnf.org/about', ownTexts['core.footer.aboutMwnf']],
      ['https://www.museumwnf.org/about/contact', ownTexts['core.footer.contact']],
      ['https://www.museumwnf.org/about/legal-notice', ownTexts['core.footer.legalNotice']],
      ['https://www.museumwnf.org/about/credits', ownTexts['core.footer.credits']],
      ['https://www.museumwnf.org/about/language-policy', ownTexts['core.footer.languagePolicy']],
      ['https://www.museumwnf.org/about/cookies', ownTexts['core.footer.cookies']],
    ])
    // Language Policy and Cookies open in a new tab, as on legacy.
    expect(links.map((a) => a.getAttribute('target'))).toEqual([null, null, null, null, '_blank', '_blank'])
    expect(host.querySelector('.mwnf-footer__text').textContent)
      .toBe(`${ownTexts['baroqueart.footer.copyright']} ${new Date().getFullYear()}`)
    // Legacy's six social-network icons follow the line (viewer-layout's
    // mwnfSocialLinks).
    const social = [...host.querySelectorAll('.mwnf-footer a')].map((a) => a.getAttribute('href'))
      .filter((href) => !href.startsWith('https://www.museumwnf.org'))
    expect(social).toHaveLength(6)
    expect(social.some((href) => href.includes('youtube.com'))).toBe(true)
    // The rights-holder line is not legacy's (Pascal, 2026-10-20).
    expect(host.querySelector('.mwnf-footer__attribution')).toBeNull()
    app.unmount()
  }, 60000)

  it('shows the cooperation band on the home page only, its countries linked to the Partners page', async () => {
    const home = await mountOn('#/', HOME)
    const links = [...home.host.querySelectorAll('.mwnf-sponsors .site-cooperation a')]
    expect(links).toHaveLength(8)
    expect(new Set(links.map((a) => a.getAttribute('href')))).toEqual(new Set(['#/partners']))
    home.app.unmount()

    const inner = await mountOn('#/partners', PARTNERS)
    expect(inner.host.querySelector('.site-cooperation')).toBeNull()
    inner.app.unmount()
  }, 60000)

  it("gives the Partners page legacy's About text and its Sponsors and Credits links", async () => {
    const { app, host } = await mountOn('#/partners', PARTNERS)
    expect(host.querySelector('.intro-text').textContent.trim()).not.toBe('')
    const sponsors = host.querySelector('.partners-sponsors a')
    expect(sponsors.getAttribute('href')).toBe('#/sponsors')
    expect(sponsors.textContent).toBe(ownTexts['baroqueart.partner.sponsors'])
    const credits = host.querySelector('.partners-credits a')
    expect(credits.getAttribute('href')).toBe('https://www.museumwnf.org/about/credits')
    expect(credits.textContent).toBe(ownTexts['core.footer.credits'])
    app.unmount()
  }, 60000)

  it("renders legacy's Sponsors page: every row, every logo, and its links back to the partner lists", async () => {
    const { app, host } = await mountOn('#/sponsors', '.sponsors-row')
    expect(host.querySelector('.sponsors-page .mwnf-heading').textContent).toBe(ownTexts['baroqueart.sponsors.title'])
    expect(host.querySelector('.sponsors-heading').textContent).toBe(ownTexts['baroqueart.sponsors.localHeading'])
    expect(host.querySelectorAll('.sponsors-row')).toHaveLength(sponsorRows.length)
    // Every logo a row names is one the site holds, and none comes from
    // images.museumwnf.org (D7).
    const logos = [...host.querySelectorAll('.sponsors-row__logo img')].map((img) => img.getAttribute('src'))
    expect(logos).toHaveLength(sponsorRows.filter((row) => row.logo).length)
    expect(logos.every((src) => src && !src.includes('museumwnf.org'))).toBe(true)
    const hrefs = [...host.querySelectorAll('.sponsors-back a')].map((a) => a.getAttribute('href'))
    expect(hrefs.slice(1)).toEqual(['#/partners/results?type=museum', '#/partners/results?type=institution'])
    app.unmount()
  }, 60000)

  it("renders legacy's credits page", async () => {
    const { app, host } = await mountOn('#/credits', '.mwnf-prose p')
    expect(host.querySelector('.mwnf-text-page__heading').textContent).toBe(sharedTexts.en['core.section.credits'])
    expect(host.querySelector('.mwnf-prose').textContent.trim()).not.toBe('')
    app.unmount()
  }, 60000)
})
