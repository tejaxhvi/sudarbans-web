<template>
  <RegionMeetups :config="config" />
</template>

<script>
import RegionMeetups from '@/components/RegionMeetups.vue'
import { regionConfigs } from './regionConfigs'

export default {
  name: 'KolkataMeetups',
  components: { RegionMeetups },
  data() {
    return {
      config: regionConfigs.kolkata,
    }
  },
}
</script>
