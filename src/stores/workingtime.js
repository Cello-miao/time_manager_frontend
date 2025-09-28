// stores/workingtime.js
import { defineStore } from 'pinia'
import axios from 'axios'

export const useWorkingTimeStore = defineStore('workingtime', {
  state: () => ({
    userId: { type: Number, required: false, default: null },
    workingTimes: [],
  }),
  actions: {
    async getWorkingTimes(userId) {
      this.userId = userId
      const res = await axios.get(`http://localhost:4000/api/workingtimes/user/${userId}`)
      this.workingTimes = res.data.data
    },
    async addWorkingTime(newTime) {
    if (!this.userId) return
    await axios.post(`http://localhost:4000/api/workingtimes`, {
        workingtime: {
        user_id: this.userId,
        start: newTime.start,
        end: newTime.end
        }
    })
    await this.getWorkingTimes(this.userId)
    },
    async updateWorkingTime(id, time) {
    await axios.patch(`http://localhost:4000/api/workingtimes/${id}`, {
        workingtime: {
        start: time.start,
        end: time.end,
        user_id: this.userId  // 注意 store.userId 需要提前设置
        }
    })
    await this.getWorkingTimes(this.userId)
    },
    async deleteWorkingTime(id) {
      await axios.delete(`http://localhost:4000/api/workingtimes/${id}`)
      await this.getWorkingTimes(this.userId)
    }
  }
})
