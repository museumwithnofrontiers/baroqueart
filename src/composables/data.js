import { useCatalogue } from '@museumwnf/viewer-core'

// The website's records, read the one way every website reads them: through
// viewer-core's catalogue data layer, lazily. Each entity is a shared ref that
// stays `null` until a route declaring it in `meta.entities` brings its chunk
// in, so importing this module loads nothing, and a page pays only for what
// it reads. The entity refs and lookups, the labels, the routes, the result
// row, the translations and the Markdown pipeline are `useCatalogue`'s. What
// is this website's own: the collection entity it reads on top. The
// Exhibitions tree lives in composables/exhibitions.js, over
// `useCollectionTree`.

// English is the base language of every catalogue in the platform: every list,
// label and fallback reads it. A record the visitor reads in another language
// is resolved on the sheet itself, by viewer-core's `useRecordLanguage`.
const defaultLang = 'en'

// `eager` is this site's own translation preload list (`timeline_events`, for
// the events' own text; `glossary`, since `md`/`mdInline` bind it up front;
// `timelines` carries no English translations of its own, so it stays out) —
// no `dynasties`, this site carries none.
const catalogue = useCatalogue({
  eager: ['items', 'countries', 'partners', 'timeline_events', 'collections', 'glossary'],
  defaultLanguage: defaultLang,
})
catalogue.loadEnglish()

const collections = catalogue.entity('collections')

export function useData() {
  return { ...catalogue, collections, defaultLang }
}
