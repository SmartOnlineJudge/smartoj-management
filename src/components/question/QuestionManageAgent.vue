<template>
  <div class="question-manage-agent">
    <div class="chat-header">
      <a-tooltip>
        <template #title>
          <span>关闭聊天界面</span>
        </template>
        <a-button type="link" @click="isChatbotVisible = false">
          <template #icon>
            <ArrowLeftOutlined />
          </template>
        </a-button>
      </a-tooltip>
      <div style="margin: 0 auto;">
        <h3 style="margin: 0;">{{ conversationTitle }}</h3>
      </div>
      <a-tooltip>
        <template #title>
          <span>查看历史聊天记录</span>
        </template>
        <a-button type="link" @click="() => { open = true }">
          <template #icon>
            <HistoryOutlined />
          </template>
        </a-button>
      </a-tooltip>
    </div>
    <div class="chat-content">
      <div class="welcome-box" v-if="items.length === 0">
        <div style="display: flex;flex-direction: column;width: 70%;">
          <img src="/favicon.svg" width="50" style="margin: 5px auto;"/>
          <span style="font-weight: bold;font-size: large;margin-bottom: 5px;">我是题目信息管理助手，有什么需要帮忙的嘛？</span>
          <span style="color: gray;">我可以更快的帮你管理系统中的题目信息，例如：我可以为你创建题目；也可以帮你完善题目相关信息。</span>
        </div>
      </div>
      <div class="chat-box">
        <BubbleList
          id="chat-box-list"
          :roles="rolesConfig"
          :items="items"
          @wheel="handleUserScroll"
          @scroll="handleUserScroll"
          :style="{ maxHeight: bubbleListMaxHeight, padding: '0 5px' }"
        />
      </div>
      <div class="input-box">
        <Sender
          v-model:value="inputValue"
          :loading="loading"
          @submit="submitHandler"
          @cancel="cancelHandler"
          placeholder="请输入你的需求"
        >
          <template #header>
            <Sender.Header
              :open="props.selectedRows.length > 0"
              :title="senderTitle"
            />
          </template>
        </Sender>
      </div>
    </div>
    <div class="chat-history">
      <a-drawer
        v-model:open="open"
        title="历史聊天记录"
        placement="right"
        :get-container="false"
        :bodyStyle="{ padding: 0 }"
        width="50%"
      >
        <div style="padding: 15px 5px 5px 5px">
          <a-button 
            type="primary" 
            shape="round" 
            style="width: 100%;"
            @click="createNewConversation"
          >
            <template #icon>
              <PlusCircleOutlined />
            </template>
            新建对话
          </a-button>
        </div>
        <a-divider style="margin: 10px 0 5px 0"/>
        <div>
          <a-spin :spinning="firstOpenSpinning">
            <Conversations 
              :items="conversations" 
              :menu="menuConfig"
              :activeKey="defaultMenuActivation"
              :onActiveChange="clickMenuHandler"
              style="margin-top: 0;padding-top: 5px;"
            />
          </a-spin>
        </div>
      </a-drawer>
    </div>
    <a-modal 
      v-model:open="openUpdateTitleModal" 
      title="修改对话标题" 
      @ok="updateTitle"
      okText="修改"
      cancelText="取消"
      :confirm-loading="confirmLoading"
    >
      <a-input v-model:value="modalInputValue"/>
    </a-modal>
  </div>
</template>

