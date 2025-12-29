<template>
  <div id="language-submission">
    <h3>编程语言提交分布</h3>
    <div class="chart-container">
      <v-chart :option="chartOption" autoresize />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import VChart from 'vue-echarts';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { PieChart } from 'echarts/charts';
import { 
  TitleComponent, 
  TooltipComponent, 
  LegendComponent 
} from 'echarts/components';

import { getDashboardSubmissionByLanguage, getLanguageList } from '@/request';

// 注册ECharts组件
use([
  CanvasRenderer,
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent
]);

const languageData = ref([]);

// 饼图配置
const chartOption = reactive({
  title: {
    left: 'center'
  },
  tooltip: {
    trigger: 'item',
    formatter: '{a} <br/>{b}: {c} ({d}%)'
  },
  series: [
    {
      name: '编程语言',
      type: 'pie',
      radius: ['40%', '70%'], // 环形饼图
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: {
        show: true,
        formatter: '{b}: {c}'
      },
      emphasis: {
        label: {
          show: true,
          fontSize: '16',
          fontWeight: 'bold'
        }
      },
      labelLine: {
        show: true
      },
      data: languageData
    }
  ]
});

onMounted(async () => {
  const [languageResponse, submissionResponse] = await Promise.all([getLanguageList(), getDashboardSubmissionByLanguage()]);
  const languageResponseData = languageResponse.data.data;
  const languageID2Name = {}
  languageResponseData.forEach(item => {
    languageID2Name[item.id] = item.name;
  });
  const submissionResponseData = submissionResponse.data.data.submission_distribution;
  const newData = submissionResponseData.map(item => {
    return {
      value: item.count,
      name: languageID2Name[item.language_id]
    }
  });
  languageData.value = newData;
});
</script>

<style scoped>
#language-submission {
  padding: 10px;
}
#language-submission h3 {
  margin: 0;
  padding-left: 10px;
  color: #333;
}
.chart-container {
  height: 300px;
  width: 100%;
}
</style>