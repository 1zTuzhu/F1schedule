// 配置
const SCHEDULE_DATA_URL = 'data/f1-schedule-2025.json';

// 工具函数
async function fetchJSON(url, signal) {
  const res = await fetch(url, { 
    signal, 
    headers: { 'Accept': 'application/json' } 
  });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return res.json();
}

// 数据变量
let raceData = [];
let currentFilter = 'all';
let processedRaceData = [];

// 主播数据
const streamerData = [
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
    avatar: '🏎️',
    status: 'online'
  },
  {
    name: '马莎F1',
    description: 'F1赛事解说',
    platform: '腾讯直播',
    url: 'https://live.qq.com/10193696',
    avatar: '🏁',
    status: 'online'
  }
];

// 时区转换/格式化
function isBST(date) {
  const year = date.getUTCFullYear();
  const marchLastDay = new Date(Date.UTC(year, 2 + 1, 0));
  const marchLastSunday = new Date(marchLastDay);
  marchLastSunday.setUTCDate(marchLastDay.getUTCDate() - ((marchLastDay.getUTCDay() + 6) % 7));
  const octLastDay = new Date(Date.UTC(year, 10 + 1, 0));
  const octLastSunday = new Date(octLastDay);
  octLastSunday.setUTCDate(octLastDay.getUTCDate() - ((octLastDay.getUTCDay() + 6) % 7));
  const start = new Date(Date.UTC(year, marchLastSunday.getUTCMonth(), marchLastSunday.getUTCDate(), 1, 0));
  const end = new Date(Date.UTC(year, octLastSunday.getUTCMonth(), octLastSunday.getUTCDate(), 1, 0));
  return date >= start && date < end;
}

function londonLocalToUTCISO(y, m, d, hh, mm) {
  const candidate = new Date(Date.UTC(y, m - 1, d, hh, mm));
  if (isBST(candidate)) candidate.setUTCHours(candidate.getUTCHours() - 1);
  return candidate.toISOString();
}

function formatInBeijing(date) {
  return date.toLocaleString('zh-CN', {
    hour12: false,
    timeZone: 'Asia/Shanghai',
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long',
  });
}

function formatTimeInBeijing(date) {
  return date.toLocaleTimeString('zh-CN', {
    hour12: false, timeZone: 'Asia/Shanghai', hour: '2-digit', minute: '2-digit'
  });
}

// 格式化时间显示
function formatSessionTime(sessionTime) {
  if (!sessionTime) return '待定';
  
  const date = new Date(sessionTime);
  return date.toLocaleTimeString('zh-CN', {
    hour12: false, 
    timeZone: 'Asia/Shanghai', 
    hour: '2-digit', 
    minute: '2-digit'
  });
}

// 格式化日期显示
function formatSessionDate(sessionTime) {
  if (!sessionTime) return '';
  
  const date = new Date(sessionTime);
  return date.toLocaleDateString('zh-CN', {
    timeZone: 'Asia/Shanghai',
    month: 'short',
    day: 'numeric',
    weekday: 'short'
  });
}

// 获取阶段图标
function getSessionIcon(sessionType) {
  const icons = {
    fp1: '●',
    fp2: '●', 
    fp3: '●',
    qualy: '●',
    race: '●',
    sprintQualy: '●',
    sprintRace: '●'
  };
  return icons[sessionType] || '●';
}

// 从本地JSON文件加载赛程数据
async function loadScheduleData(signal) {
  try {
    const data = await fetchJSON(SCHEDULE_DATA_URL, signal);
    
    if (data && data.races && Array.isArray(data.races)) {
      raceData = data.races;
      console.log(`成功加载 ${raceData.length} 场比赛数据`);
      return { ok: true };
    }
    
    console.log('JSON数据格式错误');
    return { ok: false };
    
  } catch (e) {
    console.log('加载赛程数据失败:', e.message);
    return { ok: false };
  }
}

// 实时更新比赛状态
function updateRaceStatus() {
  const now = new Date();
  
  raceData = raceData.map(race => {
    const raceTime = race.sessions?.race ? new Date(race.sessions.race) : null;
    let status = 'upcoming';
    
    if (raceTime) {
      const raceEndTime = new Date(raceTime.getTime() + 3 * 60 * 60 * 1000);
      
      if (now >= raceTime) {
        status = 'completed';
      }
    }
    
    return { ...race, status };
  });
  
  // 重新处理数据并更新UI
  processRaceData();
  renderRaces();
  updateStats();
}

