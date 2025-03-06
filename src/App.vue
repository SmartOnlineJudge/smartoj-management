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
        <a-dropdown placement="bottom" :align="{ offset: [0,  17] }">
          <div class="user-info">
            <a-avatar :src="MINIO_URL + userStore.user.avatar"></a-avatar>
            <span class="username">{{ userStore.user.name }}</span>
          </div>
          <template #overlay>
            <a-menu @click="item => {router.push(item.key)}">
              <a-menu-item key="/user-center">
                <span>
                  <IdcardOutlined />
                  <span>个人中心</span>
                </span>
              </a-menu-item>
              <a-menu-item @click="logout">
                <span>
                  <LogoutOutlined />
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
            @click="item => {router.push(item.key)}"
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
            <a-menu-item key="/user/user-info">用户信息管理</a-menu-item>
            <a-menu-item key="/user/user-cookie">用户登录管理</a-menu-item>
          </a-sub-menu>
          <a-sub-menu key="question">
            <template #title>
              <span>
                <CodeOutlined />
                <span>题目管理</span>
              </span>
            </template>
            <a-menu-item key="/question/question-info">题目信息管理</a-menu-item>
            <a-menu-item key="/question/daily-question">每日一题管理</a-menu-item>
            <a-menu-item key="/question/code-language">编程语言管理</a-menu-item>
            <a-menu-item key="/question/solved-history">刷题记录管理</a-menu-item>
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
          <a-menu-item key="/user-center">
            <span>
              <IdcardOutlined/>
              <span>账号管理</span>
            </span>
          </a-menu-item>
        </a-menu>
      </a-layout-sider>
      <a-layout-content style="padding: 20px 25px">
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
  LogoutOutlined,
  IdcardOutlined
} from "@ant-design/icons-vue";
import { message, Modal } from 'ant-design-vue';
import router from "@/router/index.js";
import Login from "@/pages/Login.vue";
import { userLogout, getCurrentAdmin } from "@/request.js";
import { useUserStore } from "@/stores.js";

let currentAdmin, timer
const openDropdown = ref(false)
const spinning = ref(true)
const isLogin = ref(null)
const checkFrequency = 2000  // 登录状态检查频率
const MINIO_URL = import.meta.env.VITE_MINIO_URL
const userStore = useUserStore();

const checkLoginStatus = async () => {
  try {
    const response = await getCurrentAdmin()
    // 用新的用户对象与旧的用户对象比较，如果某个属性不一致，则更新这个属性
    userStore.compareAndUpdate(response.data.data)
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
    userStore.setUser(currentAdmin)
    isLogin.value = true
    timer = setInterval(checkLoginStatus, checkFrequency)
  } catch {
    isLogin.value = false
  } finally {
    spinning.value = false
  }
})

const onLoginSuccess = async () => {
  message.success("登录成功，页面正在跳转……", 0.8)
  setTimeout(() => {
    currentAdmin = response.data.data
    userStore.setUser(currentAdmin)
    isLogin.value = true
    timer = setInterval(checkLoginStatus, checkFrequency)
  }, 1000)
  const response = await getCurrentAdmin()
}

const logout = async () => {
  Modal.confirm({
    title: '警告',
    content: '是否退出登录？',
    onOk() {
      clearInterval(timer)
      return userLogout().then(() => {
        isLogin.value = false
        router.push('/')
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
  border-bottom: 1px solid #dcdcdc;
  padding-inline: 20px;
}
.ant-dropdown-menu-item .anticon {
  margin-right: 8px;  /* 图标右侧留出 8px 空隙 */
}
.logo {
  display: flex;
  align-items: center;
}
.avatar {
  margin-left: auto;
  padding: 5px 10px;
  line-height: normal;
  border-radius: 10px;
}
.avatar:hover {
  background: rgba(0, 0, 0, 0.06);
}
.avatar .user-info {
  display: flex;
  align-items: center;
}
.avatar .user-info:hover {
  cursor: pointer;
}
.avatar .username {
  font-size: 17px;
  margin-left: 6px;
  color: #999
}
.login-box {
  margin: 140px auto 0 auto;
  width: 18%;
}
</style>