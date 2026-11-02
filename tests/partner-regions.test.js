import { describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'

// The partner lists' region groups (legacy's pm_partner_list.php keys its
// list by "country / region" in reading order), over hand-built partners:
// the package carries a partner's region in its translation once the
// inventory has it. The values are markers, not legacy's.

const partners = ref([
  { id: 'a', type: 'museum', level: 'partner', country_id: 'ita' },
  { id: 'b', type: 'museum', level: 'partner', country_id: 'ita' },
  { id: 'c', type: 'museum', level: 'partner', country_id: 'ita' },
  { id: 'd', type: 'museum', level: 'partner', country_id: 'aut' },
])
const texts = {
  a: { name: 'Alpha Museum', city: 'Rome' },
  b: { name: 'Beta Gallery', city: 'Rome', region: 'Villa Borghese' },
  c: { name: 'Gamma Museum', city: 'Bologna', region: 'Bologna' },
  d: { name: 'Delta Museum', city: 'Vienna' },
}
const countries = { ita: 'Italy', aut: 'Austria' }

vi.mock('../src/composables/data.js', () => ({
  useData: () => ({
    countryLabel: (id) => countries[id],
    md: (text) => text,
    mdInline: (text) => text,
    partners,
    tr: (kind, id) => texts[id] ?? {},
  }),
}))

const { partnerListGroups } = await import('../src/composables/partner.js')

describe('partner list regions', () => {
  it("heads a region's partners with country and region, where its first partner falls", () => {
    const groups = partnerListGroups('museum')
    expect(groups.map((group) => group.label)).toEqual(['Austria', 'Italy', 'Italy / Villa Borghese', 'Italy / Bologna'])
    expect(groups.map((group) => group.main.map((p) => p.label))).toEqual([
      ['Delta Museum, Vienna'],
      ['Alpha Museum, Rome'],
      ['Beta Gallery, Rome'],
      ['Gamma Museum, Bologna'],
    ])
  })
})
