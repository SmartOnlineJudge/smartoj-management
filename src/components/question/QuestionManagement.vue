<template>
  <a-button type="primary"
            @click="()=>{addQuestionData.openAddQuestion=true}">+增加
  </a-button>
  <a-table
      :columns="columns"
      :dataSource="data"
      :loading="{spinning:spinning,tip:'页面加载中...'}"
      :pagination="pagination"
      @change="pageChange"
  >
    <template #bodyCell="{ column, record }">
      <template v-if="column.key === 'operation'">
        <a-button type="link" @click="() => { showDrawer(record) }">详细</a-button>
        <a-button type="link" @click="() => { revise(record) }">修改</a-button>
      </template>
      <template v-if="column.key === 'difficulty'">
        {{ record.difficulty === 'easy' ? '简单' : record.difficulty === 'medium' ? '中等' : '困难' }}
      </template>
      <template v-if="column.key === 'is_deleted'">
        <a-switch
            v-model:checked="record.is_deleted"
            :loading="record.loading"
            checked-children="是"
            un-checked-children="否"
            @change="(checked)=>{delQuestion(checked,record)}"
        />
      </template>
    </template>
  </a-table>
  <a-drawer
      v-model:open="open"
      width="950"
      :closable=false
      :maskStyle="{backgroundColor: 'rgba(30, 30, 30, 0.2)'}"
      :footer-style="{ textAlign: 'right' }"
  >
    <div>
      <h3>题目信息概览</h3>
      <a-descriptions>
        <a-descriptions-item label="id">{{ current.id }}</a-descriptions-item>
        <a-descriptions-item label="题目名称">{{ current.title }}</a-descriptions-item>
        <a-descriptions-item label="题目难度">
          {{ current.difficulty === 'easy' ? '简单' : current.difficulty === 'medium' ? '中等' : '困难' }}
        </a-descriptions-item>
        <a-descriptions-item label="题目创建人">{{ current.publisher.user_dynamic.name }}</a-descriptions-item>
        <a-descriptions-item label="提交数量">{{ current.submission_quantity }}</a-descriptions-item>
        <a-descriptions-item label="通过数量">{{ current.pass_quantity }}</a-descriptions-item>
        <a-descriptions-item label="创建时间">{{ current.created_at }}</a-descriptions-item>
        <a-descriptions-item label="标签">
          <a-select
              v-model:value="tags"
              mode="multiple"
              style="width: 80%"
              placeholder="Please select"
              :options="tagOptions"
              @deselect="tagDelete"
              @select="addTag"
          />
        </a-descriptions-item>
      </a-descriptions>
    </div>
    <div>
      <h3>题目描述</h3>
      <v-md-editor v-model="current.description" :include-level="[1, 2, 3, 4]" height="400px"></v-md-editor>
    </div>
    <div>
      <h3>测试用例</h3>
      <a-button type="primary" style="margin-bottom: 8px"
                @click="()=>{addTestData.openAddTest=true;addTestData.id=currentId}">+增加
      </a-button>
      <a-modal v-model:open="addTestData.openAddTest" title="增加测试用例" @ok="()=>{addTestHandler(addTestData)}"
               @cancel="()=>{addTestData.testData=''}">
        <a-form
            :model="addTestData"
        >
          <a-form-item
              label="题目编号"
          >
            {{ addTestData.id }}
          </a-form-item>

          <a-form-item
              label="测试数据"
          >
            <a-textarea v-model:value="addTestData.testData" :rows="4"/>
          </a-form-item>
        </a-form>
      </a-modal>
      <a-table :columns="innerColumnsTest" :dataSource="dataSourceTest" :pagination="false" bordered>
        <template #bodyCell="{ column, record }">
          <template v-if="column.key==='input_output'">
            <a-textarea
                v-if="editableDataTest[record.id]"
                v-model:value="editableDataTest[record.id][column.dataIndex]"
                style="margin: -5px 0"
            />
          </template>
          <template v-if="column.key === 'test_operation'">
            <div class="editable-row-operations">
              <span v-if="editableDataTest[record.id]">
                  <a @click="()=>{save(record.id,'test')}">保存</a>
                  <a-popconfirm title="确定要删除此项？" @confirm="()=>{del_test(record.id)}">
                    <a>删除</a>
                  </a-popconfirm>
                      <a @click="()=>{cancel(record,'test')}">取消</a>
                </span>
              <span v-else>
                  <a @click="()=>{edit(record.id,'test')}">编辑</a>
              </span>
            </div>
          </template>
        </template>
      </a-table>
    </div>
    <div>
      <h3>内存时间限制</h3>
      <a-button type="primary" style="margin-bottom: 8px"
                @click="()=>{addMemoryTimeLimitData.openAddMemoryTimeLimit=true;addMemoryTimeLimitData.question_id=currentId}">
        +增加
      </a-button>
      <a-modal v-model:open="addMemoryTimeLimitData.openAddMemoryTimeLimit"
               title="增加内存时间限制"
               @ok="()=>{addMemoryTimeLimitHandler(addMemoryTimeLimitData)}"
               @cancel="()=>{resetMemoryTimeLimit.resetFields()}">
        <a-form :model="addMemoryTimeLimitData" ref="resetMemoryTimeLimit">
          <a-form-item label="题目编号">
            {{ addMemoryTimeLimitData.question_id }}
          </a-form-item>
          <a-form-item label="编程语言">
            <a-select v-model:value=addMemoryTimeLimitData.language placeholder="请选择编程语言">
              <a-select-option v-for="(_,value) in languageId"
                               :value=value>{{
                  value
                }}
              </a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="内存限制">
            <a-input v-model:value="addMemoryTimeLimitData.memory_limit"/>
          </a-form-item>
          <a-form-item label="时间限制">
            <a-input v-model:value="addMemoryTimeLimitData.time_limit"/>
          </a-form-item>
        </a-form>
      </a-modal>
      <a-table :columns="innerColumnsMemory" :dataSource="dataSourceMemory" :pagination="false" bordered>
        <template #bodyCell="{ column, record }">
          <template v-if="column.key==='memory_limit' || column.key==='time_limit'">
            <a-input
                v-if="editableDataMemory[record.id]"
                v-model:value="editableDataMemory[record.id][column.dataIndex]"
                style="margin: -5px 0"
            />
          </template>
          <template v-if="column.key==='language'">
            {{ record.language.name }}
          </template>
          <template v-if="column.key === 'memory_operation'">
            <div class="editable-row-operations">
              <span v-if="editableDataMemory[record.id]">
                  <a @click="()=>{save(record.id,'memory')}">保存</a>
                      <a @click="()=>{cancel(record,'memory')}">取消</a>
                </span>
              <span v-else>
                  <a @click="()=>{edit(record.id,'memory')}">编辑</a>
              </span>
            </div>
          </template>
        </template>
      </a-table>
    </div>
    <div>
      <h3>解题框架</h3>
      <div style="margin-bottom: 5px">
        <span style="font-size:15px">编程语言：</span>
        <span>
          <a-select v-model:value="languageSolve"
                    @change=" event => {languageChangeHandler(event,current.solving_frameworks,'solving_frameworks')}"
                    size="small"
                    style="width: 100px"
          >
            <option v-for="(_,value) in languageId"
                    :value=value>{{
                value
              }}
            </option>
          </a-select>
        </span>
        <span style="margin-left: 550px">
            <a-button type="link"
                      @click="reviseSolvingFrameworkHandler(idSolvingFramework,codeSolve,currentId,languageSolve)">
              保存
            </a-button>
        </span>
      </div>
      <MonacoEditor
          v-model:code="codeSolve"
          v-model:language="languageSolve"
          :theme="theme"
          fontSize="16px"
          style="border: 1px solid black"
      />
    </div>
    <div>
      <h3>判题模板</h3>
      <div style="margin-bottom: 5px">
        <span style="font-size:15px">编程语言：</span>
        <span>
          <a-select v-model:value="languageJudge"
                    @change=" event => {languageChangeHandler(event,current.judge_templates,'judge_template')}"
                    size="small"
                    style="width: 100px"
          >
            <option v-for="(_,value) in languageId"
                    :value=value>{{
                value
              }}
            </option>
          </a-select>
        </span>
        <span style="margin-left: 550px">
            <a-button type="link"
                      @click="reviseJudgeTemplateHandler(idJudgeTemplate,codeJudge,currentId,languageJudge)">
              保存
            </a-button>
        </span>
      </div>
      <MonacoEditor
          v-model:code="codeJudge"
          v-model:language="languageJudge"
          :theme="theme"
          fontSize="16px"
          style="border: 1px solid black;"
      />
    </div>
    <template #footer>
      <a-button type="primary" @click="()=>{open = false;data.filter(item=>item.id ===currentId)[0]=current}">确定
      </a-button>
    </template>
  </a-drawer>
  <a-modal v-model:open="openRevise" :width="800" @ok="()=>{handleOk(currentRevise.id)}">
    <a-form
        :model="formState"
    >
      <a-form-item label="题目ID" name="id">
        <span>{{ currentRevise.id }}</span>
      </a-form-item>
      <a-form-item label="题目名称" name="title">
        <a-input v-model:value="formState.title" allow-clear/>
      </a-form-item>
      <a-form-item label="是否删除">
        <a-switch v-model:checked="formState.is_deleted"
                  checked-children="是"
                  un-checked-children="否"/>
      </a-form-item>
      <a-form-item label="题目难度" name="difficulty">
        <a-radio-group v-model:value="formState.difficulty">
          <a-radio value="easy">简单</a-radio>
          <a-radio value="medium">中等</a-radio>
          <a-radio value="hard">困难</a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item label="题目描述" name="description">
         <v-md-editor v-model="formState.description" :include-level="[1, 2, 3, 4]" height="300px"></v-md-editor>
      </a-form-item>
    </a-form>
  </a-modal>
  <a-modal v-model:open="addQuestionData.openAddQuestion"
           :width="700"
           title="添加题目"
           :footer="null"
           @cancel="()=>{addQuestionData.openAddQuestion = false;addQuestionFrom.resetFields()}"
  >
    <a-form
        ref="addQuestionFrom"
        :model="addQuestionData"
    >
      <a-form-item label="题目名称" name="title" :rules="[{required: true,message: '请输入题目名称'}]">
        <a-input v-model:value="addQuestionData.title" allow-clear/>
      </a-form-item>
      <a-form-item label="题目难度" name="difficulty" :rules="[{required: true,message: '请输入题目标题'}]">
        <a-radio-group v-model:value="addQuestionData.difficulty">
          <a-radio value="easy">简单</a-radio>
          <a-radio value="medium">中等</a-radio>
          <a-radio value="hard">困难</a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item label="题目描述" name="description" :rules="[{required: true,message: '请输入题目描述'}]">
         <v-md-editor v-model="addQuestionData.description" :include-level="[1, 2, 3, 4]" height="300px"></v-md-editor>
      </a-form-item>
      <a-form-item style="margin-left: 516px;height: 5px">
        <a-button style="margin-right: 8px"
                  @click="()=>{addQuestionData.openAddQuestion=false;addQuestionFrom.resetFields()}"
        >
          取消
        </a-button>
        <a-button type="primary" html-type="submit" @click="addQuestionHandler">确认</a-button>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup>
