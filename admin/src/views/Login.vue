<template>
  <div class="login-page">
    <div class="login-box">
      <!-- 左侧深色介绍区 -->
      <div class="login-left">
        <div class="left-content">
          <div class="brand">
            <div class="brand-icon">
              <span>S</span>
            </div>
            <span class="brand-name">ShineGoldYao</span>
          </div>
          <h1 class="left-title">ShineGoldYao<br/>博客管理系统</h1>
          <p class="left-desc">打造一款现代化博客后台管理平台</p>
          <ul class="left-features">
            <li>文章内容管理</li>
            <li>项目作品展示</li>
            <li>精美界面设计</li>
          </ul>
        </div>
        <!-- 装饰圆 -->
        <div class="deco-circle deco-1"></div>
        <div class="deco-circle deco-2"></div>
        <div class="deco-circle deco-3"></div>
      </div>

      <!-- 右侧登录表单 -->
      <div class="login-right">
        <div class="right-content">
          <h2 class="form-title">欢迎回来</h2>
          <p class="form-desc">请输入您的账号信息登录系统</p>

          <el-form ref="formRef" :model="form" :rules="rules" label-position="top" @submit.prevent="handleLogin" class="login-form">
            <el-form-item label="用户名" prop="username">
              <el-input v-model="form.username" prefix-icon="User" placeholder="请输入用户名" size="large" />
            </el-form-item>
            <el-form-item label="密码" prop="password">
              <el-input v-model="form.password" prefix-icon="Lock" type="password" placeholder="请输入密码" size="large" show-password />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" size="large" class="login-btn" :loading="loading" native-type="submit">登 录</el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance } from 'element-plus'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const auth = useAuthStore()
const formRef = ref<FormInstance>()
const loading = ref(false)
const form = reactive({ username: '', password: '' })
const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }, { min: 6, message: '密码最少6位', trigger: 'blur' }],
}

async function handleLogin() {
  await formRef.value?.validate()
  loading.value = true
  try {
    await auth.login(form.username, form.password)
    ElMessage.success('登录成功')
    router.push('/dashboard')
  } catch { /* error handled in interceptor */ } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: linear-gradient(135deg, #1e1e2f 0%, #2d2b55 50%, #1e1e2f 100%);
}

.login-box {
  display: flex;
  width: 1060px;
  min-height: 740px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.12);
}

/* 左侧 */
.login-left {
  width: 440px;
  background: #1e1e2f;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: flex-end;
  padding: 40px;
  flex-shrink: 0;
}
.left-content {
  position: relative;
  z-index: 2;
}
.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 32px;
}
.brand-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 800;
  color: #1e1e2f;
}
.brand-name {
  font-size: 16px;
  font-weight: 600;
  color: #fff;
}
.left-title {
  font-size: 26px;
  font-weight: 700;
  color: #818cf8;
  line-height: 1.3;
  margin: 0 0 12px;
}
.left-desc {
  font-size: 14px;
  color: #9ca3af;
  margin: 0 0 24px;
}
.left-features {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.left-features li {
  font-size: 13px;
  color: #d1d5db;
  display: flex;
  align-items: center;
  gap: 8px;
}
.left-features li::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #818cf8;
  flex-shrink: 0;
}

/* 装饰圆 */
.deco-circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.04);
}
.deco-1 {
  width: 200px;
  height: 200px;
  top: -40px;
  right: -60px;
}
.deco-2 {
  width: 150px;
  height: 150px;
  top: 60px;
  left: -30px;
}
.deco-3 {
  width: 100px;
  height: 100px;
  bottom: 100px;
  right: 40px;
}

/* 右侧 */
.login-right {
  flex: 1;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 52px;
}
.right-content {
  width: 100%;
  max-width: 380px;
}
.form-title {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 8px;
}
.form-desc {
  font-size: 14px;
  color: #9ca3af;
  margin: 0 0 32px;
}

.login-form :deep(.el-form-item__label) {
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  padding-bottom: 4px;
}
.login-form :deep(.el-input__wrapper) {
  border-radius: 8px;
  box-shadow: 0 0 0 1px #e5e7eb;
  transition: box-shadow 0.2s;
}
.login-form :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #c7d2fe;
}
.login-form :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 2px #6366f1;
}
.login-btn {
  width: 100%;
  border-radius: 8px;
  background: linear-gradient(135deg, #4f46e5, #6366f1);
  border: none;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 4px;
  margin-top: 8px;
}
.login-btn:hover {
  background: linear-gradient(135deg, #4338ca, #4f46e5);
}

@media (max-width: 860px) {
  .login-box {
    flex-direction: column;
    width: 90%;
    max-width: 440px;
  }
  .login-left {
    width: 100%;
    min-height: 200px;
    padding: 28px;
  }
  .left-title {
    font-size: 20px;
  }
}
</style>
