<script setup>
import { I18nText } from '@museumwnf/viewer-core'
import { TimelineResultsView } from '@museumwnf/viewer-layout/views'
import { timelineEntranceSpec } from '../composables/timeline.js'
</script>

<template>
  <TimelineResultsView :spec="timelineEntranceSpec">
    <template #before>
      <h1 class="mwnf-heading">{{ $t('core.nav.timeline') }}</h1>
      <div class="mwnf-panel">
        <I18nText tag="p" class="intro-text" keypath="baroqueart.timeline.intro" />
      </div>
    </template>
  </TimelineResultsView>
</template>

<style scoped>
.intro-text {
  font-size: 13px;
  line-height: 1.65;
  color: var(--muted);
  margin-bottom: 0;
  font-family: 'Roboto', sans-serif;
}
</style>
