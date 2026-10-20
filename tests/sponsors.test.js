import { existsSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { assetMap, sponsorRows } from '../src/composables/sponsors.js'

// The Sponsors page's rows, over hand-built rows in the shape the extraction
// writes (src/legacy/sponsors.json). The values are markers, not legacy's.

const logos = { 'sponsors/34.jpg': '/assets/34-abc.jpg' }

describe('sponsor rows', () => {
  it('renders the Markdown and resolves the logo', () => {
    const [row] = sponsorRows([
      { label: 'COUNTRY/\nREGION', name: 'NAME', web: 'www.example.org', remarks: '*REMARKS*', logo: 'sponsors/34.jpg' },
    ], logos)
    expect(row.name).toBe('NAME')
    expect(row.web).toBe('www.example.org')
    expect(row.labelHtml).toContain('COUNTRY/<br')
    expect(row.remarksHtml).toContain('<em>REMARKS</em>')
    expect(row.logoUrl).toBe('/assets/34-abc.jpg')
  })

  it('leaves out what a row lacks, and a logo the site does not hold', () => {
    const [row] = sponsorRows([{ name: 'NAME', logo: 'sponsors/99.jpg' }], logos)
    expect(row).toEqual({ name: 'NAME', web: '', labelHtml: '', remarksHtml: '', logoUrl: '' })
    expect(sponsorRows(undefined, logos)).toEqual([])
  })

  it('keys the asset map by the path after theme/assets/', () => {
    expect(assetMap({ '../../theme/assets/sponsors/34.jpg': '/x.jpg' }, '../../theme/assets/'))
      .toEqual({ 'sponsors/34.jpg': '/x.jpg' })
  })

  it('holds the 16 sponsor logos legacy shows', () => {
    const dir = resolve(process.cwd(), 'theme/assets/sponsors')
    expect(existsSync(dir)).toBe(true)
    expect(readdirSync(dir).filter((f) => f.endsWith('.jpg'))).toHaveLength(16)
  })
})
