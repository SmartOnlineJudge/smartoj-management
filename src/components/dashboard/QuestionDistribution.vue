<template>
  <div id="question-distribution">
    <h3>不同难度的题目分布</h3>
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

import { getQuestionCountBydifficulty } from '@/request';

// 注册ECharts组件
use([
  CanvasRenderer,
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent
]);

// 题目数据
const data = ref([]);

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
      name: '题目数量',
      type: 'pie',
      radius: '70%',
      center: ['50%', '50%'],
      itemStyle: {
        borderRadius: 8,
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
      data: data
    }
  ]
});

onMounted (async () => {
  const response = await getQuestionCountBydifficulty();
  const responseData = response.data.data;
  const newData = [
    { name: "简单", value: responseData.easy, itemStyle: { color:'#52c41a' } },
    { name: "中等", value: responseData.medium, itemStyle: { color:'#faad14' } },
    { name: "困难", value: responseData.hard, itemStyle: { color:'#ff4d4f' } }
  ];
   data.value = newData;
})
</script>

<style scoped>
#question-distribution {
  padding: 10px;
}
#question-distribution h3 {
  margin: 0;
  padding-left: 10px;
  color: #333;
}
.chart-container {
  height: 300px;
  width: 100%;
}
</style>