<template>
  <div class="progress-bar" ref="progressBar">
    <div class="bar-inner">
      <div class="progress" ref="progress">
      </div>
      <div class="progress-btn-wrapper">
        <div class="progress-btn" ref="progressBtn"></div>
      </div>
    </div>
  </div>
</template>

<script>
const progressBtnWidth = 16

export default {
  props: {
    percent: {
      type: Number,
      default: 0
    }
  },
  watch: {
    // 观察比例变化
    percent (newPercent) {
      // 如果比例发生了变化
      if (newPercent >= 0) {
        // 获取整个进度条的长度（应该减去小圆圈的直径）
        const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth
        // 根据比例算出进度条的长度
        const offsetWidth = newPercent * barWidth
        // 设置长度
        this.$refs.progress.style.width = `${offsetWidth}px`
        this.$refs.progressBtn.style[`transform`] = `translate3d(${offsetWidth}px, 0, 0)`
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
  @import "~common/stylus/variable"

  .progress-bar
    height: 30px
    .bar-inner
      position: relative
      top: 13px
      height: 4px
      background: rgba(0, 0, 0, 0.3)
      .progress
        position: absolute
        height: 100%
        background: $color-theme
      .progress-btn-wrapper
        position: absolute
        left: -8px
        top: -13px
        width: 30px
        height: 30px
        .progress-btn
          position: relative
          top: 7px
          left: 7px
          box-sizing: border-box
          width: 16px
          height: 16px
          border: 3px solid $color-text
          border-radius: 50%
          background: $color-theme
</style>