<script setup> 
import { h, ref, watch, nextTick, createVNode } from 'vue'
import { 
  ArrowLeftOutlined, 
  HistoryOutlined, 
  DeleteOutlined, 
  EditOutlined,
  PlusCircleOutlined,
  CaretRightOutlined,
  EnterOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons-vue';
import { Avatar, Collapse, CollapsePanel, Space, Typography, Modal, message } from 'ant-design-vue';
import { Sender, BubbleList, Conversations } from 'ant-design-x-vue';
import VueMarkdownEditor, { xss } from '@kangc/v-md-editor';

import { useUserStore } from '@/stores';
import { 
  chatWithQuestionManageAgent, 
  getConversation,
  getConversationHistory,
  interruptConversation,
  getConversationDetail,
  modifyConversationTitle,
  deleteConversation
} from '@/request';

// 全局变量
const MINIO_URL = import.meta.env.VITE_MINIO_URL
const userStore = useUserStore()
const currentThreadID = ref('')
const conversationTitle = ref('新聊天')

// 对外提供的属性
const isChatbotVisible = defineModel("isChatbotVisible")
const props = defineProps({
  selectedRows: {
    type: Array,
    default: () => []
  }
})

// 聊天主体内容相关代码
const bubbleListMaxHeight = ref('65vh')  // 计算BubbleList最大高度
const isAutoScroll = ref(true);  // 控制是否自动滚动到底部
const items = ref([])
let scrollTimer = null;
const markdownRender = content => {
  const html = xss.process(VueMarkdownEditor.vMdParser.themeConfig.markdownParser.render(content));
  return h('div', { innerHTML: html, class: 'vuepress-markdown-body' });
};
const toolCallRender = toolCall => {
  return h(Collapse, {
    bordered: false,
    style: { background: '#f2f2f2', margin: "10px 0" }
  }, {
    default: () => [
      h(CollapsePanel, 
      { key: "0", header: `⚒️工具调用: ${toolCall.name}` }, 
      {
        default: () => [
          h('p', { style: { whiteSpace: 'pre-wrap', margin: "0" } }, `参数: ${JSON.stringify(toolCall.args, null, 2)}`),
          toolCall.result ? h('p', { style: { whiteSpace: 'pre-wrap', margin: "0" } }, `工具调用结果: \n${toolCall.result}`) : null
        ]
      })
    ],
    expandIcon: ({ isActive }) => h(CaretRightOutlined, { rotate: isActive ? 90 : 0 })
  })
}
const assistantMessageRender = responseList => {
  let responseID = null
  let assistantContent = ""
  let renderedList = []
  let toolCalls = {};
  responseList.forEach(response => {
    if (responseID !== response.id) {
      if (assistantContent !== "") {
        renderedList.push(markdownRender(assistantContent))
      }
      if (response.type === "assistant") {
        assistantContent = response.content
        responseID = response.id
      } else {
        responseID = response.id
        assistantContent = ""
      }
      if (response.type === "tool_call") {
        toolCalls[response.id] = {
          name: response.name,
          args: response.args,
          result: null
        }
      }
      return
    } else {
      if (response.type === "assistant") { 
        assistantContent += response.content 
      }
    }
    if (response.type === "tool_call") {
      toolCalls[response.id] = {
        name: response.name,
        args: response.args,
        result: null
      }
    }
    if (response.type === "tool_call_result") {
      if (!toolCalls[response.id]) {
        toolCalls[response.id] = {}
      }
      toolCalls[response.id].result = response.result
      
      // 当工具调用有结果时，立即展示该工具调用信息
      const toolCall = toolCalls[response.id];
      if (toolCall.name) {
        renderedList.push(toolCallRender(toolCall));
      }
    }
  })
  // 处理最后一个消息块
  if (assistantContent !== "") {
    renderedList.push(markdownRender(assistantContent))
  }
  return h("div", renderedList);
}
const rolesConfig = {
  assistant: {
    placement: 'start',
    typing: { step: 5, interval: 20 },
    avatar: h(Avatar, { src: "/favicon.svg", shape: 'square' }),
    variant: "borderless",
    header: "题目信息管理助手",
    messageRender: assistantMessageRender
  },
  user: {
    placement: 'end',
    avatar: h(Avatar, { src: MINIO_URL + userStore.user["avatar"] }),
    header: userStore.user["name"]
  }
};
const handleUserScroll = () => {
  // 统一处理用户滚动行为
  const chatBoxList = document.getElementById("chat-box-list");
  if (!chatBoxList) return;
  
  // 清除之前的定时器
  if (scrollTimer) {
    clearTimeout(scrollTimer);
  }
  
  // 用户手动滚动时，暂时禁用自动滚动
  isAutoScroll.value = false;
  
  // 检查是否接近底部，如果接近底部则重新启用自动滚动
  scrollTimer = setTimeout(() => {
    const threshold = 50; // 距离底部50像素以内认为是底部
    if (chatBoxList.scrollTop + chatBoxList.clientHeight >= chatBoxList.scrollHeight - threshold) {
      isAutoScroll.value = true;
    }
  }, 100);
};
watch(() => items.value[items.value.length - 1], () => {
  // 监听items变化，根据isAutoScroll状态决定是否自动滚动到底部
  if (!isAutoScroll.value) return;
  
  // 使用nextTick确保DOM已经更新
  nextTick(() => {
    const chatBoxList = document.getElementById("chat-box-list");
    if (chatBoxList) {
      // 滚动到底部
      chatBoxList.scrollTo({
        top: chatBoxList.scrollHeight,
        behavior: 'smooth'
      });
    }
  });
}, { deep: true });
const updateBubbleListMaxHeight = () => {
  // 更新BubbleList最大高度的函数
  // 获取各个元素的高度
  const chatHeader = document.querySelector('.chat-header');
  const inputBox = document.querySelector('.input-box');
  const questionManagementBox = document.querySelector('.question-management');

  if (chatHeader && inputBox && questionManagementBox) {
    const headerHeight = chatHeader.offsetHeight || 0;
    const inputBoxHeight = inputBox.offsetHeight || 0;
    const questionManagementHeight = questionManagementBox.offsetHeight || 0
    // 计算其他margin/padding等间距
    const margins = 60; // 估算的额外间距
    
    // 计算BubbleList可用的最大高度
    const totalReservedHeight = headerHeight + inputBoxHeight + margins;
    const calculatedHeight = `calc(${questionManagementHeight}px - ${totalReservedHeight}px)`;
    bubbleListMaxHeight.value = calculatedHeight;
  }
};
watch(() => isChatbotVisible.value, () => {
  if (isChatbotVisible.value) {
    setTimeout(updateBubbleListMaxHeight, 150)
  }
})
watch(() => props.selectedRows, () => { setTimeout(updateBubbleListMaxHeight, 190) })


// 聊天输入框相关代码
const loading = ref(false);
const inputValue = ref('');
let interruptionSignal = false
const senderTitle = h(Space, {}, () => {
  const lastQuestion = props.selectedRows[props.selectedRows.length - 1]
  return [
    h(EnterOutlined),
    h(Typography.Text, { type: 'secondary' }, { default: () => `已选择题目ID：${lastQuestion.id}，${lastQuestion.title}` })
  ]
})
const updateConversationTitle = async () => {
  const conversationResponse = await getConversation(currentThreadID.value)
  const newTitle = conversationResponse.data.conversation.title
  conversationTitle.value = newTitle
}
const askAgent = async query => {
  try {
    const threadIDResponse = await chatWithQuestionManageAgent(query, currentThreadID.value);
    const threadID = threadIDResponse.data.thread_id;
    if (currentThreadID.value === "") {
      currentThreadID.value = threadID;
    }
    const response = await fetch('/ai-service/chat/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream'
      },
      body: JSON.stringify({ thread_id: threadID }),
      credentials: 'include',  // 发送cookies
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (!response.body) {
      throw new Error("ReadableStream not supported");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      
      // 解析SSE格式
      const lines = buffer.split('\n');
      buffer = lines.pop(); // 剩余的不完整行放回buffer

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim();
          if (data === 'DONE') {
            reader.cancel();
            return;
          }
          const jsonData = JSON.parse(data);
          if (jsonData.type === "node_call_log") {
            continue
          }
          items.value[items.value.length - 1].content.push(jsonData)
        }
      }
    }
  } catch (error) {
    console.error('Fetch error:', error);
  } finally {
    loading.value = false;
    if (conversationTitle.value === "新聊天" && !interruptionSignal) {
      await updateConversationTitle()
    }
    interruptionSignal = false
  }
}
const submitHandler = async () => {
  loading.value = true;
  let queryPrefix = '';
  if (props.selectedRows.length > 0) {
    const lastQuestion = props.selectedRows[props.selectedRows.length - 1]
    queryPrefix = `题目ID：${lastQuestion.id}，题目名称：${lastQuestion.title}，请根据题目信息完成相关需求：`
  }
  const query = queryPrefix + inputValue.value;
  items.value.push({
    key: items.value.length,
    role: 'user',
    content: query
  });
  inputValue.value = '';
  items.value.push({
    key: items.value.length,
    role: 'assistant',
    content: []
  })
  await askAgent(query)
};
const cancelHandler = async () => {
  await interruptConversation(currentThreadID.value);
  loading.value = false;
  interruptionSignal = true
};


