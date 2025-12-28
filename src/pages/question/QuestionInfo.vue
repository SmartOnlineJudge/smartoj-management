<template>
  <div class="question-management">
    <div class="question-info-control">
      <div style="display: flex;margin-top: 10px;">
        <h2 style="margin-bottom: 10px;margin-top: 0;">题目相关信息管理</h2>
        <a-tooltip :open="openToolTip">
          <template #title>
            可向智能体提问{{ selectedRows.length > 1 ? "（只能选择一道题目）": "" }}
          </template>
          <a-button 
            style="margin-left: auto;display: flex;align-items: center;"
            @click="toggleChatbot"
          >
            <template #icon>
              <img src="/favicon.svg" alt="favicon" width="20" style="margin-right: 5px;">
            </template>
            智能题目管理
          </a-button>
        </a-tooltip>
      </div>
      <div>
        <a-tabs v-model:activeKey="activeKey">
          <a-tab-pane key="1" tab="题目信息管理">
            <QuestionManagement v-model:selectedRows="selectedRows"/>
          </a-tab-pane>
          <a-tab-pane key="2" tab="标签信息管理">
            <TagInfoManagement />
          </a-tab-pane>
          <a-tab-pane key="3" tab="编程语言管理">
            <LanguageManagement />
          </a-tab-pane>
        </a-tabs>
      </div>
    </div>
    <div class="chatbot" :hidden="!isChatbotVisible">
      <QuestionManageAgent 
        v-model:isChatbotVisible="isChatbotVisible"
        :selectedRows="selectedRows"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, defineAsyncComponent } from 'vue'

// 动态导入组件以实现代码分割
const QuestionManagement = defineAsyncComponent(() => import('@/components/question/QuestionManagement.vue'))
const TagInfoManagement = defineAsyncComponent(() => import('@/components/question/TagInfoManagement.vue'))
const LanguageManagement = defineAsyncComponent(() => import('@/components/question/LanguageManagement.vue'))
const QuestionManageAgent = defineAsyncComponent(() => import('@/components/question/QuestionManageAgent.vue'))

const activeKey = ref('1')
const isChatbotVisible = ref(false)
const selectedRows = ref([])
const openToolTip = computed(() => selectedRows.value.length > 0 && !isChatbotVisible.value)

const toggleChatbot = () => {
  isChatbotVisible.value = !isChatbotVisible.value
}
</script>

<style scoped>
.question-management {
  background-color: white;
  padding: 10px 15px;
  border-radius: 10px;
  display: flex;
  gap: 20px;
  max-height: 85vh;
}
.question-info-control {
  flex: 1;
  width: auto;
  overflow: auto;
  padding-right: 10px;
}
.chatbot {
  width: 43%;
  margin-left: auto;
  max-height: 85vh;
}
</style>
