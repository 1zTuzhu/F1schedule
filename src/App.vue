<template>
  <div class="container">
    <div class="content-area">
      <!-- 头部 -->
      <header class="header">
        <h1>F1赛历 2025</h1>
        <p>一级方程式世界锦标赛时间表 | 北京时间（UTC+8）</p>
      </header>

      <!-- 统计信息 -->
      <div class="stats">
        <div class="stat-item">
          <div class="stat-number">{{ totalRaces }}</div>
          <div class="stat-label">总比赛数</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">{{ completedRaces }}</div>
          <div class="stat-label">已完赛</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">{{ upcomingRaces }}</div>
          <div class="stat-label">待进行</div>
        </div>
      </div>

      <!-- 筛选器 -->
      <div class="filters">
        <button
          v-for="filter in filters"
          :key="filter.key"
          class="filter-btn"
          :class="{ active: currentFilter === filter.key }"
          @click="setFilter(filter.key)"
        >
          {{ filter.label }}
        </button>
      </div>

      <!-- 比赛网格 -->
      <div id="raceGrid" class="race-grid" :class="{ streamers: currentFilter === 'streamers' }">
        <!-- 主播卡片 -->
        <div v-if="currentFilter === 'streamers'" class="streamer-card" v-for="streamer in streamerData" :key="streamer.name">
          <div class="streamer-avatar">{{ streamer.avatar }}</div>
          <h3 class="streamer-name">{{ streamer.name }}</h3>
          <a :href="streamer.url" target="_blank" rel="noopener noreferrer" class="watch-btn">观看</a>
        </div>

        <!-- 比赛卡片 -->
        <div v-else-if="filteredRaces.length > 0">
          <div
            v-for="race in filteredRaces"
            :key="race.round"
            class="race-card"
            :class="[race.status, { 'next-race': race.isNext }]"
            :data-round="race.round"
          >
            <div class="race-header">
              <div>
                <div class="race-name">
                  {{ race.name }}
                  <span v-if="race.isSprint" class="sprint-badge">冲刺赛</span>
                </div>
                <div class="race-location">{{ race.location }}</div>
              </div>
              <div class="race-round">第{{ race.round }}轮</div>
            </div>

            <div class="race-status">
              <div class="status-text" :class="[race.status, { next: race.isNext }]">
                {{ getStatusText(race) }}
              </div>
            </div>

            <div class="session-schedule">
              <div
                v-for="session in getSessionList(race)"
                :key="session.type"
                class="session-row"
                :class="{ highlight: session.isHighlight }"
              >
                <span class="session-label">
                  <span class="session-icon" :class="{ sprint: session.isSprint }">{{ getSessionIcon(session.type) }}</span>
                  {{ session.label }}
                </span>
                <span class="session-time">
                  <span class="session-date">{{ formatSessionDate(session.time) }}</span>
                  <span class="session-time-value">{{ formatSessionTime(session.time) }}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else class="empty-state">
          <div class="empty-icon">🏁</div>
          <div>没有找到符合条件的比赛</div>
        </div>
      </div>
    </div>

    <!-- 版权声明 -->
    <div class="copyright">
      <div class="copyright-text">© 2025 1zTuzhu. All rights reserved.</div>
      <div class="copyright-details">
        <span>F1赛历数据来源于官方公开信息</span>
        <span>•</span>
        <span>本网站仅供学习和交流使用</span>
        <span>•</span>
        <span>如有侵权请联系删除</span>
      </div>
    </div>

    <!-- 返回顶部按钮 -->
    <button
      class="back-to-top"
      :class="{ show: showBackToTop }"
      @click="scrollToTop"
      title="返回顶部"
    >
      <span class="back-to-top-icon">↑</span>
    </button>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'

