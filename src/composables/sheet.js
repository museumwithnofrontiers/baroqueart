import { artistLine, removeEndingPoint, renderPlain, useDataPackage } from '@museumwnf/viewer-core'

// The item sheet, as a spec: what viewer-layout's `RecordView` renders on
// `/item/:id`, inside the standalone family's sheet (ItemDetail.vue). The
// mechanics — which language the record is read in, what is loaded for it,
// the glossary terms it reaches, how a field becomes a row, the credits, the
// citation — are the platform's. What is declared here is only what is this
// website's: legacy `database_item.php`'s two orders, one for a monument and
// one for an object, each row under the word legacy printed for it in the
// record's own language (its `db_` term, baroqueart.sheet.*, from legacy's
// translation table), and the prose sections under them. Every label is an
// entry name, written out so the check that every name resolves can read it.

// A field legacy printed without its ending period (removeEndingPoint in
// modules/database_item.php); the others it printed as written.
const plain = (key) => (c) => removeEndingPoint(String(c.text[key] ?? ''))

// Legacy's Location line: the location and the province without their ending
// period, then the country's name in the sheet's language ("Governor's
// Palace, Brno, Moravia, Czech Republic").
const locationWithCountry = (c) =>
  [c.text.location, c.text.province]
    .map((part) => removeEndingPoint(part ?? ''))
    .concat(c.translations('countries')[c.record.country_id]?.name ?? '')
    .filter(Boolean)
    .join(', ')

const monumentFacts = [
  { key: 'name', label: 'baroqueart.sheet.nameOfMonument', value: plain('name') },
  { key: 'alsoKnownAs', label: 'baroqueart.sheet.alsoKnownAs', value: plain('alternate_name') },
  { key: 'location', label: 'baroqueart.sheet.location', value: locationWithCountry },
  { key: 'date', label: 'baroqueart.sheet.dateOfMonument', value: plain('dates') },
  { key: 'architects', label: 'baroqueart.sheet.architects', value: 'architects' },
  { key: 'dynasty', label: 'baroqueart.sheet.periodDynasty', value: plain('dynasty') },
  { key: 'type', label: 'baroqueart.sheet.monumentType', value: 'type' },
  { key: 'patrons', label: 'baroqueart.sheet.patrons', value: (c) => c.text.patrons ?? c.text.initial_owner },
]

const objectFacts = [
  { key: 'name', label: 'baroqueart.sheet.nameOfObject', value: plain('name') },
  { key: 'alsoKnownAs', label: 'baroqueart.sheet.alsoKnownAs', value: plain('alternate_name') },
  { key: 'location', label: 'baroqueart.sheet.location', value: locationWithCountry },
  // The holder text, then the partner it refers to (`PartnerPanel`'s summary),
  // rendered by ItemDetail.vue's `holder` slot (decision D3).
  { key: 'holder', label: 'baroqueart.sheet.holdingMuseum', value: plain('holder'), render: 'custom' },
  { key: 'originalOwner', label: 'baroqueart.sheet.originalOwner', value: plain('initial_owner') },
  { key: 'currentOwner', label: 'baroqueart.sheet.currentOwner', value: plain('owner') },
  { key: 'date', label: 'baroqueart.sheet.dateOfObject', value: plain('dates') },
  // The page's language's own artist line, then the artist's life data in
  // brackets, as legacy printed it; nothing when that language has no line.
  { key: 'artists', label: 'baroqueart.sheet.artists', value: (c) => artistLine(c.text.artist, c.text) },
  { key: 'scribe', label: 'baroqueart.sheet.scribe', value: 'scriber' },
  { key: 'inventoryNumber', label: 'baroqueart.sheet.inventoryNumber', value: (c) => removeEndingPoint(String(c.record.owner_reference ?? '')) },
  // Legacy's Material(s) / Technique(s) line is the record's own materials
  // column, as written (inventory-app#2233 C23); the package ships it as one
  // entry.
  { key: 'materials', label: 'baroqueart.sheet.materials', value: (c) => c.text.materials, join: '; ' },
  { key: 'dimensions', label: 'baroqueart.sheet.dimensions', value: plain('dimensions') },
  { key: 'dynasty', label: 'baroqueart.sheet.periodDynasty', value: plain('dynasty') },
  { key: 'workshop', label: 'baroqueart.sheet.workshop', value: 'workshop' },
  { key: 'provenance', label: 'baroqueart.sheet.provenance', value: 'provenance' },
  { key: 'type', label: 'baroqueart.sheet.type', value: 'type' },
  { key: 'placeOfProduction', label: 'baroqueart.sheet.placeOfProduction', value: 'place_of_production' },
  { key: 'binding', label: 'baroqueart.sheet.binding', value: 'binding_desc' },
]

