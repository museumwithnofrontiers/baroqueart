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
      expect(field.label).toBe('sheet.field.periodDynasty')
      expect(field.value({ record, text: { dynasty: 'Baroque.' } })).toBe('Baroque')
      expect(field.value({ record, text: {} })).toBe('')
    }
  })

  it('puts the dynasty after the dimensions on an object and after the architects on a monument', () => {
    const keys = (record) => fieldsOf(record).map((f) => f.key)
    expect(keys(object).indexOf('dynasty')).toBe(keys(object).indexOf('dimensions') + 1)
    expect(keys(monument).indexOf('dynasty')).toBe(keys(monument).indexOf('architects') + 1)
  })

  it("brackets the artist's life data after the artist", () => {
    const field = row(fieldsOf(object), 'artists')
    const text = { artist_birthdate: '1660', artist_birthplace: 'Chemnitz', artist_deathdate: '1736', artist_deathplace: 'Augsburg' }
    expect(field.value({ record: object, text })).toBe('Andreas Matthäus (1660, Chemnitz-1736, Augsburg)')
    expect(field.value({ record: object, text: {} })).toBe('Andreas Matthäus')
    expect(field.value({ record: { ...object, artist_names: [] }, text })).toBe('')
  })

  it('closes both sheets with the rights line', () => {
    for (const record of [object, monument]) {
      expect(sectionsOf(record).at(-1)).toMatchObject({ key: 'copyright', label: 'sheet.field.copyrightInformation', value: 'copyright' })
    }
  })
})
