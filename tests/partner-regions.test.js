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
  // Legacy lists a partner by its English name: one without is not listed.
  { id: 'e', type: 'institution', level: 'partner', country_id: 'ita' },
  { id: 'f', type: 'institution', level: 'partner', country_id: 'svn' },
  { id: 'g', type: 'institution', level: 'associated', country_id: 'svn', parent_id: 'f' },
])
const texts = {
  a: { name: 'Alpha Museum', city: 'Rome' },
  b: { name: 'Beta Gallery', city: 'Rome', region: 'Villa Borghese' },
  c: { name: 'Gamma Museum', city: 'Bologna', region: 'Bologna' },
  d: { name: 'Delta Museum', city: 'Vienna' },
  f: { name: 'Foxtrot Institute', city: 'Ljubljana' },
}
const countries = { ita: 'Italy', aut: 'Austria', svn: 'Slovenia' }

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

  it('leaves out a partner with no English name, as legacy joins on it', () => {
    const groups = partnerListGroups('institution')
    expect(groups.map((group) => group.label)).toEqual(['Slovenia'])
    expect(groups[0].main.map((p) => p.label)).toEqual(['Foxtrot Institute, Ljubljana'])
    expect(groups[0].associated).toEqual([])
  })
})