// 聊天记录相关代码
const open = ref(false)
const conversations = ref([])
const defaultMenuActivation = ref('')
const firstOpenSpinning = ref(true)
const openUpdateTitleModal = ref(false)
const updateTitleThreadID = ref('')
const modalInputValue = ref('')
const confirmLoading = ref(false)
// 修改对话标题
const updateTitle = async () => {
  confirmLoading.value = true
  try {
      const response = await modifyConversationTitle(updateTitleThreadID.value, modalInputValue.value)
    if (response.data.success) {
      conversations.value = conversations.value.map(item => {
        if (item.key === updateTitleThreadID.value) {
          item.label = modalInputValue.value
        }
        return item
      })
      // 如果修改的是当前对话，那么修改当前对话的标题
      if (currentThreadID.value === updateTitleThreadID.value) {
        conversationTitle.value = modalInputValue.value
      }
      message.success('修改成功！')
      openUpdateTitleModal.value = false
    } else {
      message.error("修改失败")
    }
  } catch (error) {
    message.error("修改失败")
    console.log(error)
  } finally {
    confirmLoading.value = false
  }
}
const menuConfig = conversation => {
  return {
    items: [
      {
        label: "修改标题",
        key: 1,
        icon: h(EditOutlined),
      },
      {
        label: "删除对话",
        key: 2,
        icon: h(DeleteOutlined),
        danger: true,
      },
    ],
    onClick: (menuInfo) => {
      const key = menuInfo.key
      const _threadID = conversation.key
      if (key === 1) {
        openUpdateTitleModal.value = true
        modalInputValue.value = conversation.title
        updateTitleThreadID.value = _threadID
      } else {
        Modal.confirm({
          title: '是否删除该对话？',
          icon: createVNode(ExclamationCircleOutlined),
          content: '删除该对话以后将不会出现在历史聊天记录页面中，请谨慎操作！',
          okText: '确认',
          cancelText: '取消',
          onOk() {
            return deleteConversation(_threadID).then(response => {
              if (response.data.success) {
                message.success('删除成功！')
                conversations.value = conversations.value.filter(item => item.key !== _threadID)
                // 如果删除的是当前对话，那么直接清空对话信息
                if (currentThreadID.value === _threadID) {
                  items.value = []
                  conversationTitle.value = "新对话"
                }
              } else {
                message.error('删除失败！')
              }
            })
          }
        });
      }
    },
  }
}
// 第一次打开菜单时，查询所有对话记录
watch(() => open.value, async () => {
  if (!open.value || conversations.value.length !== 0) {
    return
  }
  const response = await getConversationHistory()
  const responseConversations = response.data.conversations
  conversations.value = responseConversations.map(item => ({key: item.thread_id, label: item.title, ...item}))
  firstOpenSpinning.value = false
})
// 点击对话，恢复聊天记录
const clickMenuHandler = async threadID => { 
  defaultMenuActivation.value = threadID;
  const response = await getConversationDetail(threadID)
  const newItems = []
  let assistantMessages = []
  const details = response.data.details
  details.forEach(item => {
    if (item.type == "user") {
      if (assistantMessages.length > 0) {
        newItems.push({
          key: assistantMessages[assistantMessages.length - 1].id,
          role: 'assistant',
          content: assistantMessages
        })
        assistantMessages = []
      }
      newItems.push({
        key: newItems.id,
        role: 'user',
        content: item.content
      })
    } else {
      assistantMessages.push(item)
    }
  })
  if (assistantMessages.length > 0) {
    newItems.push({
      key: assistantMessages[assistantMessages.length - 1].id,
      role: 'assistant',
      content: assistantMessages
    })
  }
  for (let i = 0; i < conversations.value.length; i++) {
    if (conversations.value[i].key == threadID) {
      conversationTitle.value = conversations.value[i].label
      break
    }
  }
  currentThreadID.value = threadID;
  items.value = newItems
  open.value = false
};
const createNewConversation = () => { 
  open.value = false; 
  items.value = []
  conversationTitle.value = "新聊天"
  currentThreadID.value = ""
};
</script>

<style scoped>
.question-manage-agent {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 0 10px 10px 10px;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  position: relative;
}
.chat-header {
  display: flex;
  align-items: center;
  border-bottom: 1px solid #e0e0e0;
  margin-bottom: 10px;
  height: 5vh;
}
.chat-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.welcome-box {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
}
.chat-box {
  margin-bottom: 5px;
}
.chat-box :deep(.vuepress-markdown-body) {
  padding: 0;
  font-size: unset;
  background-color: unset;
  color: unset;
}
.input-box {
  margin-top: auto;
}
</style>