import {onBeforeMount, reactive, ref} from 'vue';
import {
  delTest,
  getQuestions,
  ReviseRevise,
  updateMemoryLimits,
  updateTest,
  addTest,
  addMemoryTimeLimit,
  addSolvingFramework,
  reviseSolvingFramework,
  addJudgeTemplate,
  reviseJudgeTemplate,
  permissionDetection,
  addQuestion,
  addQuestionTag,
  deleteQuestionTag,
  allTags,
  getLanguageList
} from "@/request.js";
import MonacoEditor from "../../components/MonacoEditor.vue";
import {message, Modal} from "ant-design-vue";
import {cloneDeep} from 'lodash-es';

const open = ref(false);
const data = ref([])
const dataSourceTest = ref([])
const dataSourceMemory = ref([])
const inforCurrent = ref()
const current = ref({})
const defaultPageSize = 5
const spinning = ref(true)

const total = ref()
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
const currentId = ref()
const tags = ref([])
const showDrawer = record => {
  open.value = true;
  current.value = record;
  tags.value = [];
  dataSourceTest.value = record.tests;
  dataSourceMemory.value = record.memory_time_limits;
  languageSolve.value = record.solving_frameworks[0]?.language.name ?? 'C';
  existSolvingFramework.value = !!record.solving_frameworks && record.solving_frameworks.length > 0;
  existJudgeTemplate.value = !!record.judge_templates && record.judge_templates.length > 0;
  codeSolve.value = record.solving_frameworks[0]?.code_framework ?? '';
  codeJudge.value = record.judge_templates[0]?.code ?? '';
  languageJudge.value = record.judge_templates[0]?.language.name ?? 'C';
  idSolvingFramework.value = record.solving_frameworks[0]?.id ?? '';
  idJudgeTemplate.value = record.judge_templates[0]?.id ?? '';
  currentId.value = record.id;
  for (let i = 0; i < record.tags.length; i++) {
    tags.value.push(record.tags[i].tag.name)
  }
}

