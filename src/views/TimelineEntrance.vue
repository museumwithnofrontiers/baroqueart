<script setup>
import { TimelineResultsView } from '@museumwnf/viewer-layout/views'
import { timelineEntranceSpec } from '../composables/timeline.js'

// Legacy's hcr_home.php: the "Timeline" heading, then the country and date
// selectors. It prints no introduction above them.
</script>

<template>
  <TimelineResultsView :spec="timelineEntranceSpec">
    <template #before>
      <h1 class="mwnf-heading">{{ $t('baroqueart.nav.timeline') }}</h1>
    </template>
  </TimelineResultsView>
</template>
