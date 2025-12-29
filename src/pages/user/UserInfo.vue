<template>
  <div class="user-info-list">
    <h2>用户信息列表</h2>
    <a-table
        :columns="columns"
        :dataSource="data"
        :loading="{spinning:spinning,tip:'页面加载中...'}"
        :pagination="pagination"
        @change="pageChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'details'">
          <a-button type="primary" @click="() => {open = true;current = record}">more</a-button>
          <a-modal v-model:open="open" :style="{ top: '40px',width:'900px' }"
                  :maskStyle="{backgroundColor: 'rgba(30, 30, 30, 0.2)'}">
            <template #footer>
              <a-button type="primary" @click="handleOk">OK</a-button>
            </template>
            <a-descriptions
                title="用户详情"
                bordered
            >
              <a-descriptions-item label="头像" >
                <a-avatar :size="55" :src="MINIO_URL + current.avatar"/>
              </a-descriptions-item>
              <a-descriptions-item label="ID">
                {{ current.id }}
              </a-descriptions-item>
              <a-descriptions-item label="名字">
                {{ current.name }}
              </a-descriptions-item>
              <a-descriptions-item label="GitHub Token" :span="1.5">
                {{ current.github_token }}
              </a-descriptions-item>
              <a-descriptions-item label="QQ Token" :span="1.5">
                {{ current.qq_token }}
              </a-descriptions-item>
              <a-descriptions-item label="是否是超级管理员" :span="3">
                {{ current.is_superuser }}
              </a-descriptions-item>
              <a-descriptions-item label="邮箱">
                {{ current.email }}
              </a-descriptions-item>
              <a-descriptions-item label="等级">
                {{ current.grade }}
              </a-descriptions-item>
              <a-descriptions-item label="经验值">
                {{ current.experience }}
              </a-descriptions-item>
              <a-descriptions-item label="用户简介">
                {{ current.profile }}
              </a-descriptions-item>
            </a-descriptions>
          </a-modal>
        </template>
        <template v-else-if="column.key === 'avatar'">
          <a-avatar :size="50" :src="MINIO_URL + record.avatar"/>
        </template>
        <template v-else-if="column.key === 'is_deleted'">
          <a-switch
              :checked="record.is_deleted"
              :loading="record.loading"
              checked-children="是"
              un-checked-children="否"
              @click="()=> {lapse(record)}"
          />
        </template>
      </template>
    </a-table>
  </div>
</template>

<script setup>
import {ref, onBeforeMount, reactive} from 'vue';
import {getUserList, userLapse} from "@/request.js";
import {message, Modal} from "ant-design-vue";

const MINIO_URL = import.meta.env.VITE_MINIO_URL
const defaultPageSize = 10
const current = ref({})
const open = ref(false);
const spinning = ref(true)
const total = ref()
const data = ref([])
const pagination = reactive({
  total: total,
  pageSize: defaultPageSize,
})
const columns = [
  {
    title: '序号',
    dataIndex: 'id',
    align: 'center'
  },
  {
    title: '用户ID',
    dataIndex: 'user_id',
    align: 'center'
  },
  {
    title: '头像',
    dataIndex: 'avatar',
    key: 'avatar',
    align: 'center'
  },
  {
    title: '名字',
    dataIndex: 'name',
    align: 'center'
  },
  {
    title: '创建时间',
    dataIndex: 'created_at',
    align: 'center'
  },
  {
    title: '账号是否被禁用',
    dataIndex: 'is_deleted',
    key: 'is_deleted',
    align: 'center'
  },
  {
    title: '是否为超级管理员',
    dataIndex: 'is_superuser',
    align: 'center'
  },
  {
    title: '详情',
    key: 'details',
    align: 'center'
  },
];

const lapse = record => {
  record.loading = true;
  const targetStatus = record.is_deleted;
  Modal.confirm({
    title: targetStatus ? '启用用户' : '禁用用户',
    content: `确定要${targetStatus ? '启用' : '禁用'}该用户吗？`,
    onOk() {
      record.is_deleted = !record.is_deleted;
      return userLapse(record.user_id, record.is_deleted).then(response => {
        if (response.data.code === 200) {
          record.loading = false;
          message.success(`已${targetStatus ? '启用' : '禁用'}`)
        } else {
          message.error("操作失败")
        }
      }).catch(() => {
        message.error("请求失败")
      }).finally(() => {
        record.loading = false;
      })
    },
    onCancel(){
      record.loading = false;
    },
    okText: '确认',
    cancelText: '取消',
  })
}

const handleOk = () => {
  open.value = false;
};

const pageChangeHandler = async (page, pageSize) => {
  spinning.value = true
  const response = await getUserList(page, pageSize)
  data.value = response.data.data.results
  total.value = response.data.data.total
  spinning.value = false
}
const pageChange = pagination => {
  pageChangeHandler(pagination.current, pagination.pageSize)
}

onBeforeMount(() => {
  pageChangeHandler(1, defaultPageSize)
})
</script>

<style scoped>
.user-info-list {
  background-color: white;
  padding: 10px 20px;
  border-radius: 10px;
}
</style>
