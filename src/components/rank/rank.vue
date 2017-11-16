<template>
 <div class="rank">
   <div class="toplist">
     <ul>
       <li class="item" v-for="(item, group) in topList" :key="group">
         <div class="icon">
           <img src="" width="100" height="100" v-lazy="item.picUrl">
         </div>
         <ul class="songlist">
           <li class="song">
             <span></span>
             <span></span>
           </li>
         </ul>
       </li>
     </ul>
   </div>
   <router-view></router-view>
 </div>
</template>

<script>
import {getTopList} from 'api/rank'
import {ERR_OK} from 'api/config'
export default {
  created () {
    this._getTopList()
  },
  data () {
    return {
      topList: []
    }
  },
  methods: {
    _getTopList () {
      getTopList().then(res => {
        if (res.code === ERR_OK) {
          this.topList = res.data.topList
        }
      })
    }
  }
}
</script>

<style lang="stylus" scoped>

</style>
