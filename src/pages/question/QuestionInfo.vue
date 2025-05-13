<template>
  <a-tabs v-model:activeKey="activeKey">
    <a-tab-pane key="1" tab="题目信息管理">
      <a-table
          :columns="columns"
          :dataSource="data"
          :loading="{spinning:spinning,tip:'页面加载中...'}"
          :pagination="pagination"
          @change="pageChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'operation'">
            <a-button type="primary" @click="() => { showDrawer(record) }">详情</a-button>
          </template>
          <template v-if="column.key === 'difficulty'">
            {{ record.difficulty === 'easy' ? '简单' : record.difficulty === 'medium' ? '中等' : '困难' }}
          </template>
          <template v-if="column.key === 'is_deleted'">
            {{ record.is_deleted === 0 ? '否' : '是' }}
          </template>
        </template>
      </a-table>
    </a-tab-pane>
    <a-tab-pane key="2" tab="标签信息管理"></a-tab-pane>
    <a-tab-pane key="3" tab="编程语言管理"></a-tab-pane>
  </a-tabs>
  <a-drawer
      v-model:open="open"
      width="950"
      :closable=false
      :maskStyle="{backgroundColor: 'rgba(30, 30, 30, 0.2)'}"
      :footer-style="{ textAlign: 'right' }"
      @close="onClose"
  >
    <div>
      <h3>题目信息概览</h3>
      <a-descriptions>
        <a-descriptions-item label="id">{{ current.id }}</a-descriptions-item>
        <a-descriptions-item label="题目名称" :span="2">{{ current.title }}</a-descriptions-item>
        <a-descriptions-item label="题目难度">{{ current.difficulty }}</a-descriptions-item>
        <a-descriptions-item label="提交数量">{{ current.submission_quantity }}</a-descriptions-item>
        <a-descriptions-item label="通过数量">{{ current.pass_quantity }}</a-descriptions-item>
        <a-descriptions-item label="创建时间">{{ current.created_at }}</a-descriptions-item>
        <a-descriptions-item label="题目创建人">{{ current.publisher.name }}</a-descriptions-item>
        <a-descriptions-item label="标签">
                <span v-for="tag in current.tags">{{ tag.name }}
                  {{ tag.id === current.tags.length - 1 ? " 、" : "" }}
                </span>
        </a-descriptions-item>
      </a-descriptions>
    </div>
    <div>
      <h3>题目描述</h3>
      <v-md-editor v-model="current.description" :include-level="[1, 2, 3, 4]" height="400px"></v-md-editor>
    </div>
    <div>
      <h3>测试用例</h3>
      <a-table :columns="innerColumns1" :dataSource="dataSource1" :pagination="false" bordered>
        <template #bodyCell="{ column, record, text}">
          <template v-if="column.key==='input_output'">
            <a-textarea
                v-if="editableData1[record.id]"
                v-model:value="editableData1[record.id][column.dataIndex]"
                style="margin: -5px 0"
            />
          </template>
          <template v-if="column.key === 'test_operation'">
            <div class="editable-row-operations">
                       <span v-if="editableData1[record.id]">
                         <a-typography-link @click="()=>{save(record,1)}">保存</a-typography-link>
                         <a-popconfirm
                             title="确定要取消?"
                             ok-text="确定"
                             cancel-text="取消"
                             @confirm="()=>{confirm(record,1)}"
                         >
                           <a>取消</a>
                         </a-popconfirm>
                       </span>
              <span v-else>
                        <a @click="()=>{edit(record,1)}">编辑</a>
                      </span>
            </div>
          </template>
        </template>
      </a-table>
    </div>
    <div>
      <h3>内存时间限制</h3>
      <a-table :columns="innerColumns2" :dataSource="dataSource2" :pagination="false" bordered>
        <template #bodyCell="{ column, record }">
          <template v-if="column.key==='memory_limit' || column.key==='time_limit'">
            <a-input
                v-if="editableData2[record.id]"
                v-model:value="editableData2[record.id][column.dataIndex]"
                style="margin: -5px 0"
            />
          </template>
          <template v-if="column.key==='language'">
            {{ record.language.name }}
          </template>
          <template v-if="column.key === 'memory_operation'">
            <div class="editable-row-operations">
                       <span v-if="editableData2[record.id]">
                         <a-typography-link @click="()=>{save(record,2)}">保存</a-typography-link>
                         <a-popconfirm
                             title="确定要取消?"
                             ok-text="确定"
                             cancel-text="取消"
                             @confirm="()=>{confirm(record,2)}"
                         >
                           <a>取消</a>
                         </a-popconfirm>
                       </span>
              <span v-else>
                        <a @click="()=>{edit(record,2)}">编辑</a>
                      </span>
            </div>
          </template>
        </template>
      </a-table>
    </div>
    <div>
      <h3>解题框架</h3>
      <div style="margin-bottom: 10px">
        <span>编程语言：</span>
        <select @change=" event => {languageChangeHandler(event,current.solving_frameworks,1)}">
          <option v-for="item in current.solving_frameworks" :value=item.language.name>{{
              item.language.name
            }}
          </option>
        </select>
      </div>
      <MonacoEditor
          v-model:code="code1"
          v-model:language="language1"
          :theme="theme"
          fontSize="16px"
          style="border: 1px solid black;"
      />
    </div>
    <div>
      <h3>判题模块</h3>
      <div style="margin-bottom: 10px">
        <span>编程语言：</span>
        <select @change=" event => {languageChangeHandler(event,current.judge_templates,2)}">
          <option v-for="item in current.judge_templates" :value=item.language.name>
            {{ item.language.name }}
          </option>
        </select>
      </div>
      <MonacoEditor
          v-model:code="code2"
          v-model:language="language2"
          :theme="theme"
          fontSize="16px"
          style="border: 1px solid black;"
      />
    </div>
    <template #footer>
      <a-button type="primary" @click="onClose">确定</a-button>
    </template>
  </a-drawer>
