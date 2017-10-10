import * as types from './mutation_types'
import {playModel} from 'common/js/config'
import {shuffle} from 'common/js/util'

function findIndex (list, song) {
  return list.findIndex((item) => {
    return item.id === song.id
  })
}

// 选择播放
export const selectPlay = function ({commit, state}, {list, index}) {
  commit(types.SET_SEQUENCE_LIST, list)
  // 如果发现播放模式是随机播放
  if (state.model === playModel.random) {
    // 对list重新洗牌
    let randomList = shuffle(list)
    // 提交洗牌后的list
    commit(types.SET_PLAYLIST, randomList)
    // 重新获取当前歌曲的index
    index = findIndex(randomList, list[index])
  } else {
    commit(types.SET_PLAYLIST, list)
  }
  commit(types.SET_CURRENT_INDEX, index)
  commit(types.SET_FULL_SCREEN, true)
  commit(types.SET_PLAYING_STATE, true)
}

// 随机播放
export const randomPlay = function ({commit}, {list}) {
  commit(types.SET_PLAY_MODEL, playModel.random)
  commit(types.SET_SEQUENCE_LIST, list)
  // 洗牌
  let randomList = shuffle(list)
  // 提交到mutations
  commit(types.SET_PLAYLIST, randomList)
  // 设置当前id为0
  commit(types.SET_CURRENT_INDEX, 0)
  commit(types.SET_FULL_SCREEN, true)
  commit(types.SET_PLAYING_STATE, true)
}
