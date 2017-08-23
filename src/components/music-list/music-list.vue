<template>
  <div class="music-list">
    <div class="back">
      <i class="icon-back"></i>
    </div>
    <h1 class="title"></h1>
    <div class="big-image">
      <div class="filter"></div>
    </div>
  </div>
</template>

<script >
export default {
  props: {
    songs: {
      type: Array,
      default: []
    },
    title: {
      type: String,
      default: ''
    },
    bgImage: {
      type: String,
      default: ''
    }
  }
}
</script>

<style lang="stylus" scoped>
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .music-list
    position: fixed;
    top: 0
    left: 0
    right: 0
    bottom: 0
    z-index: 100
    background-color: $color-background
    .back
      position: absolute
      top: 0
      left: 6px
      z-index: 50
      .icon-back
      display: block
      padding: 10px
      font-size: $font-size-large-x
      color: $color-theme
    .title
      position: absolute
      top: 0
      left: 10%
      z-index: 40
      width: 80%
      no-wrap()
      text-align: center
      line-height: 40px
      font-size: $font-size-large
      color: $color-text
    .bg-image
      position: relative
      width: 100%
      height： 0
      padding-top: 70%
      transform-origin: top
      background-size: cover
      .player-wrapper
        position: absolute
        bottom: 20px
        z-index: 50
        width: 100%
        .play:
          box-sizing: border-box
          width: 135px
          padding: 7px 0
          margin: 0 auto
          text-align: center
          border: 1px solid $color-theme
          color: $color-theme
          border-radius: 100px
          font-size: 0
          .icon-play
            display: inline-block
            vertical-align: middle
            margin-right: 6px
            font-size: $font-size-medium-x
          .text
            display: inline-block
            vertical-align: middle
            font-size: $font-size-small
    .filter
      position: absolute
      top: 0
      left: 0
      width: 100%
      height: 100%
      background: rgba(7, 17, 27, 0.4)
</style>


