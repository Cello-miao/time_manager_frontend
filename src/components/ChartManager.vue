<script setup>
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import Chart from 'chart.js/auto'
import axios from 'axios'

const props = defineProps({
  userId: Number,
  show: Boolean
})
const emit = defineEmits(['close'])

const barChartRef = ref(null)
const lineChartRef = ref(null)
const pieChartRef = ref(null)

let barChartInstance = null
let lineChartInstance = null
let pieChartInstance = null

function close() {
  emit('close')
}

function initChart(canvas, type, data, options) {
  if (!canvas) return null
  return new Chart(canvas, { type, data, options })
}

function destroyCharts() {
  [barChartInstance, lineChartInstance, pieChartInstance].forEach(chart => {
    if (chart) chart.destroy()
  })
  barChartInstance = lineChartInstance = pieChartInstance = null
}

const fetchData = async () => {
  if (!props.userId) return
  try {
    const res = await axios.get(`http://localhost:4000/api/charts/user/${props.userId}/work_hours`)
    const raw = Array.isArray(res.data.data) ? res.data.data : []

    const labels = raw.map(r => r.date)
    const hours = raw.map(r => Number(r.hours))
    const last = hours[hours.length-1] || 0

    destroyCharts()

    await nextTick() // 确保 canvas 已渲染

    const commonOptions = { responsive: true, maintainAspectRatio: false }

    barChartInstance = initChart(barChartRef.value, 'bar', {
      labels,
      datasets: [{ label: 'Daily Work Hours', data: hours, backgroundColor: '#36a2eb' }]
    }, { ...commonOptions, plugins: { legend: { display: true }, title: { display: true, text: 'Daily Work Hours' } } })

    lineChartInstance = initChart(lineChartRef.value, 'line', {
      labels,
      datasets: [{ label: 'Work Hours Trend', data: hours, borderColor: '#ff6384', fill: false }]
    }, { ...commonOptions, plugins: { legend: { display: true }, title: { display: true, text: 'Work Hours Trend' } } })

    pieChartInstance = initChart(pieChartRef.value, 'pie', {
      labels: ['Worked', 'Remaining'],
      datasets: [{
        data: [last, Math.max(0, 24 - last)],
        backgroundColor: ['#36a2eb', '#e9ecef'],
        hoverOffset: 6
      }]
    }, {
      ...commonOptions,
      plugins: {
        legend: { display: true },
        title: { display: true, text: 'Work Hours Proportion (Last Day)' },
        tooltip: {
          callbacks: {
            label: ctx => {
              const val = ctx.parsed
              const total = ctx.dataset.data.reduce((a,b)=>a+b,0)
              const pct = total ? ((val/total)*100).toFixed(1) : 0
              return `${ctx.label}: ${val} h (${pct}%)`
            }
          }
        }
      }
    })

  } catch (err) {
    console.error('Failed to fetch chart data:', err)
  }
}

watch(() => props.show, val => { if(val) fetchData() })
watch(() => props.userId, val => { if(props.show && val) fetchData() })
onBeforeUnmount(() => destroyCharts())
</script>

<template>
  <div v-if="show" class="modal">
    <div class="modal-content">
      <h3>User {{ props.userId }} — Work Hours Charts</h3>

      <div class="chart-container">
        <div class="chart-box"><canvas ref="barChartRef"></canvas></div>
        <div class="chart-box"><canvas ref="lineChartRef"></canvas></div>
        <div class="chart-box"><canvas ref="pieChartRef"></canvas></div>
      </div>

      <div class="actions">
        <button class="cancel-btn" @click="close">Close</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal {
  position: fixed; inset: 0; background: rgba(0,0,0,0.45);
  display: flex; justify-content: center; align-items: center; padding: 20px; z-index: 9999;
}
.modal-content {
  background:white; border-radius:12px; padding:20px; width:95%; max-width:1100px; box-shadow:0 6px 28px rgba(0,0,0,0.2);
}
.chart-container {
  display: grid; 
  grid-template-columns: repeat(3, 1fr); 
  gap: 14px; 
  margin-top: 12px; 
}
.chart-box {
  position: relative; 
  height: 300px; 
}
@media(max-width: 900px) { 
  .chart-container { grid-template-columns: 1fr } 
  .chart-box { height: 260px } 
}
.actions { text-align: right; margin-top: 10px; }
.cancel-btn { background:#e2e3e5;color:#333;padding:8px 14px;border-radius:6px;border:none;cursor:pointer; }
</style>