// The prose under the facts, in legacy's order and under its headings. The
// item's rights line (`notice_b`, the package's `copyright`) closes both.
const copyright = { key: 'copyright', label: 'baroqueart.sheet.copyrightInformation', value: 'copyright' }

const monumentSections = [
  { key: 'history', label: 'baroqueart.sheet.history', value: 'history' },
  { key: 'description', label: 'baroqueart.sheet.description', value: 'description' },
  { key: 'datation', label: 'baroqueart.sheet.monumentDatationMethod', value: 'method_for_datation' },
  { key: 'bibliography', label: 'baroqueart.sheet.bibliography', value: 'bibliography' },
  copyright,
]

const objectSections = [
  { key: 'description', label: 'baroqueart.sheet.description', value: 'description' },
  { key: 'datation', label: 'baroqueart.sheet.datationMethod', value: 'method_for_datation' },
  { key: 'obtention', label: 'baroqueart.sheet.obtentionMethod', value: 'obtention' },
  { key: 'provenanceMethod', label: 'baroqueart.sheet.provenanceMethod', value: 'method_for_provenance' },
  {
    key: 'catalogue',
    label: 'baroqueart.sheet.catalogue',
    value: (c) => {
      const link = removeEndingPoint(String(c.text.catalogue_holding_link ?? ''))
      return link ? `[${link}](${link})` : ''
    },
  },
  { key: 'bibliography', label: 'baroqueart.sheet.bibliography', value: 'bibliography' },
  copyright,
]

// The credits as legacy printed them: each author type's `db_` word, then the
// citation under its own, then the working number under its.
const credits = [
  { field: 'author', label: 'baroqueart.sheet.preparedBy' },
  { field: 'copy_editor', label: 'baroqueart.sheet.copyeditedBy' },
  { field: 'translator', label: 'baroqueart.sheet.translationBy' },
  { field: 'translation_copy_editor', label: 'baroqueart.sheet.translationCopyeditedBy' },
]

const isMonument = (ctx) => ctx.record?.type === 'monument'

// Legacy's citation (modules/database_item.php): the writers' names as their
// English record spells them, the name without its ending period in quotes,
// legacy's phrase for the project in the record's language, the year, then
// the page's address in italics on a line of its own.
const escapeHtml = (value) =>
  String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
export function legacyCitation(c, { permalink, year }) {
  const english = useDataPackage().tr('items', c.record.id, 'en')
  const writers = removeEndingPoint(renderPlain(String(english.author ?? ''))).trim()
  const name = removeEndingPoint(renderPlain(String(c.text.name ?? c.record.internal_name ?? ''))).trim()
  const phrase = escapeHtml(c.tIn('baroqueart.sheet.citationIn'))
  const sentence = `${[escapeHtml(writers), `"${escapeHtml(name)}"`].filter(Boolean).join(' ')} ${phrase} ${year}.`
  return permalink ? `${sentence} <br><i>${escapeHtml(permalink)}</i>` : sentence
}

export const itemSheetSpec = {
  entity: 'items',
  translations: ['glossary', 'countries'],
  fields: (ctx) => (isMonument(ctx) ? monumentFacts : objectFacts),
  sections: (ctx) => (isMonument(ctx) ? monumentSections : objectSections),
  // Legacy's sheet: each label over its value (modules/database_item.php's
  // h3 and p), each in the record's language as db_GetTERM printed it.
  layout: 'list',
  labelsInRecordLanguage: true,
  // Legacy's monument page fetched at most 15 pictures (`LIMIT 0,15`); an
  // object page, all of them.
  pictureLimit: (ctx) => (isMonument(ctx) ? 15 : 0),
  // Legacy's collapsible short description (`pc_view_sdesc`), folded under
  // the description when the item also carries the shorter text.
  shortDescription: 'short_description',
  shortDescriptionAfter: 'description',
  related: { variant: 'list', heading: 'record.related.items' },
  credits,
  citation: { heading: 'baroqueart.sheet.citation', format: legacyCitation },
  workingNumberLabel: 'baroqueart.sheet.workingNumber',
  route: 'item',
  // Legacy's gap under the pictures and under the sheet.
  spaced: true,
}
