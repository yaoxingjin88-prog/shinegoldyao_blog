import { defineStore } from 'pinia'
import { ref } from 'vue'
import { authApi } from '../api'

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref(localStorage.getItem('accessToken') || '')
  const refreshToken = ref(localStorage.getItem('refreshToken') || '')
  const isLoggedIn = ref(!!accessToken.value)

  async function login(username: string, password: string) {
    const data = await authApi.login({ username, password })
    accessToken.value = data.accessToken
    refreshToken.value = data.refreshToken
    isLoggedIn.value = true
    localStorage.setItem('accessToken', data.accessToken)
    localStorage.setItem('refreshToken', data.refreshToken)
  }

  function logout() {
    accessToken.value = ''
    refreshToken.value = ''
    isLoggedIn.value = false
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  }

  return { accessToken, refreshToken, isLoggedIn, login, logout }
}, { persist: false })
