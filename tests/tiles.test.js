import { describe, expect, it } from 'vitest'
import { galleryTile, resultTile } from '../src/composables/catalogue.js'

// Legacy prints the artist on the catalogue's tiles only (pclist_all.php);
// the timeline gallery and a partner's items print the date whole, without
// its ending period, and no artist.
const text = { name: 'Saint Michael', dates: 'c. 1615.', dynasty: '', artist: 'Alessandro Tiarini', holder: 'Museo' }
const item = { id: 'i1', type: 'object', country_id: 'ita', images: [] }
const context = { tr: () => text, renderInline: (value) => value }

describe('result tiles', () => {
  it('prints the artist on the catalogue tile', () => {
    expect(resultTile(item, context).lines).toEqual(['c. 1615.', 'Alessandro Tiarini'])
  })

  it('prints the date alone on the gallery tile', () => {
    expect(galleryTile(item, context).lines).toEqual(['c. 1615'])
    expect(galleryTile(item, context).holder).toBe('Museo')
  })
})
