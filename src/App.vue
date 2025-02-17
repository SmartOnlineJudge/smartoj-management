<template>
  <!-- 判断登录状态  -->
  <div v-if="isLogin === null">
    <a-spin :spinning="spinning" tip="正在检查登录状态……">
      <div style="width: 100vw;height: 100vh"></div>
    </a-spin>
  </div>
  <!-- 管理员已登录  -->
  <a-layout v-else-if="isLogin" style="min-height: 100vh">
    <a-layout-header>
      <div class="logo">
        <img src="/favicon.svg" alt="favicon.svg" width="41">
        <h2 style="padding-left: 8px">后台管理界面</h2>
      </div>
      <div class="avatar">
        <a-dropdown placement="bottom">
          <div class="user-info">
            <a-avatar :src="MINIO_URL + currentAdmin.avatar"></a-avatar>
            <span class="username">{{ currentAdmin.name }}</span>
          </div>
          <template #overlay>
            <a-menu>
              <a-menu-item>
                <span>
                  <ProfileOutlined />
                  <span>个人中心</span>
                </span>
              </a-menu-item>
              <a-menu-item @click="logout">
                <span>
                  <DeleteOutlined />
                  <span>退出登录</span>
                </span>
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </div>
    </a-layout-header>
    <a-layout>
      <a-layout-sider collapsible theme="light">
        <a-menu
            mode="inline"
            :style="{ height: '100%', borderRight: 0 }"
            @click="item => router.push(item.key)"
            :selectedKeys="[$route.path]"
        >
          <a-menu-item key="/">
            <span>
              <DashboardOutlined/>
              <span>系统概览</span>
            </span>
          </a-menu-item>
          <a-sub-menu key="user">
            <template #title>
              <span>
                <UserOutlined/>
                <span>用户管理</span>
              </span>
            </template>
            <a-menu-item key="/user-info">用户信息管理</a-menu-item>
            <a-menu-item key="/user-cookie">用户登录管理</a-menu-item>
          </a-sub-menu>
          <a-sub-menu key="question">
            <template #title>
              <span>
                <CodeOutlined />
                <span>题目管理</span>
              </span>
            </template>
            <a-menu-item key="/question-info">题目信息管理</a-menu-item>
            <a-menu-item key="/daily-question">每日一题管理</a-menu-item>
            <a-menu-item key="/code-language">编程语言管理</a-menu-item>
            <a-menu-item key="/solved-history">刷题记录管理</a-menu-item>
          </a-sub-menu>
          <a-sub-menu key="solving">
            <template #title>
              <span>
                <CarryOutOutlined />
                <span>题解管理</span>
              </span>
            </template>
            <a-menu-item key="9">option9</a-menu-item>
          </a-sub-menu>
          <a-sub-menu key="communication">
            <template #title>
              <span>
                <CommentOutlined />
                <span>讨论管理</span>
              </span>
            </template>
            <a-menu-item key="10">option9</a-menu-item>
          </a-sub-menu>
        </a-menu>
      </a-layout-sider>
      <a-layout-content>
        <RouterView/>
      </a-layout-content>
    </a-layout>
  </a-layout>
  <!-- 管理员未登录  -->
  <div v-else class="login-box">
    <Login @onLoginSuccess="onLoginSuccess"/>
  </div>
</template>

<script setup>
import { ref, onBeforeMount } from "vue"
import { RouterView } from 'vue-router'
import {
  DashboardOutlined,
  UserOutlined,
  CodeOutlined,
  CommentOutlined,
  CarryOutOutlined,
  DeleteOutlined,
  ProfileOutlined
} from "@ant-design/icons-vue";
import { message, Modal } from 'ant-design-vue';
import router from "@/router/index.js";
import Login from "@/pages/Login.vue";
import { userLogout, getCurrentAdmin } from "@/request.js";

let currentAdmin, timer
const spinning = ref(true)
const isLogin = ref(null)
const MINIO_URL = import.meta.env.VITE_MINIO_URL

const checkLoginStatus = async () => {
  try {
    await getCurrentAdmin()
  } catch {
    clearInterval(timer)  // 优先移除定时器，不然如果用户不点击确认，定时器将会一直存在
    Modal.warning({
      title: '警告',
      content: '当前登录状态已失效，请重新登录',
      onOk() {
        isLogin.value = false
      },
      okText: '确认',
    })
  }
}

onBeforeMount(async () => {
  try {
    const response = await getCurrentAdmin()
    currentAdmin = response.data.data
    isLogin.value = true
    timer = setInterval(checkLoginStatus, 1000 * 60)
  } catch {
    isLogin.value = false
  } finally {
    spinning.value = false
  }
})

const onLoginSuccess = () => {
  message.success("登录成功，页面正在跳转……", 0.8)
  setTimeout(async () => {
    const response = await getCurrentAdmin()
    currentAdmin = response.data.data
    isLogin.value = true
    timer = setInterval(checkLoginStatus, 1000 * 60)
  }, 1000)
}

const logout = async () => {
  Modal.confirm({
    title: '警告',
    content: '是否退出登录？',
    onOk() {
      clearInterval(timer)
      return userLogout().then(() => {
        isLogin.value = false
      })
    },
    okText: '确认',
    cancelText: '取消',
  })
}
</script>

<style scoped>
.ant-layout-header {
  padding-left: 14px;
  display: flex;
  align-items: center;
  background: #fff;
  border-bottom: 1px solid #dcdcdc
}
.logo {
  display: flex;
  align-items: center;
}
.avatar {
  margin-left: auto;
}
.avatar .user-info:hover {
  cursor: pointer;
}
.avatar .username {
  font-size: 18px;
  margin-left: 6px;
  color: #999
}
.login-box {
  margin: 140px auto 0 auto;
  width: 18%;
}
</style>