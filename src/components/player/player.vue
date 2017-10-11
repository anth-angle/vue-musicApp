<template>
  <div class="player" v-show="playlist.length > 0">
    <transition name="normal"
                  @enter="enter"
                  @after-enter="afterEnter"
                  @leave="leave"
                  @after-leave="afterLeave">

      <div class="normal-player" v-show="fullScreen">
        <div class="background">
          <img :src="currentSong.image" alt="" width="100%" height="100%">
        </div>
        <div class="top">
          <div class="back" @click="back">
            <i class="icon-back"></i>
          </div>
          <h1 class="title" v-html="currentSong.name"></h1>
          <h2 class="subtitle" v-html="currentSong.singer"></h2>
        </div>
        <div class="middle"
            @touchstart.prevent="middleTouchStart"
            @touchmove.prevent="middleTouchMove"
            @touchend.prevent="middleTouchEnd"
        >
          <div class="middle-l">
            <div class="cd-wrapper" ref="cdWrapper">
              <div class="cd" :class="cdClass">
                <img :src="currentSong.image" alt="" class="image">
              </div>
            </div>
          </div>
          <scroll class="middle-r" ref="lyricList" :data="currentLyric && currentLyric.lines">
            <div class="lyric-wrapper">
              <div v-if="currentLyric">
                <p class="text" :class="{'current': currentLineNum === index}" v-for="(line , index) in currentLyric.lines" :key="index" ref="lyricLine">{{line.txt}}</p>
              </div>
            </div>
          </scroll>
        </div>
        <div class="bottom">
          <div class="dot-wrapper">
            <span class="dot" :class="{'active': currentShow === 'cd'}"></span>
            <span class="dot" :class="{'active': currentShow === 'lyric'}"></span>
          </div>
          <div class="progress-wrapper">
            <span class="time time-l">{{formatTime(currentTime)}}</span>
            <div class="progress-bar-wrapper">
              <progress-bar :percent="percent" @percentChange="progressBarChange"></progress-bar>
            </div>
            <span class="time time-r">{{formatTime(currentSong.duration)}}</span>
          </div>
          <div class="operators">
            <div class="icon i-left" @click="changeModel">
              <i :class="iconMode"></i>
            </div>
            <div class="icon i-left">
              <i class="icon-prev" @click="prev"></i>
            </div>
            <div class="icon i-center">
              <i :class="playIcon" @click="togglePlaying"></i>
            </div>
            <div class="icon i-right">
              <i class="icon-next" @click="next"></i>
            </div>
            <div class="icon i-right">
              <i class="icon icon-not-favorite"></i>
            </div>

          </div>
        </div>
      </div>
    </transition>
     <transition name="mini">
      <div class="mini-player" v-show="!fullScreen" @click="open">
        <div class="icon">
          <img :class="cdClass" :src="currentSong.image" alt="" width="40" height="40">
        </div>
        <div class="text">
          <h2 class="name" v-html="currentSong.name"></h2>
          <p class="desc" v-html="currentSong.singer"></p>
        </div>
        <div class="control">
          <progress-circle :radius="32" :percent="percent">
            <i class="icon-mini" :class="miniPlayIcon" @click.stop="togglePlaying"></i>
          </progress-circle>
        </div>
        <div class="control">
          <i class="icon-playlist"></i>
        </div>
      </div>
    </transition>
    <audio :src="currentSong.url" ref="audio" @canplay="ready" @error="error" @timeupdate="updateTime" @ended="end"></audio>
  </div>
</template>

<script>
  import {mapGetters, mapMutations} from 'vuex'
  import animations from 'create-keyframe-animation'
  import ProgressBar from 'base/progress-bar/progress-bar'
  import ProgressCircle from 'base/progress-circle/progress-circle'
  import {playModel} from 'common/js/config'
  import {shuffle} from 'common/js/util'
  import Lyric from 'lyric-parser'
  import Scroll from 'base/scroll/scroll'

