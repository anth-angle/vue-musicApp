<template>
  <div class="player" v-show="playlist.length > 0">
    <div class="normal-player" v-show="fullScreen">
      播放器
    </div>
    <div class="mini-player" v-show="!fullScreen">

    </div>
  </div>
</template>

<script>
  import {mapGetters} from 'vuex'

export default {
    computed: {
      ...mapGetters([
        'fullScreen',
        'playlist'
      ])
    }
}
</script>

<style lang="stylus" scoped>
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .play
    .normal-player
      position: fixed
      left: 0
      right: 0
      top: 0
      bottom: 0
</style>