// 数据处理与渲染
function processRaceData() {
  const now = new Date();
  processedRaceData = raceData.map(race => {
    // 计算比赛状态（基于正赛时间）
    const raceTime = race.sessions?.race ? new Date(race.sessions.race) : null;
    let status = 'upcoming';
    let timeToRace = 0;
    
    if (raceTime) {
      const raceEndTime = new Date(raceTime.getTime() + 3 * 60 * 60 * 1000);
      timeToRace = raceTime.getTime() - now.getTime();
      
      if (now >= raceTime && now <= raceEndTime) status = 'live';
      else if (now > raceEndTime) status = 'completed';
    }
    
    return {
      ...race,
      raceTime,
      status,
      timeToRace
    };
  });

  // 标记下一场比赛
  const upcoming = processedRaceData
    .filter(r => r.status === 'upcoming' && r.raceTime)
    .sort((a, b) => a.raceTime - b.raceTime);
  processedRaceData = processedRaceData.map(r => ({ ...r, isNext: false }));
  if (upcoming.length) {
    const nextId = upcoming[0].round;
    processedRaceData = processedRaceData.map(r =>
      r.round === nextId ? { ...r, isNext: true } : r
    );
  }

  // 排序：进行中 > 即将开始 > 已完赛
  const orderVal = r => r.status === 'live' ? 0 : (r.status === 'upcoming' ? 1 : 2);
  processedRaceData.sort((a, b) => {
    const statusDiff = orderVal(a) - orderVal(b);
    if (statusDiff !== 0) return statusDiff;
    if (a.raceTime && b.raceTime) return a.raceTime - b.raceTime;
    return a.round - b.round;
  });
}

function getCountdownText(ms) {
  if (ms <= 0) return '';
  const d = Math.floor(ms / (1000 * 60 * 60 * 24));
  const h = Math.floor(ms / (1000 * 60 * 60)) % 24;
  const m = Math.floor(ms / (1000 * 60)) % 60;
  if (d > 0) return `${d}天${h}小时后开始`;
  if (h > 0) return `${h}小时${m}分钟后开始`;
  if (m > 0) return `${m}分钟后开始`;
  return '即将开始';
}

// 格式化时间显示
function formatSessionTime(sessionTime) {
  if (!sessionTime) return '待定';
  const date = new Date(sessionTime);
  return formatTimeInBeijing(date);
}

// 创建比赛时间表 - 水平布局版本
function createSessionSchedule(race) {
  const sessions = race.sessions || {};
  
  if (race.isSprint) {
    // 冲刺赛周末：只显示关键时间
    return `
      <div class="session-schedule">
        <div class="session-row">
          <span class="session-label">
            <span class="session-icon">${getSessionIcon('fp1')}</span>
            练习赛1
          </span>
          <span class="session-time">
            <span class="session-date">${formatSessionDate(sessions.fp1)}</span>
            <span class="session-time-value">${formatSessionTime(sessions.fp1)}</span>
          </span>
        </div>
        <div class="session-row">
          <span class="session-label">
            <span class="session-icon sprint">${getSessionIcon('sprintQualy')}</span>
            冲刺排位
          </span>
          <span class="session-time">
            <span class="session-date">${formatSessionDate(sessions.sprintQualy)}</span>
            <span class="session-time-value">${formatSessionTime(sessions.sprintQualy)}</span>
          </span>
        </div>
        <div class="session-row">
          <span class="session-label">
            <span class="session-icon sprint">${getSessionIcon('sprintRace')}</span>
            冲刺赛
          </span>
          <span class="session-time">
            <span class="session-date">${formatSessionDate(sessions.sprintRace)}</span>
            <span class="session-time-value">${formatSessionTime(sessions.sprintRace)}</span>
          </span>
        </div>
        <div class="session-row">
          <span class="session-label">
            <span class="session-icon">${getSessionIcon('qualy')}</span>
            正赛排位
          </span>
          <span class="session-time">
            <span class="session-date">${formatSessionDate(sessions.qualy)}</span>
            <span class="session-time-value">${formatSessionTime(sessions.qualy)}</span>
          </span>
        </div>
        <div class="session-row highlight">
          <span class="session-label">
            <span class="session-icon">${getSessionIcon('race')}</span>
            正赛
          </span>
          <span class="session-time">
            <span class="session-date">${formatSessionDate(sessions.race)}</span>
            <span class="session-time-value">${formatSessionTime(sessions.race)}</span>
          </span>
        </div>
      </div>
    `;
  } else {
    // 常规周末：显示所有阶段
    return `
      <div class="session-schedule">
        <div class="session-row">
          <span class="session-label">
            <span class="session-icon">${getSessionIcon('fp1')}</span>
            练习赛1
          </span>
          <span class="session-time">
            <span class="session-date">${formatSessionDate(sessions.fp1)}</span>
            <span class="session-time-value">${formatSessionTime(sessions.fp1)}</span>
          </span>
        </div>
        <div class="session-row">
          <span class="session-label">
            <span class="session-icon">${getSessionIcon('fp2')}</span>
            练习赛2
          </span>
          <span class="session-time">
            <span class="session-date">${formatSessionDate(sessions.fp2)}</span>
            <span class="session-time-value">${formatSessionTime(sessions.fp2)}</span>
          </span>
        </div>
        <div class="session-row">
          <span class="session-label">
            <span class="session-icon">${getSessionIcon('fp3')}</span>
            练习赛3
          </span>
          <span class="session-time">
            <span class="session-date">${formatSessionDate(sessions.fp3)}</span>
            <span class="session-time-value">${formatSessionTime(sessions.fp3)}</span>
          </span>
        </div>
        <div class="session-row">
          <span class="session-label">
            <span class="session-icon">${getSessionIcon('qualy')}</span>
            排位赛
          </span>
          <span class="session-time">
            <span class="session-date">${formatSessionDate(sessions.qualy)}</span>
            <span class="session-time-value">${formatSessionTime(sessions.qualy)}</span>
          </span>
        </div>
        <div class="session-row highlight">
          <span class="session-label">
            <span class="session-icon">${getSessionIcon('race')}</span>
            正赛
          </span>
          <span class="session-time">
            <span class="session-date">${formatSessionDate(sessions.race)}</span>
            <span class="session-time-value">${formatSessionTime(sessions.race)}</span>
          </span>
        </div>
      </div>
    `;
  }
}