export default {
    data () {
      return {
        songReady: false, // 歌曲是否可以播放
        currentTime: 0, // 歌曲播放的当前时间
        currentLyric: null, // 默认当前歌词
        currentLineNum: 0, // 当前歌词
        currentShow: 'cd' // 默认当前展示的页面
      }
    },
    created () {
      this.touch = {}
    },
    computed: {
      // 控制play按钮
      playIcon () {
        return this.playing ? 'icon-pause' : 'icon-play'
      },
      // 控制迷你play按钮
      miniPlayIcon () {
        return this.playing ? 'icon-pause-mini' : 'icon-play-mini'
      },
      // 控制cd旋转
      cdClass () {
        return this.playing ? 'play' : 'play pause'
      },
      // 实时获取当前时间与总时间的比例
      percent () {
        return this.currentTime / this.currentSong.duration
      },
      // 控制播放模式
      iconMode () {
        return this.model === playModel.sequence ? 'icon-sequence' : this.model === playModel.loop ? 'icon-loop' : 'icon-random'
      },
      // 获取状态
      ...mapGetters([
        'fullScreen',
        'playlist',
        'currentSong',
        'playing',
        'currentIndex',
        'model',
        'sequenceList'
      ])
    },
    methods: {
      enter (el, done) {
        const {x, y, scale} = this._getPosAndScale()

        let animation = {
          0: {
            transform: `translate3d(${x}px, ${y}px, 0) scale(${scale})`
          },
          60: {
            transform: `translate3d(0, 0, 0) scale(1.1)`
          },
          100: {
            transform: `translate3d(0, 0, 0) scale(1)`
          }
        }
        // 注册动画
        animations.registerAnimation({
          name: 'move',
          animation,
          presets: {
            duration: 400,
            easing: 'linear'
          }
        })
        // 执行动画
        animations.runAnimation(this.$refs.cdWrapper, 'move', done)
      },
      afterEnter () {
        // 注销动画
        animations.unregisterAnimation('move')
        this.$refs.cdWrapper.style.animation = ''
      },
      leave (el, done) {
        this.$refs.cdWrapper.style.transition = 'all 0.4s'
        const {x, y, scale} = this._getPosAndScale()
        this.$refs.cdWrapper.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`
        this.$refs.cdWrapper.addEventListener('transitionend', done)
      },
      afterLeave () {
        this.$refs.cdWrapper.style.transition = ''
        this.$refs.cdWrapper.style.transform = ''
      },
      // 返回上一个页面
      back () {
        this.setFullScreen(false)
      },
      // 点击歌曲列表，全屏播放
      open () {
        this.setFullScreen(true)
      },
      // audio canplay事件 当准备好播放时，songReady设置为true
      ready () {
        this.songReady = true
      },
      // audio error事件 当播放发生错误时
      error () {

      },
      // audio timeupdate事件 实时获取当前时间 参数 event对象
      updateTime (e) {
        this.currentTime = e.target.currentTime
      },
      // 格式化时间 将时间戳转化为 00:00
      formatTime (interval) {
        // 单竖杠 取整
        interval = interval | 0
        const minute = interval / 60 | 0
        const second = this._pad(interval % 60)

        return `${minute}:${second}`
      },
      // 当秒数小于10时，补零  num为数字，len为长度
      _pad (num, len = 2) {
        let n = num.toString().length
        while (n < len) {
          num = '0' + num
          n++
        }
        return num
      },
      // 监听touch
      progressBarChange (percent) {
        this.$refs.audio.currentTime = this.currentSong.duration * percent

        if (!this.playing) {
          this.togglePlaying()
        }
      },
      // 提交状态
      ...mapMutations({
        setFullScreen: 'SET_FULL_SCREEN',
        setPlayingState: 'SET_PLAYING_STATE',
        setCurrentIndex: 'SET_CURRENT_INDEX',
        setPlayModel: 'SET_PLAY_MODEL',
        setPlayList: 'SET_PLAYLIST'
      }),
      // 切换播放/暂停
      togglePlaying () {
        console.log(this.songReady)
        // 歌曲是否可以播放，如果不能，直接返回
        if (!this.songReady) {
          return
        }
        console.log('ready')
        this.setPlayingState(!this.playing)
        // 设置songReady为true
        // this.songReady = false
      },
      // 上一曲
      prev () {
        if (!this.songReady) {
          return
        }
        let index = this.currentIndex - 1
        if (index === -1) {
          index = this.playlist.length - 1
        }
        this.setCurrentIndex(index)
        if (!this.playing) {
          this.togglePlaying()
        }
        this.songReady = false
      },
      // 下一曲
      next () {
        if (!this.songReady) {
          return
        }
        let index = this.currentIndex + 1
        if (index === this.playlist.length) {
          index = 0
        }
        this.setCurrentIndex(index)
        if (!this.playing) {
          this.togglePlaying()
        }
        this.songReady = false
      },
      // 播放结束
      end () {
        if (this.model === playModel.loop) {
          this.loop()
        } else {
          this.next()
        }
      },
      // 获取歌词
      getLyric () {
        this.currentSong.getLyric().then((lyric) => {
          this.currentLyric = new Lyric(lyric, this.handleLyric)
          if (this.playing) {
            this.currentLyric.play()
          }
          console.log(this.currentLyric)
        })
      },
      // 控制歌词滚动
      handleLyric ({lineNum, txt}) {
        this.currentLineNum = lineNum
        // 大于5行歌词时，自动滚动到地5行，及保持歌词在第5行的位置
        if (lineNum > 5) {
          // 获取第5行元素的位置
          let scrollEl = this.$refs.lyricLine[lineNum - 5]
          // 调用better-scroll的内置方法scrollToElement 第一个参数为要滚动到的该元素位置， 第二个参数为滚动的动画时间，单位ms
          this.$refs.lyricList.scrollToElement(scrollEl, 1000)
        } else {
          // 当小于5行时，直接滚动到(0, 0)位置，及保持不动
          this.$refs.lyricList.scrollTo(0, 0, 1000)
        }
      },
      // 单曲循环
      loop () {
        // 设置当前时间为0，重新开始
        this.$refs.audio.currentTime = 0
        this.$refs.audio.play()
      },
      // 改变播放模式
      changeModel () {
        const model = (this.model + 1) % 3
        this.setPlayModel(model)
        let list = null
        if (model === playModel.random) {
          list = shuffle(this.sequenceList)
        } else {
          list = this.sequenceList
        }
        this.resetCurrentIndex(list)
        this.setPlayList(list)
      },
      // 当切换播放模式时，保证播放的一定是当前歌曲
      resetCurrentIndex (list) {
        // 获取当前歌曲的索引值
        let index = list.findIndex((item) => {
          return item.id === this.currentSong.id
        })
        this.setCurrentIndex(index)
      },
      middleTouchStart (e) {
        this.touch.init = true
        const touch = e.touches[0]
        this.touch.startX = touch.pageX
        this.touch.startY = touch.pageY
      },
      middleTouchMove (e) {
        if (!this.touch.init) {
          return
        }
        const touch = e.touches[0]
        const deltaX = touch.pageX - this.touch.startX
        const deltaY = touch.pageY - this.touch.startY
        // 如果判定上下位移大于左右位移，直接return
        if (Math.abs(deltaY) > Math.abs(deltaX)) {
          return
        }
        // 判断当前页面，如果是cd页面，则设置left为0，没有偏移，如果是lyric页面，这认为left向左（反向）评平移了整个屏幕的宽度
        const left = this.currentShow === 'cd' ? 0 : -window.innerWidth
        // 获取lyric页面平移的宽度
        // 1.假设当前页面是cd，手指向右滑动，则left=0，deltaX > 0 而-window.innerWidth < deltaX > 0
        // 所以width最终取值为0， 即仍然保持cd页面
        // 2.假设当前页面是cd，手指向左滑动，则left=0，deltaX > 0 而-window.innerWidth <= deltaX < 0
        // 所以width最终取值为deltaX， 即lyric页面向左平移了deltaX的距离
        // 3.假设当前页面是lyric，手指向左滑动，则left=-window.innerWidth，deltaX < 0 而-window.innerWidth <= deltaX < 0
        // 所以width最终取值为deltaX + window.innerWidth， 即lyric页面向左平移了deltaX + window.innerWidth的距离
        // 4.假设当前页面是lyric，手指向右滑动，则left=-window.innerWidth，deltaX > 0 而-window.innerWidth < deltaX > 0
        // 所以width最终取值为deltaX + window.innerWidth， 即lyric页面向左平移了window.innerWidth - deltaX的距离
        const width = Math.min(0, Math.max(-window.innerWidth, left + deltaX))
        // $el可以获取到当前元素的父元素，一般用于组件。这里是获取scroll组件
        this.$refs.lyricList.$el.style.transform = `translate3d(${width}px, 0, 0)`
      },
      middleTouchEnd (e) {

      },
      _getPosAndScale () {
        const targetWidth = 40
        const paddingLeft = 40
        const paddingBottom = 30
        const paddingTop = 80
        const width = window.innerWidth * 0.8
        const scale = targetWidth / width
        const x = -(window.innerWidth / 2 - paddingLeft)
        const y = window.innerHeight - paddingTop - width / 2 - paddingBottom

        return {
          x,
          y,
          scale
        }
      }
    },
    watch: {
      // 观察currentSong的状态：点击列表，currentSong发生变化，播放歌曲
      currentSong (newSong, oldSong) {
        // 如果新旧值的id都相等，表示是前后都是同一首歌曲，此时触发的是播放模式，不需要播放，直接return即可
        if (newSong.id === oldSong.id) {
          return
        }
        // 先获取到dom，再播放。否则会报错
        this.$nextTick(() => {
          this.$refs.audio.play()
          this.getLyric()
        })
      },
      // 观察playing的状态： 点击 play/pasue按钮，playing发生变化，播放/暂停歌曲
      playing (newPlaying) {
        const audio = this.$refs.audio
        // 先获取到dom，再播放。否则会报错
        this.$nextTick(() => {
          newPlaying ? audio.play() : audio.pause()
        })
      }
    },
    components: {
      ProgressBar,
      ProgressCircle,
      Scroll
    }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .player
    .normal-player
      position: fixed
      left: 0
      right: 0
      top: 0
      bottom: 0
      z-index: 150
      background: $color-background
      .background
        position: absolute
        left: 0
        top: 0
        width: 100%
        height: 100%
        z-index: -1
        opacity: 0.6
        filter: blur(20px)
      .top
        position: relative
        margin-bottom: 25px
        .back
          position absolute
          top: 0
          left: 6px
          z-index: 50
          .icon-back
            display: block
            padding: 9px
            font-size: $font-size-large-x
            color: $color-theme
            transform: rotate(-90deg)
        .title
          width: 70%
          margin: 0 auto
          line-height: 40px
          text-align: center
          no-wrap()
          font-size: $font-size-large
          color: $color-text
        .subtitle
          line-height: 20px
          text-align: center
          font-size: $font-size-medium
          color: $color-text
      .middle
        position: fixed
        width: 100%
        top: 80px
        bottom: 170px
        white-space: nowrap
        font-size: 0
        .middle-l
          display: inline-block
          vertical-align: top
          position: relative
          width: 100%
          height: 0
          padding-top: 80%
          .cd-wrapper
            position: absolute
            left: 10%
            top: 0
            width: 80%
            height: 100%
            .cd
              width: 100%
              height: 100%
              box-sizing: border-box
              border: 10px solid rgba(255, 255, 255, 0.1)
              border-radius: 50%
              &.play
                animation: rotate 20s linear infinite
              &.pause
                animation-play-state: paused
              .image
                position: absolute
                left: 0
                top: 0
                width: 100%
                height: 100%
                border-radius: 50%

          .playing-lyric-wrapper
            width: 80%
            margin: 30px auto 0 auto
            overflow: hidden
            text-align: center
            .playing-lyric
              height: 20px
              line-height: 20px
              font-size: $font-size-medium
              color: $color-text-l
        .middle-r
          display: inline-block
          vertical-align: top
          width: 100%
          height: 100%
          overflow: hidden
          .lyric-wrapper
            width: 80%
            margin: 0 auto
            overflow: hidden
            text-align: center
            .text
              line-height: 32px
              color: $color-text-l
              font-size: $font-size-medium
              &.current
                color: $color-text
      .bottom
        position: absolute
        bottom: 50px
        width: 100%
        .dot-wrapper
          text-align: center
          font-size: 0
          .dot
            display: inline-block
            vertical-align: middle
            margin: 0 4px
            width: 8px
            height: 8px
            border-radius: 50%
            background: $color-text-l
            &.active
              width: 20px
              border-radius: 5px
              background: $color-text-ll
        .progress-wrapper
          display: flex
          align-items: center
          width: 80%
          margin: 0px auto
          padding: 10px 0
          .time
            color: $color-text
            font-size: $font-size-small
            flex: 0 0 30px
            line-height: 30px
            width: 30px
            &.time-l
              text-align: left
            &.time-r
              text-align: right
          .progress-bar-wrapper
            flex: 1
        .operators
          display: flex
          align-items: center
          .icon
            flex: 1
            color: $color-theme
            &.disable
              color: $color-theme-d
            i
              font-size: 30px
          .i-left
            text-align: right
          .i-center
            padding: 0 20px
            text-align: center
            i
              font-size: 40px
          .i-right
            text-align: left
          .icon-favorite
            color: $color-sub-theme
      &.normal-enter-active, &.normal-leave-active
        transition: all 0.4s
        .top, .bottom
          transition: all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32)
      &.normal-enter, &.normal-leave-to
        opacity: 0
        .top
          transform: translate3d(0, -100px, 0)
        .bottom
          transform: translate3d(0, 100px, 0)
    .mini-player
      display: flex
      align-items: center
      position: fixed
      left: 0
      bottom: 0
      z-index: 180
      width: 100%
      height: 60px
      background: $color-highlight-background
      &.mini-enter-active, &.mini-leave-active
        transition: all 0.4s
      &.mini-enter, &.mini-leave-to
        opacity: 0
      .icon
        flex: 0 0 40px
        width: 40px
        padding: 0 10px 0 20px
        img
          border-radius: 50%
          &.play
            animation: rotate 10s linear infinite
          &.pause
            animation-play-state: paused
      .text
        display: flex
        flex-direction: column
        justify-content: center
        flex: 1
        line-height: 20px
        overflow: hidden
        .name
          margin-bottom: 2px
          no-wrap()
          font-size: $font-size-medium
          color: $color-text
        .desc
          no-wrap()
          font-size: $font-size-small
          color: $color-text-d
      .control
        flex: 0 0 30px
        width: 30px
        padding: 0 10px
        .icon-play-mini, .icon-pause-mini, .icon-playlist
          font-size: 30px
          color: $color-theme-d
        .icon-mini
          font-size: 32px
          position: absolute
          left: 0
          top: 0

  @keyframes rotate
    0%
      transform: rotate(0)
    100%
      transform: rotate(360deg)
</style>


