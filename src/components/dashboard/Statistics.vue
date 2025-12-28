<template>
  <div id="statistics">
    <div v-for="item in data" :key="item.id" class="item">
      <div class="statistics-icon">
        <component :is="item.icon" />
      </div>
      <div class="statistics-info">
        <div class="statistics-title">{{ item.title }}</div>
        <div class="statistics-value">{{ item.value }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { TeamOutlined, WifiOutlined, UploadOutlined, CommentOutlined } from '@ant-design/icons-vue';

import { getDashboardUsers, getDashboardSubmissions, getDashboardConversationCount } from '@/request';

const data = ref([
  {
    id: 1,
    icon: TeamOutlined,
    title: '用户总数',
    value: 0
  },
  {
    id: 2,
    icon: WifiOutlined,
    title: '在线用户',
    value: 0
  },
  {
    id: 3,
    icon: UploadOutlined,
    title: '当日提交量',
    value: 0
  },
  {
    id: 4,
    icon: CommentOutlined,
    title: 'AI对话总数',
    value: 0
  }
])

onMounted(async () => {
  try {
    const [usersResponse, submissionsResponse, conversationsResponse] = await Promise.all([
      getDashboardUsers(),
      getDashboardSubmissions(),
      getDashboardConversationCount()
    ]);
    data.value[0].value = usersResponse.data.data.total_users;
    data.value[1].value = usersResponse.data.data.online_users;
    data.value[2].value = submissionsResponse.data.data.submissions;
    data.value[3].value = conversationsResponse.data.count;
  } catch (error) {
    console.error(error);
  }
})
</script>

<style scoped>
#statistics {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 100%;
}
.item {
  background-color: white;
  min-width: 23%;
  min-height: 120px;
  display: flex;
  border-radius: 10px;
  box-shadow: 1px 1px 5px rgba(0, 0, 0, 0.1);
}
.statistics-icon {
  font-size: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 37%;
  color: #3185fc;
}
.statistics-info {
  margin-left: auto;
  margin-right: 30px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  font-size: 20px;
}
.statistics-title {
  color: gray;
}
.statistics-value {
  color: #666666;
  font-weight: bold;
  margin-top: 10px;
}
</style>