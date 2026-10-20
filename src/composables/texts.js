// Whether an entry has a text in the installed catalogue. viewer-core's `t()`
// returns the entry's own name when neither the active language nor English
// has it; a block whose text legacy supplies through the extraction
// (scripts/site-i18n) is left out until that text is there, rather than
// printing its name.
export function hasText(t, key) {
  return t(key) !== key
}
