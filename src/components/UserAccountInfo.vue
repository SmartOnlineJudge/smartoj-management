<script setup>
import { useUserStore } from "@/stores.js";

const userStore = useUserStore();
const user = userStore.user;

const dataSource = [
  {
    title: '账号邮箱',
    description: '用于密码登录和验证码登录。',
    key: 'email',
    content: user['email'],
  },
  {
    title: '账号密码',
    description: '用于该账号的密码登录。',
    key: 'password',
    content: '当前平台不支持展示用户密码',
  },
  {
    title: 'GitHub Token',
    description: '通过 OAuth2 的方式从 GitHub 中获取的登录授权凭证，只能用于普通用户登录且不可修改。',
    key: 'githubToken',
    content: user['github_token'] || '暂未绑定'
  },
  {
    title: 'QQ Token',
    description: '通过 OAuth2 的方式从 QQ 中获取的登录授权凭证，只能用于普通用户登录且不可修改。',
    key: 'qqToken',
    content: user['qq_token'] || '暂未绑定'
  }
]

const updateInfo = key => {
  if (key === 'email') {
    console.log('修改邮箱')
  } else {
    console.log('修改密码')
  }
}
</script>

<template>
  <h2 style="margin-bottom: 0">用户账号信息</h2>
  <a-list item-layout="horizontal" :dataSource="dataSource">
    <template #renderItem="{ item }">
      <a-list-item>
        <template #actions>
          <a v-if="item.key === 'email' || item.key === 'password'"
             type="primary"
             @click="() => {updateInfo(item.key)}"
          >修改</a>
        </template>
        <a-list-item-meta :description="item.description">
          <template #title>
            {{ item.title }}
          </template>
        </a-list-item-meta>
        {{ item.content }}
      </a-list-item>
    </template>
  </a-list>
</template>

<style scoped>

</style>