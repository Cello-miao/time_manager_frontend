import { defineStore } from 'pinia'
import axios from 'axios'

export const useClockStore = defineStore('clock', {
  state: () => ({
    userId: null,
    startDateTime: null, // 当前打卡开始时间
    clockIn: false       // 是否正在上班
  }),
  actions: {
    async refresh(userId) {
      this.userId = userId
      try {
        const res = await axios.get(`http://localhost:4000/api/clocks/user/${userId}`)
        const lastClock = res.data.data[0]  // 假设返回数组按时间倒序
        if (lastClock && lastClock.status) {
          this.startDateTime = lastClock.time
          this.clockIn = true
        } else {
          this.startDateTime = null
          this.clockIn = false
        }
      } catch (err) {
        console.error('Failed to refresh clock:', err)
      }
    },
    async clock() {
    if (!this.userId) return

    // 获取巴黎时间的 ISO 字符串
    const parisTime = new Date().toLocaleString("sv-SE", { timeZone: "Europe/Paris" })
    // 转成 "YYYY-MM-DDTHH:mm:ss" 格式
    const now = parisTime.replace(" ", "T")

    try {
        if (!this.clockIn) {
        // 上班打卡
        const res = await axios.post(`http://localhost:4000/api/clocks`, {
            clock: {
            time: now,
            status: true,
            user_id: this.userId
            }
        })
        this.startDateTime = res.data.data.time
        this.clockIn = true
        } else {
        // 下班打卡
        await axios.post(`http://localhost:4000/api/clocks`, {
            clock: {
            time: now,
            status: false,
            user_id: this.userId
            }
        })
        this.startDateTime = null
        this.clockIn = false
        }
    } catch (err) {
        console.error('Clock action failed', err)
    }
    }

  }
})
