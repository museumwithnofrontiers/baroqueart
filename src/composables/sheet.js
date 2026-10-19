import { artistLine, removeEndingPoint } from '@museumwnf/viewer-core'

// The item sheet, as a spec: what viewer-layout's `RecordView` renders on
// `/item/:id`. The mechanics — which language the record is read in, what is
// loaded for it, the glossary terms it reaches, how a field becomes a row,
// the credits, the citation, the related records — are the platform's. What
// is declared here is only what is this website's: the field specification
// (legacy `database_item.php`'s two orders, one for a monument and one for an
// object), and the prose sections under it. Every label is an entry name,
// written out so the check that every name resolves can read it.

// Legacy's free-text Period / Dynasty line, without its ending period as
// legacy printed it (decision D5, inventory-app#2233). This website links no
// dynasties.
const periodDynasty = (c) => removeEndingPoint(c.text.dynasty)

const monumentFacts = [
  { key: 'alsoKnownAs', label: 'sheet.field.alsoKnownAs', value: 'alternate_name' },
  { key: 'location', label: 'sheet.field.location', value: 'location' },
  { key: 'date', label: 'sheet.field.dateOfMonument', value: 'dates' },
  { key: 'architects', label: 'sheet.field.architects', value: 'architects' },
  { key: 'dynasty', label: 'sheet.field.periodDynasty', value: periodDynasty },
  { key: 'patrons', label: 'sheet.field.patrons', value: (c) => c.text.patrons ?? c.text.initial_owner },
]

const objectFacts = [
  { key: 'alsoKnownAs', label: 'sheet.field.alsoKnownAs', value: 'alternate_name' },
  { key: 'location', label: 'sheet.field.location', value: 'location' },
  // The holder text, then the partner it refers to (`PartnerPanel`'s summary),
  // rendered by ItemDetail.vue's `holder` slot (decision D3).
  { key: 'holder', label: 'sheet.field.holdingMuseum', value: 'holder', render: 'custom' },
  { key: 'date', label: 'sheet.field.dateOfObject', value: 'dates' },
  // The artist's life data in brackets after the artist, as legacy printed it.
  { key: 'artists', label: 'sheet.field.artists', value: (c) => artistLine((c.record.artist_names ?? []).join(', '), c.text) },
  { key: 'scribe', label: 'sheet.field.scribe', value: 'scriber' },
  { key: 'inventoryNumber', label: 'sheet.field.inventoryNumber', value: (c) => c.record.owner_reference },
  { key: 'materials', label: 'sheet.field.materials', value: 'type' },
  { key: 'dimensions', label: 'sheet.field.dimensions', value: 'dimensions' },
  { key: 'dynasty', label: 'sheet.field.periodDynasty', value: periodDynasty },
  { key: 'provenance', label: 'sheet.field.provenance', value: 'provenance' },
  { key: 'workshop', label: 'sheet.field.workshop', value: 'workshop' },
  { key: 'binding', label: 'sheet.field.binding', value: 'binding_desc' },
  { key: 'currentOwner', label: 'sheet.field.currentOwner', value: 'owner' },
  { key: 'originalOwner', label: 'sheet.field.originalOwner', value: 'initial_owner' },
  { key: 'placeOfProduction', label: 'sheet.field.placeOfProduction', value: 'place_of_production' },
]

// The prose under the facts, in legacy's order and under its headings. The
// item's rights line (`notice_b`, the package's `copyright`) closes both.
const copyright = { key: 'copyright', label: 'sheet.field.copyrightInformation', value: 'copyright' }

const monumentSections = [
  { key: 'history', label: 'sheet.field.history', value: 'history' },
  { key: 'description', label: 'sheet.field.description', value: 'description' },
  { key: 'datation', label: 'sheet.field.monumentDatationMethod', value: 'method_for_datation' },
  { key: 'provenanceMethod', label: 'sheet.field.provenanceMethod', value: 'method_for_provenance' },
  { key: 'bibliography', label: 'sheet.field.bibliography', value: 'bibliography' },
  copyright,
]

const objectSections = [
  { key: 'description', label: 'sheet.field.description', value: 'description' },
  { key: 'datation', label: 'sheet.field.datationMethod', value: 'method_for_datation' },
  { key: 'obtention', label: 'sheet.field.obtentionMethod', value: 'obtention' },
  { key: 'provenanceMethod', label: 'sheet.field.provenanceMethod', value: 'method_for_provenance' },
  { key: 'bibliography', label: 'sheet.field.bibliography', value: 'bibliography' },
  {
    key: 'catalogue',
    label: 'sheet.field.catalogue',
    value: (c) => (c.text.catalogue_holding_link ? `[${c.text.catalogue_holding_link}](${c.text.catalogue_holding_link})` : ''),
  },
  copyright,
]

const isMonument = (ctx) => ctx.record?.type === 'monument'

export const itemSheetSpec = {
  entity: 'items',
  translations: ['glossary'],
  fields: (ctx) => (isMonument(ctx) ? monumentFacts : objectFacts),
  sections: (ctx) => (isMonument(ctx) ? monumentSections : objectSections),
  layout: 'table',
  // Legacy's collapsible short description (`pc_view_sdesc`), folded under
  // the description when the item also carries the shorter text.
  shortDescription: 'short_description',
  shortDescriptionAfter: 'description',
  related: { variant: 'list', heading: 'record.related.items' },
  route: 'item',
  // Legacy's gap under the pictures and under the sheet.
  spaced: true,
}
