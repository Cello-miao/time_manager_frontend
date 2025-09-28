// stores/user.js
import { defineStore } from 'pinia'
import axios from 'axios'

export const useUserStore = defineStore('user', {
  state: () => ({
    users: []
  }),
  actions: {
    async fetchUsers() {
      const res = await axios.get('http://localhost:4000/api/users')
      this.users = res.data.data
    },
    async createUser(user) {
      // 包装成 { user: { ... } }
      await axios.post('http://localhost:4000/api/users', { user })
      await this.fetchUsers()
    },
    async updateUser(id, user) {
      // 包装成 { user: { ... } }
      await axios.patch(`http://localhost:4000/api/users/${id}`, { user })
      await this.fetchUsers()
    },
    async deleteUser(id) {
      await axios.delete(`http://localhost:4000/api/users/${id}`)
      await this.fetchUsers()
    }
  }
})

export const useWorkingTimeStore = defineStore('workingtime', {
  state: () => ({
    userId: null,
    workingTimes: []
  }),
  actions: {
    async getWorkingTimes(userId) {
      this.userId = userId
      const res = await axios.get(`http://localhost:4000/api/workingtimes/user/${userId}`)
      this.workingTimes = res.data.data
    }
  }
})
