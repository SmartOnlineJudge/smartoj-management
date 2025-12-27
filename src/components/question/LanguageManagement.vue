<template>
  <div class="language-management">    
    <div class="table-container">
      <a-table
        :columns="columns"
        :data-source="languageList"
        :loading="loading"
        :pagination="false"
        row-key="id"
        :scroll="{ x: 500 }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'status'">
            <a-tag :color="record.is_deleted ? 'red' : 'green'">
              {{ record.is_deleted ? '已删除' : '启用' }}
            </a-tag>
          </template>
        </template>
      </a-table>
    </div>
  </div>
</template>

<script setup>
import { getLanguageList } from '@/request';
import { ref, onMounted } from 'vue';

// 定义响应式数据
const languageList = ref([]);
const loading = ref(false);

// 表格列定义
const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
    sorter: (a, b) => a.id - b.id,
    width: 100,
  },
  {
    title: '语言名称',
    dataIndex: 'name',
    key: 'name',
    width: 200,
  },
  {
    title: '版本',
    dataIndex: 'version',
    key: 'version',
    width: 200,
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 150,
  },
];

// 获取语言列表
const fetchLanguageList = async () => {
  loading.value = true;
  try {
    const response = await getLanguageList();
    if (response.data.code === 200) {
      languageList.value = response.data.data || [];
    } else {
      console.error('获取编程语言列表失败:', response.data.message);
    }
  } catch (error) {
    console.error('获取编程语言列表失败:', error);
  } finally {
    loading.value = false;
  }
};

// 组件挂载时获取数据
onMounted(() => {
  fetchLanguageList();
});
</script>

<style scoped>
.language-management {
  padding: 1px;
}
</style>