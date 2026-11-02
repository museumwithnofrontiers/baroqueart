import { describe, expect, it } from 'vitest'
import { itemSheetSpec } from '../src/composables/sheet.js'

// The item sheet's own rows, over a hand-built record and translation: the
// fields the legacy-parity story (inventory-app#2233) added to the package —
// the free-text Period / Dynasty line, the artist's life data and the rights
// line — read the way legacy `database_item.php` printed them.

const object = { id: 'o1', type: 'object', artist_names: ['Andreas Matthäus'] }
const monument = { id: 'm1', type: 'monument' }

const row = (list, key) => list.find((f) => f.key === key)
const fieldsOf = (record) => itemSheetSpec.fields({ record })
const sectionsOf = (record) => itemSheetSpec.sections({ record })

describe('item sheet spec', () => {
  it('prints the free-text Period / Dynasty line without its ending period', () => {
    for (const record of [object, monument]) {
      const field = row(fieldsOf(record), 'dynasty')
      expect(field.label).toBe('baroqueart.sheet.periodDynasty')
      expect(field.value({ record, text: { dynasty: 'Baroque.' } })).toBe('Baroque')
      expect(field.value({ record, text: {} })).toBe('')
    }
  })

  it("prints the location, the province and the country's name, as legacy's Location line", () => {
    const countries = (entity) => (entity === 'countries' ? { cze: { name: 'Czech Republic' } } : {})
    for (const record of [{ ...object, country_id: 'cze' }, { ...monument, country_id: 'cze' }]) {
      const value = row(fieldsOf(record), 'location').value
      expect(value({ record, translations: countries, text: { location: 'Governor’s Palace, Brno', province: 'Moravia.' } }))
        .toBe('Governor’s Palace, Brno, Moravia, Czech Republic')
    }
    const nameless = { ...object, country_id: 'xyz' }
    expect(row(fieldsOf(nameless), 'location').value({ record: nameless, translations: countries, text: { location: 'Brno' } })).toBe('Brno')
  })

  it('puts the dynasty after the dimensions on an object and after the architects on a monument', () => {
    const keys = (record) => fieldsOf(record).map((f) => f.key)
    expect(keys(object).indexOf('dynasty')).toBe(keys(object).indexOf('dimensions') + 1)
    expect(keys(monument).indexOf('dynasty')).toBe(keys(monument).indexOf('architects') + 1)
  })

  it("brackets the artist's life data after the artist", () => {
    const field = row(fieldsOf(object), 'artists')
    const text = { artist_birthdate: '1660', artist_birthplace: 'Chemnitz', artist_deathdate: '1736', artist_deathplace: 'Augsburg' }
    expect(field.value({ record: object, text: { artist: 'Andreas Matthäus', ...text } })).toBe('Andreas Matthäus (1660, Chemnitz-1736, Augsburg)')
    expect(field.value({ record: object, text: { artist: 'Andreas Matthäus' } })).toBe('Andreas Matthäus')
    // A language without its own line prints none, whatever another language wrote.
    expect(field.value({ record: object, text })).toBe('')
  })

  it("prints the record's own materials line, and the type under its own heading", () => {
    const fields = fieldsOf(object)
    const materials = row(fields, 'materials')
    expect(materials.label).toBe('baroqueart.sheet.materials')
    expect(materials.value({ record: object, text: { materials: ['Silver, gilded; enamel.'], type: 'Monstrance' } })).toEqual([
      'Silver, gilded; enamel.',
    ])
    expect(materials.join).toBe('; ')
    expect(row(fields, 'type')).toMatchObject({ label: 'baroqueart.sheet.type', value: 'type' })
    const keys = fields.map((f) => f.key)
    expect(keys.indexOf('type')).toBeGreaterThan(keys.indexOf('provenance'))
    expect(keys.indexOf('type')).toBeGreaterThan(keys.indexOf('workshop'))
  })

  it('closes both sheets with the rights line', () => {
    for (const record of [object, monument]) {
      expect(sectionsOf(record).at(-1)).toMatchObject({ key: 'copyright', label: 'baroqueart.sheet.copyrightInformation', value: 'copyright' })
    }
  })
})
