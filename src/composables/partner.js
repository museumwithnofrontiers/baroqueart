import { partnerView } from '@museumwnf/viewer-core'
import { useInventoryData } from './useInventoryData.js'

// The partner pages: what viewer-layout's `PartnerListView` renders on
// `/partners/results` (one spec per type, the site's own museum/institution
// axis) and what its `RecordView` sibling renders on `/partner/:id`, with
// `PartnerPanel` as the page's body (inventory-app#2035). The grouping, the
// accordion, the record's language and the panel — its About/Contact/Logo
// tabs, the pictures, the map — are the platform's; what is declared here is
// only this website's: which axis a list is scoped to, and the partner's
// view-model with this website's routes.

const { countryLabel, items, itemLabel, md, mdInline, tr } = useInventoryData()

/**
 * `/partners/results`: one spec per type (`'museum'` / `'institution'`),
 * the site's own axis — `PartnersEntrance.vue` still picks it, unchanged.
 * `nested: true` carries an associated partner under its own main partner
 * (`partnerHierarchy`) rather than the flat "Associated Partners" column, for
 * the third that has one.
 */
export function partnerList(type) {
  return {
    entity: 'partners',
    scope: (partner) => partner.type === type,
    group: { tier: 'level' },
    nested: true,
    route: 'partner',
    count: true,
    label: (countryId, ctx) => (countryId ? countryLabel(countryId) : ctx.t('baroqueart.results.otherCountry')),
    empty: type === 'museum' ? 'baroqueart.partner.noMuseums' : 'baroqueart.partner.noInstitutions',
  }
}

/**
 * `/partner/:id`: the sheet declares nothing — no field, no section, no media
 * gallery of its own (the pictures are the panel's), no citation (legacy
 * never printed one on this page), no `related` (the held items are a reverse
 * lookup, `item.partner_id`, which PartnerDetail.vue's `#related` slot lists).
 */
export const partnerSheet = {
  entity: 'partners',
  fields: [],
  shortDescription: false,
  media: () => [],
  citation: false,
  related: false,
}

// Where a partner's "View Objects"/"View Monuments" lands: the Permanent
// Collection, filtered on the partner.
export function partnerObjectsLink(partner) {
  return { path: '/permanent-collection/results', query: { partner: partner.id } }
}

// The partner's view-model, which `PartnerPanel` renders on the partner page
// and under an item's holder text: this website's country label, its
// renderers (the glossary-bound ones) and its two routes.
export function partnerViewOf(partner, text) {
  return partnerView(partner, text, {
    countryLabel,
    md,
    mdInline,
    route: (p) => ({ name: 'partner', params: { id: p.id } }),
    objectsRoute: partnerObjectsLink,
  })
}

/** The items a partner holds — the reverse lookup `related: false` leaves to the view. */
export function heldItems(partner) {
  if (!partner) return []
  return items.value.filter((item) => item.partner_id === partner.id)
}

export function heldItemRow(item) {
  const text = tr('items', item.id)
  const name = text.name ?? item.internal_name ?? item.id
  return {
    id: item.id,
    image: item.images?.[0]?.url ?? '',
    imageAlt: itemLabel(item),
    name: mdInline(name),
    meta: [countryLabel(item.country_id), text.dates].filter(Boolean),
    badge: item.type,
    to: { name: 'item', params: { id: item.id } },
  }
}
