<template>
  <div class="progress-bar" ref="progressBar" @click="progressClick">
    <div class="bar-inner">
      <div class="progress" ref="progress">
      </div>
      <div class="progress-btn-wrapper">
        <!-- prevent:阻止浏览器的默认事件 -->
        <div class="progress-btn" ref="progressBtn"
             @touchstart.prevent="progressTouchStart"
             @touchmove.prevent="progressTouchMove"
             @touchend="progressTouchEnd"></div>
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
  created () {
    // 用于touch事件，从存储相关的state (为什么要在created里设置？)
    this.touch = {}
  },
  methods: {
    // touchStart
    progressTouchStart (e) {
      // 设置标志位 init 是否已经初始化
      this.touch.init = true
      // 获取点击位置
      this.touch.startX = e.touches[0].pageX
      // 获取进度条偏移的初始值
      this.touch.left = this.$refs.progress.clientWidth
    },
    // touchMove
    progressTouchMove (e) {
      if (!this.touch.init) {
        return
      }
      // 获取touch开始到结束的位移
      const deltaX = e.touches[0].pageX - this.touch.startX
      // 获取进度条最终偏移的长度 (限制条件)
      const offsetWidth = Math.min(this.$refs.progressBar.clientWidth - progressBtnWidth, Math.max(0, this.touch.left + deltaX))

      this._offset(offsetWidth)
    },
    // touchEnd
    progressTouchEnd (e) {
      this.touch.init = false
      this._triggerPercent()
    },
    // 点击进度条
    progressClick (e) {
      // 获取到偏移的位置 当点击progressBtn的时候，e.offsetX获取不对
      // this._offset(e.offsetX)
      const rect = this.$refs.progressBar.getBoundingClientRect()
      const offsetWidth = e.pageX - rect.left
      this._offset(offsetWidth)
      this._triggerPercent()
    },
    _triggerPercent () {
      const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth
      const percent = this.$refs.progress.clientWidth / barWidth
      this.$emit('percentChange', percent)
    },
    _offset(offsetWidth) {
      this.$refs.progress.style.width = `${offsetWidth}px`
      this.$refs.progressBtn.style[`transform`] = `translate3d(${offsetWidth}px, 0, 0)`
    }
  },
  watch: {
    // 观察比例变化
    percent (newPercent) {
      // 如果比例发生了变化
      if (newPercent >= 0 && !this.touch.init) {
        // 获取整个进度条的长度（应该减去小圆圈的直径）
        const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth
        // 根据比例算出进度条的长度
        const offsetWidth = newPercent * barWidth
        // 设置长度
        this._offset(offsetWidth)
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


