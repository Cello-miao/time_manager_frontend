<script setup>
import { ref, onMounted, watch } from 'vue'
import { useWorkingTimeStore } from '../stores/workingtime'

const props = defineProps({
  userId: { type: Number, required: true },
  show: { type: Boolean, default: false }
})

const emit = defineEmits(['close'])

const workingTimeStore = useWorkingTimeStore()

const newStart = ref('')
const newEnd = ref('')

// 每次 userId 改变时刷新数据
watch(
  () => props.userId,
  async (id) => {
    if (id) {
      await workingTimeStore.getWorkingTimes(id)
    }
  }
)

// 计算时间差（小时:分钟）
const calculateDuration = (start, end) => {
  if (!start || !end) return ''

  // 将字符串转换为 Date 对象
  const startDate = new Date(start)
  const endDate = new Date(end)

  let diffMinutes = (endDate - startDate) / 1000 / 60

  // 跨天处理，如果结束时间早于开始时间，假设跨一天
  if (diffMinutes < 0) diffMinutes += 24 * 60

  const hours = Math.floor(diffMinutes / 60)
  const minutes = Math.floor(diffMinutes % 60)
  return `${hours}:${minutes.toString().padStart(2,'0')}`
}

const openWorkingTimes = (userId) => {
  selectedUserId.value = userId
  workingTimeStore.userId = userId   // ✅ 设置 store.userId
  showWorkingTimesModal.value = true
}

const addTime = async () => {
  await workingTimeStore.addWorkingTime({
    start: newStart.value,
    end: newEnd.value
  })
  newStart.value = ''
  newEnd.value = ''
}

const editTimeId = ref(null)
const editStart = ref('')
const editEnd = ref('')
const showEditTimeModal = ref(false)

const startEditTime = (time) => {
  editTimeId.value = time.id
  editStart.value = time.start
  editEnd.value = time.end
  workingTimeStore.userId = props.userId  // ✅ 设置当前用户 ID
  showEditTimeModal.value = true
}

const saveEditTime = async () => {
  if (!editTimeId.value) return

  await workingTimeStore.updateWorkingTime(editTimeId.value, {
    start: editStart.value,
    end: editEnd.value
  })

  // 清空编辑状态并关闭弹窗
  editTimeId.value = null
  editStart.value = ''
  editEnd.value = ''
  showEditTimeModal.value = false
}


const deleteTime = async (id) => {
  await workingTimeStore.deleteWorkingTime(id)
}
</script>

<template>
  <div v-if="show" class="modal">
    <div class="modal-content">
      <h3>Working Times for User {{ props.userId }}</h3>

      <table class="user-table">
        <thead>
          <tr>
            <th>Start</th>
            <th>End</th>
            <th>Offset</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="time in workingTimeStore.workingTimes" :key="time.id">
            <td>{{ time.start }}</td>
            <td>{{ time.end }}</td>
            <td>{{ calculateDuration(time.start, time.end) }}</td>
            <td>
              <button class="edit-btn" @click="startEditTime(time)">Edit</button>
              <button class="delete-btn" @click="deleteTime(time.id)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- 新增表单 -->
      <div class="add-form">
        <input v-model="newStart" placeholder="Start" />
        <input v-model="newEnd" placeholder="End" />
        <button class="primary-btn" @click="addTime">Add</button>
      </div>

      <div class="actions">
        <button class="cancel-btn" @click="$emit('close')">Close</button>
      </div>

      <div v-if="showEditTimeModal" class="modal">
        <div class="modal-content">
            <h3>Edit Working Time (ID: {{ editTimeId }})</h3>
            <input v-model="editStart" placeholder="Start" />
            <input v-model="editEnd" placeholder="End" />
            <div class="actions">
            <button class="primary-btn" @click="saveEditTime">Save</button>
            <button class="cancel-btn" @click="showEditTimeModal = false">Cancel</button>
            </div>
        </div>
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
  min-width: 420px;
  max-width: 600px;
  box-shadow: 0 5px 20px rgba(0,0,0,0.2);
}

h3 {
  color: #444;
  margin-bottom: 15px;
}

.user-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 10px;
  font-size: 16px;
}

.user-table th, .user-table td {
  border: 1px solid #ddd;
  padding: 16px 20px;
  text-align: left;
  word-wrap: break-word;
}

.user-table th {
  background-color: #f7f7f7;
  font-weight: bold;
}

.user-table tr:hover {
  background-color: #fafafa;
}

button {
  padding: 8px 16px;
  margin: 4px;
  border-radius: 6px;
  border: none;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.3s;
}

.primary-btn {
  background-color: #d4edda;
  color: #155724;
}
.primary-btn:hover {
  background-color: #c3e6cb;
}

.edit-btn {
  background-color: #d1ecf1;
  color: #0c5460;
}
.edit-btn:hover {
  background-color: #bee5eb;
}

.delete-btn {
  background-color: #f8d7da;
  color: #721c24;
}
.delete-btn:hover {
  background-color: #f5c6cb;
}

.cancel-btn {
  background-color: #e2e3e5;
  color: #383d41;
}
.cancel-btn:hover {
  background-color: #d6d8db;
}

.add-form input {
  display: block;
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 14px;
}

.actions {
  text-align: right;
  margin-top: 10px;
}
</style>
