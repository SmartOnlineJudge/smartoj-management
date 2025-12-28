<template>
  <div id="dashboard">
    <div class="statistics"><Statistics /></div>
    <div><SubmissionDistribustion /></div>
    <div class="others">
      <QuestionCountOfTag class="others-item"/>
      <QuestionDistribution class="others-item"/>
      <LanguageSubmisstion class="others-item"/>
    </div>
    <div class="rankings"><Rankings /></div>
  </div>
</template>

<script setup> 
import { defineAsyncComponent } from "vue"

// 动态导入组件以实现代码分割
const Statistics = defineAsyncComponent(() => import('@/components/dashboard/Statistics.vue'));
const SubmissionDistribustion = defineAsyncComponent(() => import('@/components/dashboard/SubmissionDistribustion.vue'));
const Rankings = defineAsyncComponent(() => import('@/components/dashboard/Rankings.vue'));
const LanguageSubmisstion = defineAsyncComponent(() => import('@/components/dashboard/LanguageSubmisstion.vue'));
const QuestionCountOfTag = defineAsyncComponent(() => import('@/components/dashboard/QuestionCountOfTag.vue'));
const QuestionDistribution = defineAsyncComponent(() => import('@/components/dashboard/QuestionDistribution.vue'));
</script>

<style scoped>
.others {
  display: flex;
  justify-content: space-between;
  min-height: 200px;
  margin-top: 20px;
}
.others-item {
  width: 32%;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}
</style>
