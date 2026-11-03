import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it, vi } from 'vitest'
import { mergeMessages } from '@museumwnf/viewer-core'
import { mwnfSocialLinks } from '@museumwnf/viewer-layout'
import { mountSite } from '@museumwnf/viewer-core/testing'
import { catalogues as sharedTexts } from '@museumwnf/viewer-i18n/standalone'
import ownTexts from '../locales/en.json'
import { creditTexts } from '../src/composables/credits.js'
import creditRows from '../src/legacy/credits.json'
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
const HOME = '.mwnf-standalone-highlight'
const PARTNERS = '.mwnf-standalone-pe__row'

describe("legacy's chrome", () => {
  it("declares legacy's favicon, served from public/", () => {
    const html = readFileSync(root('index.html'), 'utf8')
    expect(html).toMatch(/<link rel="icon" href="%BASE_URL%favicon\.ico"/)
    expect(existsSync(root('public/favicon.ico'))).toBe(true)
  })

  it('keeps no text legacy does not have in place of an extracted one', () => {
    expect(ownTexts).not.toHaveProperty('baroqueart.partner.introDiscover')
  })

  it("puts legacy's logo in the header, linked to the portal", async () => {
    const { app, host } = await mountOn('#/', HOME)
    const img = host.querySelector('.mwnf-header__brand-logo')
    expect(img.getAttribute('src')).toContain('logo_bar_en')
    expect(img.getAttribute('alt')).toBe(ownTexts['baroqueart.identity.title'])
    expect(img.closest('a').getAttribute('href')).toMatch(/^https:\/\/www\.museumwnf\.org\/?$/)
    app.unmount()
  }, 60000)

  it("shows legacy's home banner on the home page and its band on the others", async () => {
    const home = await mountOn('#/', HOME)
    expect(home.host.querySelector('.mwnf-banner__image').getAttribute('src')).toMatch(/banner\.jpg|banner-/)
    expect(home.host.querySelector('.mwnf-page').classList.contains('mwnf-standalone--home')).toBe(true)
    home.app.unmount()

    // An inner page: legacy's band, titled with the section's own word.
    const inner = await mountOn('#/partners', PARTNERS)
    expect(inner.host.querySelector('.mwnf-page').classList.contains('mwnf-standalone--home')).toBe(false)
    expect(inner.host.querySelector('.mwnf-standalone-banner').textContent.trim()).toBe(ownTexts['baroqueart.section.partners'])
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
    const social = [...host.querySelectorAll('.mwnf-footer__social-link')].map((a) => a.getAttribute('href'))
    expect(social).toEqual(mwnfSocialLinks.map((link) => link.href))
    expect(mwnfSocialLinks).toHaveLength(6)
    // The rights-holder line is not legacy's (Pascal, 2026-10-20).
    expect(host.querySelector('.mwnf-footer__attribution')).toBeNull()
    app.unmount()
  }, 60000)

  it('shows the cooperation band on the home page only, its countries linked to the Partners page', async () => {
    const home = await mountOn('#/', HOME)
    const links = [...home.host.querySelectorAll('.mwnf-sponsors a')]
    expect(links).toHaveLength(8)
    expect(new Set(links.map((a) => a.getAttribute('href')))).toEqual(new Set(['#/partners']))
    home.app.unmount()

    const inner = await mountOn('#/partners', PARTNERS)
    expect(inner.host.querySelector('.mwnf-sponsors')).toBeNull()
    inner.app.unmount()
  }, 60000)

  it("draws the Partners page as legacy's partners.php: the project's box, About and its four links", async () => {
    const { app, host } = await mountOn('#/partners', PARTNERS)
    expect(host.querySelector('.mwnf-standalone-pe__name').textContent).toBe(ownTexts['baroqueart.partner.projectName'])
    expect(host.querySelector('.mwnf-standalone-pe__about').textContent.trim()).toBe(ownTexts['baroqueart.partner.aboutLink'])
    const links = [...host.querySelectorAll('.mwnf-standalone-pe__links a')]
    expect(links.map((a) => [a.getAttribute('href'), a.textContent])).toEqual([
      ['#/partners/results?type=museum', ownTexts['baroqueart.partner.museums']],
      ['#/partners/results?type=institution', ownTexts['baroqueart.partner.others']],
      ['#/sponsors', ownTexts['baroqueart.partner.sponsors']],
      ['https://www.museumwnf.org/about/credits', ownTexts['core.footer.credits']],
    ])
    app.unmount()
  }, 60000)

  it("renders legacy's Sponsors page: every row, every logo, and its links back to the partner lists", async () => {
    const { app, host } = await mountOn('#/sponsors', '.mwnf-standalone-sp__row')
    expect(host.querySelector('.mwnf-standalone-sp__heading').textContent).toBe(ownTexts['baroqueart.sponsors.localHeading'])
    expect(host.querySelectorAll('.mwnf-standalone-sp__row')).toHaveLength(sponsorRows.length)
    // Every logo a row names is one the site holds, and none comes from
    // images.museumwnf.org (D7).
    const logos = [...host.querySelectorAll('.mwnf-standalone-sp__logo img')].map((img) => img.getAttribute('src'))
    expect(logos).toHaveLength(sponsorRows.filter((row) => row.logo).length)
    // Resolved against the page's own address, each stays on it.
    const page = 'https://baroqueart.site.test/'
    expect(logos.every((src) => src && new URL(src, page).origin === new URL(page).origin)).toBe(true)
    const hrefs = [...host.querySelectorAll('.mwnf-standalone-sp__back a')].map((a) => a.getAttribute('href'))
    expect(hrefs).toEqual(['#/partners/results?type=museum&lang=en', '#/partners/results?type=institution&lang=en'])
    app.unmount()
  }, 60000)

  it("renders legacy's credits page: its band, its back link, each role beside its people", async () => {
    const { app, host } = await mountOn('#/credits', '.baroqueart-credits__row')
    expect(host.querySelector('.mwnf-standalone-banner').textContent.trim()).toBe(ownTexts['core.footer.credits'])
    expect(host.querySelector('.baroqueart-credits__back').textContent.trim()).toBe(ownTexts['baroqueart.item.back'])
    // A row and a column for each the extraction lists, every listed entry printed.
    const rows = [...host.querySelectorAll('.baroqueart-credits__row')]
    expect(rows).toHaveLength(creditRows.length)
    rows.forEach((row, r) => expect(row.querySelectorAll(':scope > .baroqueart-credits__column')).toHaveLength(creditRows[r].length))
    const spelled = Object.keys(creditTexts((name) => name))
    for (const column of creditRows.flat().filter((c) => c.entry)) {
      expect(ownTexts[column.entry], column.entry).toBeTruthy()
      expect(spelled, column.entry).toContain(column.entry)
    }
    // Austria's roles, then its people beside them, a line lower.
    const austria = rows.find((row) => row.querySelector('.baroqueart-credits__column strong')?.textContent === 'Austria')
    const [roles, people] = austria.querySelectorAll('.baroqueart-credits__column')
    expect(roles.style.getPropertyValue('--md')).toBe('6')
    expect(people.textContent).toContain('Innsbruck Tourism')
    expect(people.querySelector('p').firstChild.nodeName).toBe('BR')
    // The MWNF team's heading, under the line legacy leaves over it.
    expect(host.querySelectorAll('.baroqueart-credits__lead br')).toHaveLength(
      creditRows.flat().reduce((sum, column) => sum + (column.lead ?? 0), 0)
    )
    app.unmount()
  }, 60000)
})
