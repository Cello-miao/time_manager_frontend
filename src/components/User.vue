<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '../stores/user'
import WorkingTime from './WorkingTime.vue'
import ClockManager from './ClockManager.vue'
import ChartManager from './ChartManager.vue'

const showClockModal = ref(false)
const openClockManager = (userId) => {
  selectedUserId.value = userId
  showClockModal.value = true
}
const selectedUserId = ref(null)
const userStore = useUserStore()

// 弹窗控制
const showAddModal = ref(false)
const showEditModal = ref(false)

// 新增用户
const newUsername = ref('')
const newEmail = ref('')

// 编辑用户
const editId = ref(null)
const editUsername = ref('')
const editEmail = ref('')

onMounted(() => {
  userStore.fetchUsers()
})

const addUser = async () => {
  await userStore.createUser({
    username: newUsername.value,
    email: newEmail.value
  })
  newUsername.value = ''
  newEmail.value = ''
  showAddModal.value = false // 关闭弹窗
}

const startEdit = (user) => {
  editId.value = user.id
  editUsername.value = user.username
  editEmail.value = user.email
  showEditModal.value = true
}

const saveEdit = async () => {
  await userStore.updateUser(editId.value, {
    username: editUsername.value,
    email: editEmail.value
  })
  editId.value = null
  editUsername.value = ''
  editEmail.value = ''
  showEditModal.value = false // 关闭弹窗
}

const removeUser = async (id) => {
  await userStore.deleteUser(id)
}

const showWorkingTimesModal = ref(false)

const openWorkingTimes = (userId) => {
  selectedUserId.value = userId
  showWorkingTimesModal.value = true
}
const showChart = ref(false)
const currentUserId = ref(null)

function openCharts(userId) {
  currentUserId.value = userId
  showChart.value = true
}

function closeCharts() {
  showChart.value = false
  currentUserId.value = null
}

</script>

<template>
  <div class="container">
    <!-- <h2>User Management</h2> -->

    <!-- 新增按钮 -->
    <button class="primary-btn" @click="showAddModal = true">+ Add User</button>

    <!-- 用户表格 -->
    <table class="user-table">
      <thead>
        <tr>
          <th>Username</th><th>Email</th><th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in userStore.users" :key="user.id">
          <td>{{ user.username }}</td>
          <td>{{ user.email }}</td>
          <td>
            <button class="edit-btn" @click="startEdit(user)">Edit</button>
            <button class="delete-btn" @click="removeUser(user.id)">Delete</button>
            <button @click="openWorkingTimes(user.id)">View Working Times</button>
            <button @click="openClockManager(user.id)">Clock Manager</button>
             <button @click="openCharts(user.id)">View Charts</button>
          </td>
        </tr>
      </tbody>
      <WorkingTime 
        :userId="selectedUserId" 
        :show="showWorkingTimesModal" 
        @close="showWorkingTimesModal = false"
      />
      <!-- 在 <table> 下添加 ClockManager -->
      <ClockManager
        :userId="selectedUserId"
        :show="showClockModal"
        @close="showClockModal = false"
      />


      <ChartManager
        :userId="currentUserId"
        :show="showChart"
        v-show="showChart && currentUserId !== null"
        @close="showChart = false"
      />






    </table>

    <!-- 新增弹窗 -->
    <div v-if="showAddModal" class="modal">
      <div class="modal-content">
        <h3>Create User</h3>
        <input v-model="newUsername" placeholder="Username" />
        <input v-model="newEmail" placeholder="Email" />
        <div class="actions">
          <button class="primary-btn" @click="addUser">Save</button>
          <button class="cancel-btn" @click="showAddModal = false">Cancel</button>
        </div>
      </div>
    </div>

    <!-- 编辑弹窗 -->
    <div v-if="showEditModal" class="modal">
      <div class="modal-content">
        <h3>Edit User (ID: {{ editId }})</h3>
        <input v-model="editUsername" placeholder="Username" />
        <input v-model="editEmail" placeholder="Email" />
        <div class="actions">
          <button class="primary-btn" @click="saveEdit">Save</button>
          <button class="cancel-btn" @click="showEditModal = false">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 1200px; /* 表格更宽 */
  margin: 40px auto;
  font-family: Arial, sans-serif;
  color: #333;
}

h2, h3 {
  color: #444;
  margin-bottom: 15px;
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

/* 按钮柔和颜色 */
.primary-btn {
  background-color: #d4edda; /* 浅绿色 */
  color: #155724;
}
.primary-btn:hover {
  background-color: #c3e6cb;
}

.edit-btn {
  background-color: #d1ecf1; /* 浅蓝色 */
  color: #0c5460;
}
.edit-btn:hover {
  background-color: #bee5eb;
}

.delete-btn {
  background-color: #f8d7da; /* 浅红色 */
  color: #721c24;
}
.delete-btn:hover {
  background-color: #f5c6cb;
}

.cancel-btn {
  background-color: #e2e3e5; /* 浅灰色 */
  color: #383d41;
}
.cancel-btn:hover {
  background-color: #d6d8db;
}

.user-table {
  width: 100%; /* 横向扩展到容器宽度 */
  border-collapse: collapse;
  margin-top: 20px;
  font-size: 16px;
  /* table-layout: fixed; 列均分 */
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

.modal {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background: white;
  padding: 24px;
  border-radius: 12px;
  min-width: 420px;
  max-width: 600px;
  box-shadow: 0 5px 20px rgba(0,0,0,0.2);
}

.modal-content input {
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
