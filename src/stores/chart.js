// stores/chart.js
import { defineStore } from 'pinia'
import axios from 'axios'

export const useChartStore = defineStore('chart', {
  state: () => ({
    userId: null,
    charts: [],
  }),
  actions: {
    async fetchWorkHours(userId) {
      this.userId = userId
      try {
        const res = await axios.get(`http://localhost:4000/api/charts/user/${userId}/work_hours`)
        const labels = res.data.data.map(d => d.date)
        const values = res.data.data.map(d => d.hours)
        this.charts = [{
          id: 'work_hours',
          title: 'Daily Work Hours',
          type: 'bar',
          data: { labels, values },
          options: { responsive: true, plugins: { legend: { display: false } } }
        }]
      } catch (err) {
        console.error('Failed to fetch chart data', err)
      }
    }
  }
})
