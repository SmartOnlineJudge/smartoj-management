<template>
  <a-tabs v-model:activeKey="activeKey">
    <a-tab-pane key="1" tab="题目信息管理">
      <QuestionManagement />
    </a-tab-pane>
    <a-tab-pane key="2" tab="标签信息管理">
      <TagInfoManagement />
    </a-tab-pane>
    <a-tab-pane key="3" tab="编程语言管理">
      <LanguageManagement />
    </a-tab-pane>
  </a-tabs>
</template>

<script setup>
import { ref } from 'vue'
import QuestionManagement from '@/components/question/QuestionManagement.vue'
import TagInfoManagement from '@/components/question/TagInfoManagement.vue'
import LanguageManagement from '@/components/question/LanguageManagement.vue'

const activeKey = ref('1')
</script>

<style scoped>
</style>
