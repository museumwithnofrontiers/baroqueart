# Where these files come from

Every file here was downloaded from legacy *Discover Baroque Art* on 2026-10-20. The site
keeps its own copy of its chrome (story museumwithnofrontiers/inventory-app#2233, decision D7):
nothing is served from the legacy site or from `images.museumwnf.org`.

## Used by the site

| File | Legacy URL | sha256 | Used in |
|---|---|---|---|
| `public/favicon.ico` (served as is, so it lives in `public/`, not here) | https://baroqueart.museumwnf.org/favicon.ico | `35ee0786acc6fd844652b764fc5f58be3c664ce299c70a754b40f5d8a89c7496` | `index.html` |
| `logo_bar_en.png` | https://baroqueart.museumwnf.org/images/logo_bar_en.png | `1f17bace0ca1e67d9b222d051787dfefe5396598fe10e603df2a807cc97fa308` | the header (`src/dataset.config.js`, `standalone.logo`) |
| `banner.jpg` | https://baroqueart.museumwnf.org/images/banner.jpg | `e191f371359dd4016f8bdcee137636a640f39144d4232867a5011c6330ef2283` | the home page's banner (`src/dataset.config.js`) |
| `banner_inside.jpg` | https://baroqueart.museumwnf.org/images/banner_inside.jpg | `c04d8d84750a80aa7af15644f2a08656c9d5c03de1e41f2797e2b124e2a643d8` | every other page's banner (`src/dataset.config.js`) |
| `random_image/DBA_new/1.jpg` … `75.jpg` (75 files) | https://baroqueart.museumwnf.org/random_image/DBA_new/<n>.jpg (copied from the legacy checkout; the live files are identical, checked 2026-10-21) | `1.jpg`: `c4651066283e07dcce7ba8d7940df660b7ae7f4627e8b02cc10c4b140b220c56` | today's highlight on the home page (`standalone.home.highlight.pictures`) |

## Kept for the legacy layout (not used yet)

These belong to parts of legacy's layout the site does not have yet: the print header, the
partners and timeline boxes, the Virtual Exhibitions area and the Sponsors page.

| File | Legacy URL | sha256 | Legacy use |
|---|---|---|---|
| `logo_print.gif` | https://baroqueart.museumwnf.org/images/logo_print.gif | `d41dcb290764beb9f74a6bc4a2d5f9c642286a6e9694b1ba892b1119e5160fe8` | the logo printed on every inner page (`standalone.logo.print`) |
| `partner_bg.jpg` | https://baroqueart.museumwnf.org/images/partner_bg.jpg | `9229a0cf0b90da8f4fc84333a4ded54f99fdeba45b505535e786e4170c4c76f4` | the picture box of the Partners page |
| `hcr_header.gif` | https://baroqueart.museumwnf.org/images/hcr_header.gif | `0df2e67becc58502ba88c59ce04cb480d521d1aac0060b76483de8ed5c995c62` | the header of the timeline box |
| `exhibitions/bg.jpg` | https://baroqueart.museumwnf.org/exhibitions/BAR/images/bg.jpg | `be6647f38b5c49cf52d57309fd149c30dc20c9ea4da158f764fbc7f3f5d62fff` | the Virtual Exhibitions background |
| `exhibitions/bg_fading_left.gif` | https://baroqueart.museumwnf.org/exhibitions/BAR/images/bg_fading_left.gif | `88b4d1f6a1b9cb9c25c8e49ecc6ee08a68537572ad3f5fbec55e5de603b729c8` | its left edge |
| `exhibitions/bg_fading_right.gif` | https://baroqueart.museumwnf.org/exhibitions/BAR/images/bg_fading_right.gif | `fc199117a164caced00b6135f4a21ed177c8368d3995e5fa9014b98aec99f24e` | its right edge |
| `exhibitions/logo_en.gif` | https://baroqueart.museumwnf.org/exhibitions/BAR/images/logo_en.gif | `25bb385084d4d65b2ae7092255b84ed9961e9d06c02f04c5ded8245086376bc9` | the Virtual Exhibitions logo, English |
| `exhibitions/logo_de.gif` | https://baroqueart.museumwnf.org/exhibitions/BAR/images/logo_de.gif | `bfcf3b946012932f7a8af6ae10023f2f67f9ed77741bfa00a61efa819a14e8ed` | German |
| `exhibitions/logo_fr.gif` | https://baroqueart.museumwnf.org/exhibitions/BAR/images/logo_fr.gif | `5d539afe88fbe75815619d9808180b3333d78d512e5deae37483833f4480c1fe` | French |
| `exhibitions/logo_it.gif` | https://baroqueart.museumwnf.org/exhibitions/BAR/images/logo_it.gif | `cd1609d5b2b93de1a7177a3b4457d5a501bb63b7536cc1f4361c9b0b663da467` | Italian |
| `exhibitions/logo_pt.gif` | https://baroqueart.museumwnf.org/exhibitions/BAR/images/logo_pt.gif | `456ffca8d409048def8730811a03d76c52e49ac2f9c7a9528dd5489c6ddf5723` | Portuguese |
| `exhibitions/logo_es.gif` | https://baroqueart.museumwnf.org/exhibitions/BAR/images/logo_es.gif | `da4f8d434cd3a0cb3649f0ecc53d7824e85dced87628e3d5da6ab416e126e5bd` | Spanish |
| `exhibitions/logo_ar.gif` | https://baroqueart.museumwnf.org/exhibitions/BAR/images/logo_ar.gif | `dffc44f00d5488d21dafac73e4b41887b420ea9a8822a61d816142b50f0f33cd` | Arabic |
| `sponsors/34.jpg` | https://images.museumwnf.org/full/sponsors/34.jpg | `e46908a55189b937247d9b3bd13524ced0482ea9c408216abb45b0eeb1e82b46` | the Sponsors page (`atrium_sponsor_detail.php?id=BAR&flg=local`), once its rows are extracted |
| `sponsors/35.jpg` | https://images.museumwnf.org/full/sponsors/35.jpg | `6eb6099f58bf7259bd3c55adbde5e221273c72e5b520d8ec4da6932dd4b132d1` | 〃 |
| `sponsors/36.jpg` | https://images.museumwnf.org/full/sponsors/36.jpg | `b25cc924ba96c18bc63ee0f1e52880b6fe44d6d326f4d036e6fad7fc2c39b337` | 〃 |
| `sponsors/38.jpg` | https://images.museumwnf.org/full/sponsors/38.jpg | `1cc9f568fc773704ce5ed73f0990fc1d3251dcc4991f09f4826a8294b03d7015` | 〃 |
| `sponsors/40.jpg` | https://images.museumwnf.org/full/sponsors/40.jpg | `e4de3b3a45effeacf7868cfcf21ac5b94db50930e729933e3f5ea77303c4d448` | 〃 |
| `sponsors/44.jpg` | https://images.museumwnf.org/full/sponsors/44.jpg | `c310790b36c23380eab18ee086c7988061d23264597d8ebc4c6b673f7c1c6d5d` | 〃 |
| `sponsors/45.jpg` | https://images.museumwnf.org/full/sponsors/45.jpg | `1f7abfba93ca9e9d4fe2551980783113c1c96505a2411eb550f11b85c74fcff2` | 〃 |
| `sponsors/46.jpg` | https://images.museumwnf.org/full/sponsors/46.jpg | `cb8f99d9341ee7a935834f7992bc589e63555fc9e134fd0b539d204f94904db9` | 〃 |
| `sponsors/47.jpg` | https://images.museumwnf.org/full/sponsors/47.jpg | `ec335442924184262bf0e7466c6da77a8c1e9ce96780f59ae82ca58f5b06ec70` | 〃 |
| `sponsors/48.jpg` | https://images.museumwnf.org/full/sponsors/48.jpg | `92d75911caf5ab6fc856d23e2ef686aa39276b37988ba296f19dd6902d6898e2` | 〃 |
| `sponsors/49.jpg` | https://images.museumwnf.org/full/sponsors/49.jpg | `7e5ea041b1ab7e2dc7460b1118bf9427bd70316e6abc9be01b70a451d75fbaa1` | 〃 |
| `sponsors/50.jpg` | https://images.museumwnf.org/full/sponsors/50.jpg | `c031c77e0201f7e57d5d4bc379a3e7323a218b582953e642e7d8138a951e1567` | 〃 |
| `sponsors/51.jpg` | https://images.museumwnf.org/full/sponsors/51.jpg | `5108e471393ba4ada96df3eb4dc6d4ec1604570abc564911e55657aad1a35004` | 〃 |
| `sponsors/53.jpg` | https://images.museumwnf.org/full/sponsors/53.jpg | `76fbb8bfde0afe11bd502825c556de44cc3530543b4e7c140604a2b8df19df7f` | 〃 |
| `sponsors/54.jpg` | https://images.museumwnf.org/full/sponsors/54.jpg | `603b2950e63f873f4403baab7a4732ac65b3cb66fd2fbc9a10891d4076f03ba4` | 〃 |
| `sponsors/55.jpg` | https://images.museumwnf.org/full/sponsors/55.jpg | `e5a0784aca71763130fdf6bf5ff3a9a5fa449e68f595cb669b83fdd6d49c3ac6` | 〃 |

`logo_bar_ar.png` is byte-identical to `logo_bar_en.png`, so it is not kept twice. Legacy also
has `logo_print_fr.gif`, but its pages are English only, so they never show it. The Virtual
Exhibitions logo has no Czech, Hungarian, Croatian or Slovenian version on legacy (404).
