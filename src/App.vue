<template>
  <a-layout style="min-height: 100vh">
    <a-layout-header>
      <div class="logo">
        <img src="/favicon.svg" alt="favicon.svg" width="41">
        <h2 style="padding-left: 8px">后台管理界面</h2>
      </div>
      <div class="avatar">
        <a-dropdown placement="bottom">
          <div class="user-info">
            <a-avatar src="/favicon.svg"></a-avatar>
            <span class="username">admin</span>
          </div>
          <template #overlay>
            <a-menu>
              <a-menu-item>退出登录</a-menu-item>
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
            @click="onClickMenuItem"
            :selectedKeys="selectedKeys"
        >
          <a-menu-item key="/dashboard">
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
</template>

<script setup>
import { ref } from 'vue';
import { RouterView } from 'vue-router'
import {
  DashboardOutlined,
  UserOutlined,
  CodeOutlined,
  CommentOutlined,
  CarryOutOutlined
} from "@ant-design/icons-vue";
import router from "@/router/index.js";

const selectedKeys = ref(['/dashboard'])
const onClickMenuItem = item => {
  selectedKeys.value = [item.key]
  router.push(item.key)
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
</style>