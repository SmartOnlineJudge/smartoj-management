<template>
  <div id="tag-cloud" class="tag-cloud-container">
    <h3>题目标签分布</h3>
    <div class="chart-container">
      <v-chart :option="chartOption" autoresize/>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import VChart from 'vue-echarts';
import 'echarts-wordcloud'; // 导入词云扩展

import { allTags } from '@/request';

const tagData = ref([]);
// 生成词云图配置
const chartOption = reactive({
  tooltip: {
    show: true,
    formatter: function(params) {
      return `${params.name}: ${params.value} 题`;
    }
  },
  series: [{
    type: 'wordCloud',
    gridSize: 2,
    sizeRange: [12, 50],
    rotationRange: [-45, 45],
    shape: 'pentagon',
    width: '100%',
    height: '100%',
    left: 'center',
    top: 'center',
    right: null,
    bottom: null,
    drawOutOfBound: false,
    layoutAnimation: true,
    textStyle: {
      fontFamily: 'sans-serif',
      fontWeight: 'bold',
      color: function() {
        // 随机颜色
        const colors = ['#3185fc', '#ff6b6b', '#4ec98e', '#f9c94f', '#6f5ef9'];
        return colors[Math.floor(Math.random() * colors.length)];
      },
      emphasis: {
        shadowBlur: 10,
        shadowColor: '#333'
      }
    },
    data: tagData
  }]
});

onMounted(async () => {
  const response = await allTags(true);
  const responseData = response.data.data;
  tagData.value = responseData.map(item => ({
    name: item.name,
    value: item.question_count
  }));
})
</script>

<style scoped>
.tag-cloud-container {
  padding: 10px;
}
.tag-cloud-container h3 {
  margin: 0 0 10px 0;
  padding-left: 10px;
  color: #333;
}
.chart-container {
  height: 300px;
  width: 100%;
}
</style>