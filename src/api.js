import axios from 'axios'

// 修改成你后端 API 的地址
const api = axios.create({
  baseURL: 'http://localhost:4000/api', // 例如 Phoenix API
  headers: {
    'Content-Type': 'application/json'
  }
})

export default api

