<script setup>
import { allTags, createTag, updateTag, deleteTag } from '@/request';
import { ref, onBeforeMount } from 'vue';
import { 
  Table, 
  Button, 
  Input, 
  Modal, 
  Form, 
  InputNumber, 
  message, 
  Popconfirm 
} from 'ant-design-vue';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons-vue';

// 标签数据
const data = ref([]);
const allData = ref([]); // 存储所有数据用于分页
const loading = ref(false);
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: false,
  showQuickJumper: true
});

// 模态框相关状态
const modalVisible = ref(false);
const modalTitle = ref('');
const confirmLoading = ref(false);
const isEdit = ref(false);

// 表单数据
const formRef = ref();
const formData = ref({
  id: null,
  name: '',
  score: 30
});

// 列定义
const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
    align: 'center',
    sorter: (a, b) => a.id - b.id
  },
  {
    title: '标签名称',
    dataIndex: 'name',
    align: 'center',
  },
  {
    title: '分数',
    dataIndex: 'score',
    align: 'center',
  },
  {
    title: '创建时间',
    dataIndex: 'created_at',
    align: 'center',
  },
  {
    title: '状态',
    dataIndex: 'is_deleted',
    align: 'center',
    slots: { customRender: 'is_deleted' }
  },
  {
    title: '操作',
    key: 'action',
    align: 'center',
    width: 180,
    fixed: 'right',
  }
];

// 获取标签列表
const fetchTags = async () => {
  loading.value = true;
  try {
    const response = await allTags();
    if (response.data.code === 200) {
      allData.value = response.data.data.map(tag => ({
        ...tag,
        key: tag.id
      }));
      pagination.value.total = allData.value.length;
      // 初始显示第一页数据
      updateTableData();
    } else {
      message.error(response.data.message || '获取标签列表失败');
    }
  } catch (error) {
    message.error('获取标签列表失败');
    console.error(error);
  } finally {
    loading.value = false;
  }
};

// 更新表格显示的数据（用于客户端分页）
const updateTableData = () => {
  const start = (pagination.value.current - 1) * pagination.value.pageSize;
  const end = start + pagination.value.pageSize;
  data.value = allData.value.slice(start, end);
};

// 分页改变处理
const handleTableChange = (pag) => {
  pagination.value.current = pag.current;
  updateTableData();
};

// 打开新增标签模态框
const openAddModal = () => {
  modalTitle.value = '新增标签';
  isEdit.value = false;
  formData.value = {
    id: null,
    name: '',
    score: 30
  };
  modalVisible.value = true;
};

// 打开编辑标签模态框
const openEditModal = (record) => {
  modalTitle.value = '编辑标签';
  isEdit.value = true;
  formData.value = {
    id: record.id,
    name: record.name,
    score: record.score
  };
  modalVisible.value = true;
};

// 删除标签
const handleDelete = async (id) => {
  try {
    const response = await deleteTag(id, true);
    if (response.data.code === 200) {
      message.success('删除标签成功');
      fetchTags(); // 重新获取数据
    } else {
      message.error(response.data.message || '删除标签失败');
    }
  } catch (error) {
    message.error('删除标签失败');
    console.error(error);
  }
};

// 恢复标签
const handleRestore = async (id) => {
  try {
    const response = await deleteTag(id, false);
    if (response.data.code === 200) {
      message.success('恢复标签成功');
      fetchTags(); // 重新获取数据
    } else {
      message.error(response.data.message || '恢复标签失败');
    }
  } catch (error) {
    message.error('恢复标签失败');
    console.error(error);
  }
};

// 提交表单
const handleSubmit = async () => {
  try {
    confirmLoading.value = true;
    
    if (isEdit.value) {
      // 编辑标签
      const response = await updateTag(
        formData.value.id,
        formData.value.name,
        formData.value.score
      );
      
      if (response.data.code === 200) {
        message.success('更新标签成功');
        modalVisible.value = false;
        fetchTags(); // 重新获取数据
      } else {
        message.error(response.data.message || '更新标签失败');
      }
    } else {
      // 新增标签
      const response = await createTag(
        formData.value.name,
        formData.value.score
      );
      
      if (response.data.code === 200) {
        message.success('新增标签成功');
        modalVisible.value = false;
        fetchTags(); // 重新获取数据
      } else {
        message.error(response.data.message || '新增标签失败');
      }
    }
  } catch (error) {
    message.error(isEdit.value ? '更新标签失败' : '新增标签失败');
    console.error(error);
  } finally {
    confirmLoading.value = false;
  }
};

// 取消表单
const handleCancel = () => {
  modalVisible.value = false;
};

// 初始化数据
onBeforeMount(() => {
  fetchTags();
});
</script>

<template>
  <div class="tag-management">
    <div class="header">
      <Button type="primary" @click="openAddModal">
        <template #icon>
          <PlusOutlined />
        </template>
        新增标签
      </Button>
    </div>

    <Table
      :columns="columns"
      :data-source="data"
      :loading="loading"
      :pagination="pagination"
      @change="handleTableChange"
      :scroll="{ x: 800 }"
    >
      <template #is_deleted="{ text }">
        {{ text ? '已删除' : '正常' }}
      </template>
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'action'">
          <div class="action-buttons">
            <Button 
              type="text" 
              @click="openEditModal(record)"
            >
              <template #icon>
                <EditOutlined />
              </template>
              编辑
            </Button>
            
            <Popconfirm
              v-if="!record.is_deleted"
              title="确定要删除这个标签吗？"
              ok-text="确定"
              cancel-text="取消"
              @confirm="handleDelete(record.id)"
            >
              <Button type="text" danger>
                <template #icon>
                  <DeleteOutlined />
                </template>
                删除
              </Button>
            </Popconfirm>
            
            <Button 
              v-else 
              type="text" 
              @click="handleRestore(record.id)"
            >
              恢复
            </Button>
          </div>
        </template>
      </template>
    </Table>

    <!-- 新增/编辑标签模态框 -->
    <Modal
      v-model:open="modalVisible"
      :title="modalTitle"
      :confirm-loading="confirmLoading"
      @ok="handleSubmit"
      @cancel="handleCancel"
      ok-text="确定"
      cancel-text="取消"
    >
      <Form
        ref="formRef"
        :model="formData"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 16 }"
      >
        <Form.Item 
          label="标签名称" 
          name="name"
          :rules="[{ required: true, message: '请输入标签名称' }]"
        >
          <Input 
            v-model:value="formData.name" 
            placeholder="请输入标签名称" 
          />
        </Form.Item>
        <Form.Item 
          label="分数" 
          name="score"
          :rules="[{ required: true, message: '请输入分数' }]"
        >
          <InputNumber 
            v-model:value="formData.score" 
            :min="0"
            :max="100"
            style="width: 100%"
            placeholder="请输入分数" 
          />
        </Form.Item>
      </Form>
    </Modal>
  </div>
</template>

<style scoped>
.tag-management {
  padding: 10px;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.action-buttons {
  display: flex;
  justify-content: center;
  gap: 8px;
}
</style>