</template>

<script setup>
import {onBeforeMount, reactive, ref} from 'vue';
import {getQuestions} from "@/request.js";
import {cloneDeep} from "lodash-es";
import MonacoEditor from "../../components/MonacoEditor.vue";

const activeKey = ref('1');
const open = ref(false);
const data = ref([])
const dataSource1 = ref([])
const dataSource2 = ref([])
const current = ref({})
const defaultPageSize = 5
const spinning = ref(true)
const total = ref()
const editableData1 = reactive({});
const editableData2 = reactive({});
const pagination = reactive({
  total: total,
  pageSize: defaultPageSize,
})
const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
    align: 'center',
  },
  {
    title: '题目名称',
    dataIndex: 'title',
    align: 'center'
  },
  {
    title: '题目难度',
    dataIndex: 'difficulty',
    key: 'difficulty',
    align: 'center'
  },
  {
    title: '题目创建时间',
    dataIndex: 'created_at',
    align: 'center'
  },
  {
    title: '是否被删除',
    dataIndex: 'is_deleted',
    key: 'is_deleted',
    align: 'center'
  },
  {
    title: '操作',
    key: 'operation',
    align: 'center'
  },
];

const innerColumns1 = [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'test_id',
    align: 'center',
  },
  {
    title: '测试数据',
    dataIndex: 'input_output',
    key: 'input_output',
    align: 'center',
  },
  {
    title: '操作',
    key: 'test_operation',
    align: 'center'
  },
];

const innerColumns2 = [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'memory_id',
    align: 'center',
  },
  {
    title: '内存限制',
    dataIndex: 'memory_limit',
    key: 'memory_limit',
    align: 'center',
  },
  {
    title: '时间限制',
    dataIndex: 'time_limit',
    key: 'time_limit',
    align: 'center',
  },
  {
    title: '编程语言',
    dataIndex: 'language',
    key: 'language',
    align: 'center',
  },
  {
    title: '操作',
    key: 'memory_operation',
    align: 'center'
  },
];

const showDrawer = record => {
  open.value = true;
  current.value = record;
  dataSource1.value = record.tests;
  dataSource2.value = record.memory_time_limits;
  code1.value = record.solving_frameworks[0]?.code_framework ?? '暂无';
  code2.value = record.judge_templates[0]?.code ?? '暂无'
}

const onClose = () => {
  open.value = false;
};

const edit = (record, num) => {
  if (num === 1) {
    console.log(num)
    editableData1[record.id] = cloneDeep(dataSource1.value.filter(item => record.id === item.id)[0]);
  } else {
    editableData2[record.id] = cloneDeep(dataSource2.value.filter(item => record.id === item.id)[0]);
  }
};
const save = (record, num) => {
  if (num === 1) {
    console.log(num)
    Object.assign(record, editableData1[record.id]);
    delete editableData1[record.id];
  } else {
    Object.assign(record, editableData2[record.id]);
    delete editableData2[record.id];
  }
};
const confirm = (record, num) => {
  if (num === 1) {
    delete editableData1[record.id];
  } else {
    delete editableData2[record.id];
  }
}

const language1 = ref();
const theme = "vs"  // vs、vs-dar
const code1 = ref();

const code2 = ref();
const language2 = ref();

const languageChangeHandler = (event, current, num) => {
  if (num === 1) {
    const curr = ref()
    curr.value = current.filter(item => event.target.value === item.language.name)[0]
    language1.value = event.target.value;  // 修改语言
    code1.value = curr.value.code_framework;  // 修改语言对应的代码
  } else {
    const curr = ref()
    curr.value = current.filter(item => event.target.value === item.language.name)[0]
    language2.value = event.target.value;  // 修改语言
    code2.value = curr.value.code;  // 修改语言对应的代码
  }
}

const pageChangeHandler = async (page, pageSize) => {
  spinning.value = true
  const response = await getQuestions(page, pageSize)
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
.editable-row-operations a {
  margin-right: 8px;
}
</style>
