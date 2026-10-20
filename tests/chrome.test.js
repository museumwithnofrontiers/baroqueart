import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it, vi } from 'vitest'
import { mergeMessages } from '@museumwnf/viewer-core'
import { mountSite } from '@museumwnf/viewer-core/testing'
import { catalogues as sharedTexts } from '@museumwnf/viewer-i18n/standalone'
import ownTexts from '../locales/en.json'
import config from '../src/dataset.config.js'

// Legacy's chrome on this website (inventory-app#2233: A5, T2, T7): its
// pictures from theme/assets, the footer's portal links, the home page's
// cooperation band, the Partners page's About text and Credits link, and
// legacy's credits page.
//
// The texts of the band, the About text, the credits page and the Language
// Policy label come from legacy through the extraction (scripts/site-i18n).
// Each block is left out until its text is there, so the page never prints
// an entry's name. The fixtures below stand in for the extraction's output;
// they are markers, not texts the site ships.

const messages = mergeMessages(sharedTexts, { en: ownTexts })
const FIXTURES = {
  'core.footer.languagePolicy': 'LANGUAGE-POLICY-FIXTURE',
  'baroqueart.home.cooperation': 'COOPERATION-FIXTURE\n[Austria](#/partners) and [Slovenia](#/partners).',
  'baroqueart.partner.about': 'PARTNER-ABOUT-FIXTURE',
  'baroqueart.credits.body': 'CREDITS-BODY-FIXTURE',
}
const extracted = mergeMessages(messages, { en: FIXTURES })

// Vitest runs from the repository's root.
const root = (path) => resolve(process.cwd(), path)

// Mounted on an address and waited on until its page has rendered, so the
// route (and with it the section the shell reads) is the one under test.
async function mountOn(hash, texts, selector) {
  const mounted = await mountSite(config, texts, hash)
  await vi.waitFor(() => expect(mounted.host.querySelector(selector)).not.toBeNull(), { timeout: 30000 })
  return mounted
}
const HOME = '.mwnf-home__welcome'
const PARTNERS = '.partners-credits'

describe("legacy's chrome", () => {
  it('declares the favicon kept in theme/assets', () => {
    const html = readFileSync(root('index.html'), 'utf8')
    expect(html).toMatch(/<link rel="icon" href="\.\/theme\/assets\/favicon\.ico"/)
    expect(existsSync(root('theme/assets/favicon.ico'))).toBe(true)
  })

  it("puts legacy's MWNF logo in the header, linked to the portal", async () => {
    const { app, host } = await mountOn('#/', messages, HOME)
    const link = host.querySelector('.site-portal-logo')
    expect(link.getAttribute('href')).toBe('https://www.museumwnf.org')
    const img = link.querySelector('img')
    expect(img.getAttribute('src')).toContain('logo_bar_en')
    expect(img.getAttribute('alt')).toBe(sharedTexts.en['standalone.identity.organisation'])
    app.unmount()
  }, 60000)

  it("shows legacy's home banner on the home page and its band on the others", async () => {
    const home = await mountOn('#/', messages, HOME)
    expect(home.host.querySelector('.mwnf-banner__image').getAttribute('src')).toMatch(/banner\.jpg|banner-/)
    expect(home.host.querySelector('.site-inner-page')).toBeNull()
    home.app.unmount()

    const inner = await mountOn('#/partners', messages, PARTNERS)
    expect(inner.host.querySelector('.mwnf-banner__image').getAttribute('src')).toContain('banner_inside')
    inner.app.unmount()
  }, 60000)

  it("links the portal's pages from the footer, in legacy's order", async () => {
    const hrefs = (host) => [...host.querySelectorAll('.mwnf-footer__link')].map((a) => a.getAttribute('href'))

    // Without the Language Policy label, its link is left out.
    const before = await mountOn('#/', messages, HOME)
    expect(hrefs(before.host)).toEqual([
      'https://www.museumwnf.org/about',
      'https://www.museumwnf.org/about/contact',
      'https://www.museumwnf.org/about/credits',
      'https://www.museumwnf.org/about/cookies',
    ])
    before.app.unmount()

    const after = await mountOn('#/', extracted, HOME)
    expect(hrefs(after.host)).toEqual([
      'https://www.museumwnf.org/about',
      'https://www.museumwnf.org/about/contact',
      'https://www.museumwnf.org/about/credits',
      'https://www.museumwnf.org/about/language-policy',
      'https://www.museumwnf.org/about/cookies',
    ])
    const policy = [...after.host.querySelectorAll('.mwnf-footer__link')][3]
    expect(policy.textContent).toBe('LANGUAGE-POLICY-FIXTURE')
    expect(policy.getAttribute('target')).toBe('_blank')
    after.app.unmount()
  }, 60000)

  it('shows the cooperation band on the home page only, once its text is there', async () => {
    const without = await mountOn('#/', messages, HOME)
    expect(without.host.querySelector('.site-cooperation')).toBeNull()
    without.app.unmount()

    const home = await mountOn('#/', extracted, HOME)
    const band = home.host.querySelector('.mwnf-sponsors .site-cooperation')
    expect(band.textContent).toContain('COOPERATION-FIXTURE')
    expect([...band.querySelectorAll('a')].map((a) => a.getAttribute('href'))).toEqual(['#/partners', '#/partners'])
    home.app.unmount()

    const inner = await mountOn('#/partners', extracted, PARTNERS)
    expect(inner.host.querySelector('.site-cooperation')).toBeNull()
    inner.app.unmount()
  }, 60000)

  it("gives the Partners page legacy's About text and its Credits link", async () => {
    const without = await mountOn('#/partners', messages, PARTNERS)
    expect(without.host.querySelector('.intro-text')).toBeNull()
    const credits = without.host.querySelector('.partners-credits a')
    expect(credits.getAttribute('href')).toBe('https://www.museumwnf.org/about/credits')
    expect(credits.textContent).toBe(sharedTexts.en['core.footer.credits'])
    without.app.unmount()

    const withText = await mountOn('#/partners', extracted, PARTNERS)
    await vi.waitFor(() => expect(withText.host.querySelector('.intro-text')).not.toBeNull(), { timeout: 15000 })
    expect(withText.host.querySelector('.intro-text').textContent).toContain('PARTNER-ABOUT-FIXTURE')
    withText.app.unmount()
  }, 60000)

  it("renders legacy's credits page from the extracted text", async () => {
    const without = await mountOn('#/credits', messages, '.mwnf-text-page__heading')
    expect(without.host.querySelector('.mwnf-text-page__heading').textContent).toBe(sharedTexts.en['core.section.credits'])
    expect(without.host.querySelector('.mwnf-prose').textContent.trim()).toBe('')
    without.app.unmount()

    const withText = await mountOn('#/credits', extracted, '.mwnf-prose p')
    expect(withText.host.querySelector('.mwnf-prose').textContent).toContain('CREDITS-BODY-FIXTURE')
    withText.app.unmount()
  }, 60000)
})