export default {
  name: 'App',
  setup() {
    // 响应式数据
    const raceList = ref([])
    const currentFilter = ref('all')
    const showBackToTop = ref(false)
    const loading = ref(false)

    // 筛选器配置
    const filters = ref([
      { key: 'all', label: '全部比赛' },
      { key: 'next', label: '下场比赛' },
      { key: 'completed', label: '已经结束' },
      { key: 'streamers', label: '观看直播' }
    ])

    // 主播数据
    const streamerData = ref([
      {
        name: '热水瓶RSPF1',
        description: 'F1赛事专业解说',
        platform: '腾讯直播',
        url: 'https://live.qq.com/10202119',
        avatar: '📺',
        status: 'online'
      },
      {
        name: '灵羽星F1',
        description: 'F1赛事解说',
        platform: '腾讯直播',
        url: 'https://live.qq.com/10182559',
        avatar: '📺',
        status: 'online'
      },
      {
        name: '马莎F1',
        description: 'F1赛事解说',
        platform: '腾讯直播',
        url: 'https://live.qq.com/10193696',
        avatar: '📺',
        status: 'online'
      }
    ])

    // 统计
    const totalRaces = computed(() => raceList.value.length)
    const completedRaces = computed(() => raceList.value.filter(r => r.status === 'completed').length)
    const upcomingRaces = computed(() => raceList.value.filter(r => r.status === 'upcoming').length)

    // 筛选后的列表
    const filteredRaces = computed(() => {
      if (currentFilter.value === 'upcoming') {
        return raceList.value.filter(r => r.status === 'upcoming')
      } else if (currentFilter.value === 'completed') {
        return raceList.value.filter(r => r.status === 'completed')
      } else if (currentFilter.value === 'next') {
        return raceList.value.filter(r => r.isNext)
      }
      return raceList.value
    })

    // 读取 public 中的数据
    const loadSchedule = async () => {
      loading.value = true
      try {
        const res = await fetch('/data/f1-schedule-2025.json', {
          headers: { 'Accept': 'application/json' }
        })
        if (!res.ok) throw new Error('schedule http ' + res.status)
        const json = await res.json()
        prepareRaceList(json?.races || [])
      } catch (e) {
        console.error('[schedule] load failed:', e)
        raceList.value = []
      } finally {
        loading.value = false
      }
    }

    // 处理数据：状态 / 下场比赛 / 排序
    const prepareRaceList = (racesRaw) => {
      const now = new Date()

      let list = (racesRaw || []).map(race => {
        const sessions = race.sessions || {}
        const raceISO = sessions.race || null
        const raceTime = raceISO ? new Date(raceISO) : null

        let status = 'upcoming'
        if (raceTime) {
          const raceEndTime = new Date(raceTime.getTime() + 3 * 60 * 60 * 1000)
          if (now >= raceTime && now <= raceEndTime) status = 'live'
          else if (now > raceEndTime) status = 'completed'
        }

        return {
          ...race,
          raceTime,
          status,
          timeToRace: raceTime ? raceTime.getTime() - now.getTime() : Infinity
        }
      })

      // 标记下一场（最近的 upcoming）
      const upcoming = list
        .filter(r => r.status === 'upcoming' && r.raceTime)
        .sort((a, b) => a.raceTime - b.raceTime)

      list = list.map(r => ({ ...r, isNext: false }))
      if (upcoming.length) {
        const nextRound = upcoming[0].round
        list = list.map(r => (r.round === nextRound ? { ...r, isNext: true } : r))
      }

      // 排序：进行中 > 即将开始 > 已完赛；同状态按时间/轮次
      const orderVal = r => (r.status === 'live' ? 0 : (r.status === 'upcoming' ? 1 : 2))
      list.sort((a, b) => {
        const sd = orderVal(a) - orderVal(b)
        if (sd !== 0) return sd
        if (a.raceTime && b.raceTime) return a.raceTime - b.raceTime
        return a.round - b.round
      })

      raceList.value = list
    }

    // 定时刷新状态（每分钟）
    const updateRaceStatus = () => {
      if (!raceList.value.length) return
      prepareRaceList(raceList.value.map(r => {
        // 保持原数据结构（sessions / round / name 等）
        return {
          round: r.round,
          name: r.name,
          location: r.location,
          isSprint: r.isSprint,
          sessions: r.sessions
        }
      }))
    }

    // 交互
    const setFilter = (filter) => {
      currentFilter.value = filter
    }

    const getStatusText = (race) => {
      if (race.isNext) return '下场比赛'
      const statusMap = {
        live: '进行中',
        completed: '已完赛',
        upcoming: '即将开始'
      }
      return statusMap[race.status] || '即将开始'
    }

    // 兼容不同的冲刺字段命名
    const getSessionList = (race) => {
      const s = race.sessions || {}
      const sprintQualy = s.sprintQualy || s.sprintShootout || s.shootout || null
      const sprintRace = s.sprintRace || s.sprint || null

      if (race.isSprint) {
        return [
          { type: 'fp1',         label: '练习赛1',   time: s.fp1,         isHighlight: false },
          { type: 'sprintQualy', label: '冲刺排位',   time: sprintQualy,   isHighlight: false, isSprint: true },
          { type: 'sprintRace',  label: '冲刺赛',     time: sprintRace,    isHighlight: false, isSprint: true },
          { type: 'qualy',       label: '正赛排位',   time: s.qualy,       isHighlight: false },
          { type: 'race',        label: '正赛',       time: s.race,        isHighlight: true  }
        ]
      } else {
        return [
          { type: 'fp1',   label: '练习赛1', time: s.fp1,   isHighlight: false },
          { type: 'fp2',   label: '练习赛2', time: s.fp2,   isHighlight: false },
          { type: 'fp3',   label: '练习赛3', time: s.fp3,   isHighlight: false },
          { type: 'qualy', label: '排位赛',   time: s.qualy, isHighlight: false },
          { type: 'race',  label: '正赛',     time: s.race,  isHighlight: true  }
        ]
      }
    }

    const getSessionIcon = (sessionType) => {
      const icons = {
        fp1: '●',
        fp2: '●',
        fp3: '●',
        qualy: '●',
        race: '●',
        sprintQualy: '●',
        sprintRace: '●'
      }
      return icons[sessionType] || '●'
    }

    const formatSessionTime = (sessionTime) => {
      if (!sessionTime) return '待定'
      const date = new Date(sessionTime)
      return date.toLocaleTimeString('zh-CN', {
        hour12: false,
        timeZone: 'Asia/Shanghai',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const formatSessionDate = (sessionTime) => {
      if (!sessionTime) return ''
      const date = new Date(sessionTime)
      return date.toLocaleDateString('zh-CN', {
        timeZone: 'Asia/Shanghai',
        month: 'short',
        day: 'numeric',
        weekday: 'short'
      })
    }

    const scrollToTop = () => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handleScroll = () => {
      showBackToTop.value = window.pageYOffset > 300
    }

    // 生命周期
    onMounted(() => {
      loadSchedule()
      window.addEventListener('scroll', handleScroll)
      // 每分钟刷新一次状态
      timer = window.setInterval(updateRaceStatus, 60 * 1000)
    })

    let timer = null
    onUnmounted(() => {
      window.removeEventListener('scroll', handleScroll)
      if (timer) window.clearInterval(timer)
    })

    return {
      // state
      raceList,
      currentFilter,
      showBackToTop,
      filters,
      streamerData,
      loading,
      // computed
      totalRaces,
      completedRaces,
      upcomingRaces,
      filteredRaces,
      // methods
      setFilter,
      getStatusText,
      getSessionList,
      getSessionIcon,
      formatSessionTime,
      formatSessionDate,
      scrollToTop
    }
  }
}
</script>

<style scoped>
/* 你已有的样式保留；这里只放空状态的示例 */
.empty-state {
  grid-column: 1/-1;
  text-align: center;
  padding: 40px;
  color: #ccc;
}
.empty-icon {
  font-size: 2rem;
  margin-bottom: 10px;
}
</style>
