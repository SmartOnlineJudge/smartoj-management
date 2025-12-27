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
import Statistics from '@/components/dashboard/Statistics.vue';
import SubmissionDistribustion from '@/components/dashboard/SubmissionDistribustion.vue';
import Rankings from '@/components/dashboard/Rankings.vue';
import LanguageSubmisstion from '@/components/dashboard/LanguageSubmisstion.vue';
import QuestionCountOfTag from '@/components/dashboard/QuestionCountOfTag.vue';
import QuestionDistribution from '@/components/dashboard/QuestionDistribution.vue';

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
