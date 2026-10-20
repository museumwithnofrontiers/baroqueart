import { md } from '@museumwnf/viewer-core'

// The Sponsors page's rows: legacy's sponsor rows, as the extraction writes
// them (src/legacy/sponsors.json, `[{ label, region, name, web, remarks,
// logo }]`), with their Markdown rendered and their logo resolved to its
// built URL. `region` is the line legacy prints above a sponsor's name;
// `remarks` comes without legacy's italics, which the page adds. `logos`
// maps a path under theme/assets (`sponsors/34.jpg`) to that URL; a row
// whose logo the site doesn't hold shows none.
export function sponsorRows(rows, logos) {
  return (rows ?? []).map((row) => ({
    region: row.region ?? '',
    name: row.name ?? '',
    web: row.web ?? '',
    labelHtml: row.label ? md(row.label) : '',
    remarksHtml: row.remarks ? md(row.remarks) : '',
    logoUrl: row.logo ? logos[row.logo] ?? '' : '',
  }))
}

// Vite's glob of theme/assets, keyed by the path after `theme/assets/`.
export function assetMap(glob, prefix) {
  return Object.fromEntries(Object.entries(glob).map(([path, url]) => [path.replace(prefix, ''), url]))
}
