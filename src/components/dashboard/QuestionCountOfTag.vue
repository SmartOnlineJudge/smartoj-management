<template>
  <div id="tag-cloud" class="tag-cloud-container">
    <h3>题目标签分布</h3>
    <div class="chart-container">
      <v-chart :option="chartOption" autoresize/>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import VChart from 'vue-echarts';
import 'echarts-wordcloud'; // 导入词云扩展

const tagData = ref([
  { name: '动态规划', value: 120 },
  { name: '深度优先搜索', value: 85 },
  { name: '广度优先搜索', value: 78 },
  { name: '数组', value: 150 },
  { name: '字符串', value: 110 },
  { name: '树', value: 95 },
  { name: '链表', value: 88 },
  { name: '哈希表', value: 102 },
  { name: '数学', value: 75 },
  { name: '双指针', value: 68 },
  { name: '回溯', value: 60 },
  { name: '贪心', value: 72 },
  { name: '二分查找', value: 80 },
  { name: '栈', value: 55 },
  { name: '堆', value: 48 },
  { name: '图论', value: 70 },
  { name: '排序', value: 90 },
  { name: '设计', value: 45 },
  { name: '数据库', value: 40 },
  { name: 'Shell', value: 30 }
]);

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
    data: tagData.value
  }]
});
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