function createRaceCard(race) {
  const statusText = {
    completed: '已完赛',
    upcoming: '即将开始'
  };
  
  const cardClass = `race-card ${race.status} ${race.isNext ? 'next-race' : ''}`;
  const statusClass = `status ${race.status} ${race.isNext ? 'next' : ''}`;
  const finalStatus = race.isNext ? '下场比赛' : statusText[race.status];
  
  const sprintBadge = race.isSprint ? '<span class="sprint-badge">冲刺赛</span>' : '';

  return `<div class="${cardClass}" data-round="${race.round}">
    <div class="race-header">
      <div>
        <div class="race-name">${race.name} ${sprintBadge}</div>
        <div class="race-location">${race.location}</div>
      </div>
      <div class="race-round">第${race.round}轮</div>
    </div>
    <div class="race-status">
      <div class="${statusClass}">${finalStatus}</div>
    </div>
    ${createSessionSchedule(race)}
  </div>`;
}

function createStreamerCard(streamer) {
  return `
    <div class="streamer-card">
      <div class="streamer-avatar">${streamer.avatar}</div>
      <h3 class="streamer-name">${streamer.name}</h3>
      <a href="${streamer.url}" target="_blank" class="watch-btn">观看</a>
    </div>
  `;
}

function renderStreamers() {
  const root = document.getElementById('raceGrid');
  root.classList.add('streamers');
  root.innerHTML = streamerData.map(createStreamerCard).join('');
}

function renderRaces() {
  const root = document.getElementById('raceGrid');
  
  // 如果是主播列表视图
  if (currentFilter === 'streamers') {
    renderStreamers();
    return;
  }
  
  // 移除主播网格类
  root.classList.remove('streamers');
  
  let list = processedRaceData;
  if (currentFilter === 'upcoming') list = list.filter(r => r.isNext);
  else if (currentFilter === 'completed') list = list.filter(r => r.status === 'completed');
  else if (currentFilter === 'next') list = list.filter(r => r.isNext);

  if (!list.length) {
    root.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:40px;color:#ccc">
      <div style="font-size:2rem;margin-bottom:10px">🏁</div>
      <div>没有找到符合条件的比赛</div>
    </div>`;
    return;
  }
  root.innerHTML = list.map(createRaceCard).join('');
}

function updateStats() {
  const completed = processedRaceData.filter(r => r.status === 'completed').length;
  const upcoming = processedRaceData.filter(r => r.status === 'upcoming').length;
  document.getElementById('completedRaces').textContent = completed;
  document.getElementById('upcomingRaces').textContent = upcoming;
}


function initialize() {
  processRaceData();
  renderRaces();
  updateStats();
}

// 事件监听器
addEventListener('DOMContentLoaded', () => {
  console.log('F1日历初始化开始...');
  
  // 启动时加载本地赛程数据
  const ctrl = new AbortController();
  const timeoutId = setTimeout(() => ctrl.abort(), 5000);
  loadScheduleData(ctrl.signal).then(res => {
    clearTimeout(timeoutId);
    if (res && res.ok) {
      console.log('赛程数据加载成功');
      processRaceData();
      renderRaces();
      updateStats();
    } else {
      console.log('赛程数据加载失败，显示空状态');
      // 显示空状态而不是空白页面
      document.getElementById('raceGrid').innerHTML = `
        <div style="grid-column:1/-1;text-align:center;padding:40px;color:#ccc">
          <div style="font-size:2rem;margin-bottom:10px">🏁</div>
          <div>正在加载F1赛程数据...</div>
          <div style="font-size:0.9rem;margin-top:10px;opacity:0.7">
            如果长时间无响应，请检查网络连接
          </div>
        </div>
      `;
    }
  }).finally(() => {
    // 只有在成功获取数据时才调用initialize
    if (raceData.length > 0) {
      initialize();
    }
  });

  // 每分钟更新比赛状态
  setInterval(() => {
    updateRaceStatus();
  }, 60000);

  // 筛选按钮事件
  document.querySelector('.filters').addEventListener('click', e => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    console.log('筛选器切换:', currentFilter);
    renderRaces();
  });

  // 点击比赛卡片时更新状态
  document.getElementById('raceGrid').addEventListener('click', e => {
    const raceCard = e.target.closest('.race-card');
    if (!raceCard) return;
    
    const round = Number(raceCard.getAttribute('data-round'));
    console.log(`点击了第${round}轮比赛，更新状态...`);
    
    // 更新比赛状态
    updateRaceStatus();
  });

  
  console.log('F1日历初始化完成');
});