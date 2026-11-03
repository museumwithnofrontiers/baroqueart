<script setup>
import { useI18n } from '@museumwnf/viewer-core'
import { useData } from '../composables/data.js'

// A monument's visitor contact as legacy's sheet offered it under the
// Location (modules/database_item.php, `.su_tooltip`): "Contact Details",
// and over it, on hover, a box with the phone glyph and the monument's name,
// address, phone, fax, e-mail and responsible institution, each on its line.
// It opens on focus too, for the keyboard.
defineProps({
  /** The translation's `contact`: { address, phone, fax, email, institution }. */
  contact: { type: Object, required: true },
  /** The monument's name in that language (Markdown). */
  name: { type: String, default: '' },
})
const { mdInline } = useData()
const { t } = useI18n()
</script>

<template>
  <div class="baroqueart-contact" tabindex="0">
    {{ t('baroqueart.sheet.contactDetails') }}
    <span class="baroqueart-contact__content" role="tooltip">
      <span class="baroqueart-contact__text">
        <span class="baroqueart-contact__inner">
          <span class="baroqueart-contact__icon" aria-hidden="true"></span>
          <span class="baroqueart-contact__body">
            <span v-if="name" v-html="mdInline(name)"></span>
            <span v-if="contact.address" v-html="mdInline(contact.address)"></span>
            <span v-if="contact.phone">{{ t('baroqueart.contact.phone') }}{{ contact.phone }}</span>
            <span v-if="contact.fax">{{ t('baroqueart.contact.fax') }}{{ contact.fax }}</span>
            <span v-if="contact.email">{{ t('baroqueart.contact.email') }}{{ contact.email }}</span>
            <span v-if="contact.institution">
              <span v-html="mdInline(contact.institution)"></span>&nbsp;{{ t('baroqueart.contact.responsible') }}
            </span>
          </span>
        </span>
      </span>
    </span>
  </div>
</template>

<style>
/* Legacy's style_inside.css (.su_tooltip): the line as a sheet link, the box
   450px wide from 167px left of the line's middle, 20px under it, a 10px
   navy edge and its arrow, then the blue box: the glyph in its 30%, the
   lines white and light in the rest. */
/* Legacy draws it at the labels' 2px, out of the value's indent, under the
   Location's 10px. */
.baroqueart-contact {
  position: relative;
  display: inline-block;
  margin-top: 10px;
  margin-left: -12px;
  padding-left: 14px;
  font: 400 16px/22px Roboto, sans-serif;
  color: #12376b;
  cursor: pointer;
  background: url('../../theme/assets/next_arrow.png') no-repeat 0 5px;
}

.baroqueart-contact__content {
  position: absolute;
  z-index: 9999;
  top: 100%;
  left: 50%;
  display: block;
  width: 450px;
  max-width: calc(100vw - 30px);
  margin-left: -167px;
  padding-top: 20px;
  opacity: 0;
  pointer-events: none;
  cursor: default;
  transition: opacity 0.3s 0.3s;
}

.baroqueart-contact__content::after {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  margin-left: -10px;
  border: 10px solid transparent;
  border-bottom-color: #12376b;
}

.baroqueart-contact__text {
  display: block;
  overflow: hidden;
  border-top: 10px solid #12376b;
}

.baroqueart-contact__inner {
  display: table;
  box-sizing: border-box;
  width: 100%;
  min-height: 80px;
  padding: 30px 10px 30px 0;
  background: #3f6289;
}

.baroqueart-contact__icon {
  display: table-cell;
  width: 30%;
  height: 80px;
  font: 40px/80px FontAwesome;
  color: #fff;
  text-align: center;
  vertical-align: middle;
}

.baroqueart-contact__icon::before {
  content: '\f095';
}

.baroqueart-contact__body {
  display: table-cell;
  width: 70%;
  height: 80px;
  font: 300 16px/22px Roboto, sans-serif;
  color: #fff;
  vertical-align: middle;
}

.baroqueart-contact__body > span {
  display: block;
}

.baroqueart-contact:hover .baroqueart-contact__content,
.baroqueart-contact:focus-within .baroqueart-contact__content {
  opacity: 1;
  pointer-events: auto;
  transition-delay: 0s;
}

/* The phone drops the value's indent. */
@media (max-width: 47.9375rem) {
  .baroqueart-contact {
    margin-left: 2px;
  }
}

@media (max-width: 620px) {
  .baroqueart-contact__content {
    left: 65%;
  }
}

@font-face {
  font-family: 'FontAwesome';
  src: url('../../theme/assets/fontawesome-webfont.woff2') format('woff2');
  font-weight: normal;
  font-style: normal;
}
</style>