//标签
let tagOptionsObject = {};
let tagOptions = []
const addTag = (tag) => {
  addQuestionTag(currentId.value, tagOptionsObject[tag]).then(response => {
    if (response.data.code === 200) {
      current.value.tags.push({"id": response.data.data.question_tag_id, "tag": {"name": tag}});
      message.success(response.data.message);
    } else {
      message.error(response.data.message);
    }
  }).catch(() => {
    message.error("请求失败");
  })
}
const tagDelete = (value) => {
  const questionTag = current.value.tags.filter(tag => value === tag.tag.name)[0]
  deleteQuestionTag(questionTag.id).then(response => {
    if (response.data.code === 200) {
      current.value.tags = current.value.tags.filter(tag => value !== tag.tag.name);
      message.success(response.data.message);
    } else {
      message.error(response.data.message);
    }
  }).catch(() => {
    message.error("请求失败");
  })
}

//测试用例、内存时间限制
const editableDataTest = reactive({});
const editableDataMemory = reactive({});
const innerColumnsTest = [
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
const innerColumnsMemory = [
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

const edit = (id, name) => {
  if (name === 'test') {
    editableDataTest[id] = cloneDeep(dataSourceTest.value.filter(item => id === item.id)[0])
  } else {
    editableDataMemory[id] = cloneDeep(dataSourceMemory.value.filter(item => id === item.id)[0])
  }
}
const save = (id, name) => {
  if (name === 'test') {
    Object.assign(dataSourceTest.value.filter(item => id === item.id)[0], editableDataTest[id])
    updateTest(editableDataTest[id]).then(response => {
      if (response.data.code === 200) {
        message.success(response.data.message)
      } else {
        message.error(response.data.message)
      }
    }).catch(() => {
      message.error("请求失败")
    }).finally(() => {
      delete editableDataTest[id];
    })
  } else {
    Object.assign(dataSourceMemory.value.filter(item => id === item.id)[0], editableDataMemory[id])
    updateMemoryLimits(editableDataMemory[id]).then(response => {
      if (response.data.code === 200) {
        message.success(response.data.message)
      } else {
        message.error(response.data.message)
      }
    }).catch(() => {
      message.error("请求失败")
    }).finally(() => {
      delete editableDataMemory[id];
    })
  }
};
const del_test = (id) => {
  delTest(id).then(response => {
    if (response.data.code === 200) {
      dataSourceTest.value = dataSourceTest.value.filter(item => item.id !== id);
      message.success("删除成功")
    } else {
      message.error(response.data.message)
    }
  }).catch(() => {
        message.error("请求失败")
      }
  ).finally(() => {
    delete editableDataTest[id]
  })
}
const cancel = (record, name) => {
  if (name === 'test') {
    delete editableDataTest[record.id]
  } else {
    delete editableDataMemory[record.id]
  }
}

const addTestData = reactive({
  id: '',
  testData: '',
  openAddTest: false,
})
const addTestHandler = (addTestData) => {
  addTest(addTestData).then(response => {
    if (response.data.code === 200) {
      dataSourceTest.value.push({"id": response.data.data.test_id, "input_output": addTestData.testData})
      message.success(response.data.message)
    } else {
      message.error(response.data.message)
    }
  }).catch(() => {
    message.error("请求失败")
  }).finally(() => {
    addTestData.openAddTest = false;
    addTestData.testData = ''
  })
}
const addMemoryTimeLimitData = reactive({
  question_id: '',
  language: null,
  language_id: '',
  time_limit: '',
  memory_limit: '',
  openAddMemoryTimeLimit: false
})
const resetMemoryTimeLimit = ref()
const addMemoryTimeLimitHandler = (addMemoryTimeLimitData) => {
  addMemoryTimeLimitData.language_id = languageId[addMemoryTimeLimitData.language];
  addMemoryTimeLimit(addMemoryTimeLimitData).then(response => {
    if (response.data.code === 200) {
      dataSourceMemory.value.push(
          {
            "id": response.data.data.memory_time_limit_id,
            "memory_limit": addMemoryTimeLimitData.memory_limit,
            "time_limit": addMemoryTimeLimitData.time_limit,
            "language": {
              "id": addMemoryTimeLimitData.language_id,
              "name": addMemoryTimeLimitData.language
            }
          })
      message.success(response.data.message)
    } else {
      message.error(response.data.message)
    }
  }).catch(() => {
    message.error("请求失败")
  }).finally(() => {
    addMemoryTimeLimitData.openAddMemoryTimeLimit = false
  })
}


//解题框架、判题模块
const languageSolve = ref();
const theme = "vs"
const codeSolve = ref();
const idSolvingFramework = ref();
const codeJudge = ref();
const languageJudge = ref();
const existSolvingFramework = ref()
const existJudgeTemplate = ref()
const idJudgeTemplate = ref()
let languageId = {}

const reviseSolvingFrameworkHandler = (id, code, questionId, language) => {
  Modal.confirm({
        title: '操作确认',
        content: '确认要保存修改的内容吗？',
        onOk() {
          if (existSolvingFramework.value === false) {
            addSolvingFramework(code, languageId[language], questionId).then(response => {
              if (response.data.code === 200) {
                current.value.solving_frameworks.push(
                    {
                      "id": response.data.data.solving_framework_id,
                      "code_framework": code,
                      "language": {
                        "id": languageId[language],
                        "name": language
                      }
                    });
                existSolvingFramework.value = true;
                idSolvingFramework.value = response.data.data.solving_framework_id;
                message.success(response.data.message)
              } else {
                message.error(response.data.message)
              }
            }).catch(() => {
              message.error("请求失败")
            })
          } else {
            return reviseSolvingFramework(id, code).then(response => {
              if (response.data.code === 200) {
                current.value.solving_frameworks.filter(item => item.id === id)[0].code_framework = code;
                message.success(response.data.message)
              } else {
                message.error(response.data.message)
              }
            }).catch(() => {
              message.error("请求失败")
            })
          }
        },
        okText: '确认',
        cancelText: '取消',
      }
  )
}

const languageChangeHandler = (event, current, name) => {
  const curr = ref()
  curr.value = current.filter(item => event === item.language.name)[0]
  existSolvingFramework.value = true
  existJudgeTemplate.value = true
  if (curr.value === undefined) {
    if (name === 'solving_frameworks') {
      languageSolve.value = event;
      codeSolve.value = '';
      existSolvingFramework.value = false;
    } else {
      languageJudge.value = event;
      codeJudge.value = '';
      existJudgeTemplate.value = false;
    }
  } else {
    if (name === 'solving_frameworks') {
      languageSolve.value = event;  // 修改语言
      codeSolve.value = curr.value.code_framework;  // 修改语言对应的代码
      idSolvingFramework.value = curr.value.id
    } else {
      languageJudge.value = event;  // 修改语言
      codeJudge.value = curr.value.code;  // 修改语言对应的代码
      idJudgeTemplate.value = curr.value.id
    }
  }
}

const reviseJudgeTemplateHandler = (id, code, questionId, language) => {
  Modal.confirm({
        title: '操作确认',
        content: '确认要保存修改的内容吗？',
        onOk() {
          if (existJudgeTemplate.value === false) {
            addJudgeTemplate(questionId, languageId[language], code).then(response => {
              if (response.data.code === 200) {
                current.value.judge_templates.push(
                    {
                      "id": response.data.data.judge_template_id,
                      "code": code,
                      "language": {
                        "id": languageId[language],
                        "name": language
                      }
                    });
                existJudgeTemplate.value = true;
                idJudgeTemplate.value = response.data.data.judge_template_id;
                message.success(response.data.message)
              } else {
                message.error(response.data.message)
              }
            }).catch(() => {
              message.error("请求失败")
            })
          } else {
            return reviseJudgeTemplate(id, code).then(response => {
              if (response.data.code === 200) {
                current.value.judge_templates.filter(item => item.id === id)[0].code = code;
                message.success(response.data.message)
              } else {
                message.error(response.data.message)
              }
            }).catch(() => {
              message.error("请求失败")
            })
          }
        },
        okText: '确认',
        cancelText: '取消',
      }
  )
}

//获取题目信息
const pageChangeHandler = async (page, pageSize) => {
  spinning.value = true
  const response = await getQuestions(page, pageSize)
  data.value = response.data.data.results
  total.value = response.data.data.total
  inforCurrent.value = response.config.params.page
  spinning.value = false
}

const pageChange = pagination => {
  pageChangeHandler(pagination.current, pagination.pageSize)
  currentPage.value= pagination.current
}

onBeforeMount(() => {
  pageChangeHandler(1, defaultPageSize)
  allTags().then(response => {
    const tags = response.data.data;
    tags.forEach(tag => {
      tagOptionsObject[tag.name] = tag.id;
      tagOptions.push({'value': tag.name})
    });
  })
  getLanguageList().then(response => {
    const languageList = response.data.data;
    languageList.forEach(language => {
      languageId[language.name] = language.id
    });
  })
})

// 题目信息
const openRevise = ref(false)
const currentRevise = ref()
const currentPage = ref()
const formState = reactive({
  id: '',
  title: '',
  description: '',
  difficulty: '',
  is_deleted: ''
})
const addQuestionData = reactive({
  openAddQuestion: false,
  title: null,
  description: '',
  difficulty: null
})

const addQuestionFrom = ref()
const addQuestionHandler = () => {
  addQuestionFrom.value.validateFields().then(values => {
    // 验证通过后再处理数据
    const submitData = {
      ...values,
    }
    addQuestion(submitData).then(response => {
      if (response.data.code === 200) {
        addQuestionData.openAddQuestion = false
        addQuestionFrom.value.resetFields();
        pageChangeHandler(currentPage.value, defaultPageSize)
        message.success(response.data.message)
      } else {
        message.error(response.data.message)
      }
    }).catch(() => {
      message.error("请求失败")
    })
  })
}
const revise = (record) => {
  openRevise.value = true
  currentRevise.value = record
  formState.id = record.id
  formState.title = record.title
  formState.description = record.description
  formState.difficulty = record.difficulty
  formState.is_deleted = record.is_deleted
}
const handleOk = (id) => {
  permissionDetection(id).then(response => {
    if (response.data.code === 200) {
      ReviseRevise(formState).then(response => {
        if (response.data.code === 200) {
          const current = ref()
          current.value = data.value.filter(item => item.id === id)[0]
          current.value.title = formState.title
          current.value.description = formState.description
          current.value.difficulty = formState.difficulty
          current.value.is_deleted = formState.is_deleted
          message.success(response.data.message)
        } else {
          message.error(response.data.message)
        }
      }).catch(() => {
            message.error('请求失败')
          }
      )
    } else {
      message.error(response.data.message)
    }
  }).catch(() => {
    message.error('请求失败')
  }).finally(() => {
    openRevise.value = false
  })
}

const delQuestion = (checked, record) => {
  record.loading = true;
  const actionText = checked ? '删除' : '恢复';
  Modal.confirm({
    title: `${actionText}题目`,
    content: `确定要${actionText}该题目吗？`,
    okText: '确定',
    cancelText: '取消',
    onOk() {
      record.is_deleted = checked;
      return ReviseRevise(record).then(response => {
        if (response.data.code === 200) {
          message.success(response.data.message);
        } else {
          record.is_deleted = !checked;
          message.error(response.data.message);
        }
      }).catch(() => {
        record.is_deleted = !checked;
        message.error("请求失败");
      }).finally(() => {
        record.loading = false;
      });
    },
    onCancel() {
      record.is_deleted = !checked;
      record.loading = false;
    },
  });
}
</script>

<style scoped>
.editable-row-operations a {
  margin-right: 8px;
}
</style>
