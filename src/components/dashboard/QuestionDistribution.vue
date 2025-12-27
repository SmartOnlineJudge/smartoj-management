<template>
  <div id="question-distribution">
    <h3>不同难度的题目分布</h3>
    <div class="chart-container">
      <v-chart :option="chartOption" autoresize />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import VChart from 'vue-echarts';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { PieChart } from 'echarts/charts';
import { 
  TitleComponent, 
  TooltipComponent, 
  LegendComponent 
} from 'echarts/components';

// 注册ECharts组件
use([
  CanvasRenderer,
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent
]);

// 题目数据
const data = ref([
  { name: "简单", value: 10 },
  { name: "中等", value: 20 },
  { name: "困难", value: 30 }
]);

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
      data: data.value
    }
  ]
});
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