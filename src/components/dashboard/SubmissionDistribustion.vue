<template>
  <div id="submission-distribution">
    <v-chart 
      :option="chartOption" 
      style="width: 100%; height: 400px;" 
      :autoresize="true"
    />
  </div>
</template>

<script setup>
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { BarChart } from "echarts/charts";
import {
  GridComponent,
  TooltipComponent,
  TitleComponent,
  DataZoomComponent,
} from "echarts/components";
import VChart from "vue-echarts";

use([CanvasRenderer, BarChart, GridComponent, TooltipComponent, TitleComponent, DataZoomComponent]);

// 生成24小时的模拟数据
const hoursData = Array.from({ length: 24 }, (_, i) => i + 1);
const submissionData = Array.from({ length: 24 }, () => Math.floor(Math.random() * 100));

const chartOption = {
  title: {
    text: "24小时提交总分布",
    left: "center",
  },
  tooltip: {
    trigger: "axis",
    axisPointer: {
      type: "shadow",
    },
  },
  grid: {
    left: "3%",
    right: "4%",
    bottom: "3%",
    top: "15%",
    containLabel: true,
  },
  xAxis: [
    {
      type: "category",
      data: hoursData,
      axisTick: {
        alignWithLabel: true,
      },
    },
  ],
  yAxis: [
    {
      type: "value",
    },
  ],
  series: [
    {
      name: "提交数量",
      type: "bar",
      barWidth: "60%",
      data: submissionData,
      itemStyle: {
        color: '#3185fc',
        borderRadius: {
          topLeft: 4,
          topRight: 4
        }
      }
    },
  ],
};
</script>

<style scoped>
#submission-distribution {
  min-height: 200px;
  background-color: white;
  margin-top: 20px;
  border-radius: 10px;
  box-shadow: 1px 1px 5px rgba(0, 0, 0, 0.1);
  padding: 10px 0;
}
</style>
