<template>
  <a-table
      :columns="columns"
      :dataSource="data"
      :loading="{spinning:spinning,tip:'页面加载中...'}"
      :pagination="pagination"
      :scroll="{ x: 'max-content' }"
      @change="pageChange"
  >
    <template #bodyCell="{ column, record }">
      <template v-if="column.key === 'operation'">
        <a-button type="primary" danger @click="()=>{ForcedExit(record.session_id)}">强退</a-button>
      </template>
    </template>
  </a-table>
</template>

<script setup>
import {onBeforeMount, reactive, ref} from "vue";
import {getUserStatus, userForcedExit} from "@/request.js";
import {message, Modal} from "ant-design-vue";

const spinning = ref(true)
const defaultPageSize = 5
const total = ref()
const data = ref([])
const pagination = reactive({
  total: total,
  pageSize: defaultPageSize,
})

const columns = [
  {
    title: '会话ID',
    dataIndex: 'session_id',
    align: 'center',
  },
  {
    title: '用户ID',
    dataIndex: 'user_id',
    align: 'center'
  },
  {
    title: '名字',
    dataIndex: 'name',
    align: 'center'
  },
  {
    title: 'IP地址',
    dataIndex: 'host',
    align: 'center'
  },
  {
    title: '登录平台',
    dataIndex: 'platform',
    align: 'center'
  },
  {
    title: '浏览器',
    dataIndex: 'browser',
    align: 'center'
  },
  {
    title: '首次登录时间',
    dataIndex: 'first_login',
    customRender: ({text}) => formatTime(text),
    align: 'center'
  },
  {
    title: '最近活跃时间',
    dataIndex: 'last_active',
    customRender: ({text}) => formatTime(text),
    align: 'center'
  },
  {
    title: '操作',
    key: 'operation',
    align: 'center'
  },
];

const formatTime = (timestamp) => {
  const date = new Date(timestamp * 1000);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

const ForcedExit = v => {
  console.log(v)
  Modal.confirm({
    title: '警告',
    content: '是否要强制该用户下线？',
    onOk() {
      return userForcedExit(v).then(response => {
        if (response.data.code === 200) {
          message.success("强制下线成功")
          data.value = data.value.filter(record => record.session_id !== v);
        } else {
          message.error("强制下线失败")
        }
      }).catch(() => {
        message.error("强制下线失败")
      })
    },
    okText: '确认',
    cancelText: '取消',
  })
}

const pageChangeHandler = async (page, pageSize) => {
  spinning.value = true
  const response = await getUserStatus(page, pageSize)
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