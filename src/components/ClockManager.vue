<script setup>
import { ref, watch, onMounted } from 'vue'
import { useClockStore } from '../stores/clock'

const props = defineProps({
  userId: { type: Number, required: true },
  show: { type: Boolean, default: false }
})
const emit = defineEmits(['close'])

const clockStore = useClockStore()

// 刷新打卡状态
const refreshClock = async () => {
  await clockStore.refresh(props.userId)
}

// 监听用户 ID 改变时刷新状态
watch(() => props.userId, async (id) => {
  if (id) await refreshClock()
})

// 打卡/下班
const toggleClock = async () => {
  await clockStore.clock()
}
</script>

<template>
  <div v-if="show" class="modal">
    <div class="modal-content">
      <h3>Clock Manager - User {{ props.userId }}</h3>

      <p>Status: <strong>{{ clockStore.clockIn ? 'Working' : 'Not Working' }}</strong></p>
      <p v-if="clockStore.clockIn">Start Time: {{ clockStore.startDateTime }}</p>

      <div class="actions">
        <button class="primary-btn" @click="toggleClock">
          {{ clockStore.clockIn ? 'Clock Out' : 'Clock In' }}
        </button>
        <button class="cancel-btn" @click="$emit('close')">Close</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal {
  position: fixed;
  top:0; left:0; right:0; bottom:0;
  background: rgba(0,0,0,0.4);
  display:flex;
  justify-content:center;
  align-items:center;
}
.modal-content {
  background: white;
  padding: 24px;
  border-radius: 12px;
  min-width: 400px;
  max-width: 500px;
  box-shadow: 0 5px 20px rgba(0,0,0,0.2);
}
button {
  padding: 8px 16px;
  margin: 4px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
}
.primary-btn {
  background-color: #d4edda;
  color: #155724;
}
.primary-btn:hover { background-color: #c3e6cb; }
.cancel-btn {
  background-color: #e2e3e5;
  color: #383d41;
}
.cancel-btn:hover { background-color: #d6d8db; }
.actions { margin-top: 20px; text-align: right; }
</style>
