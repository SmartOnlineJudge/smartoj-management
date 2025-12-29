<script setup>
import { ref, onMounted, watch } from "vue";
import * as monaco from 'monaco-editor'

// 定义双向数据流，父组件通过 v-model 来绑定
// 官方文档：https://cn.vuejs.org/guide/components/v-model.html
const code = defineModel('code')
const language = defineModel('language')

// 定义属性描述符，父组件通过 :<描述符名称> 来传递值
// 官方文档：https://cn.vuejs.org/api/sfc-script-setup.html#defineprops-defineemits
const props = defineProps({
  theme: String,
  fontSize: String,
})

// 语言映射表，将常见语言名称映射到Monaco支持的标识符
const languageMap = {
  'C': 'c',
  'C++': 'cpp',
  'Java': 'java',
  'Python': 'python',
  'JavaScript': 'javascript',
  'TypeScript': 'typescript',
  'Go': 'go',
  'PHP': 'php',
  'Ruby': 'ruby',
  'Swift': 'swift',
  'Kotlin': 'kotlin',
  'Rust': 'rust',
  'c': 'c',
  'cpp': 'cpp',
  'java': 'java',
  'python': 'python',
  'javascript': 'javascript',
  'typescript': 'typescript'
}

const monaco_editor = ref(null);
let editor = null;

// 获取Monaco支持的语言标识符
const getMonacoLanguage = (lang) => {
  return languageMap[lang] || lang.toLowerCase();
}

onMounted(() => {
  editor = monaco.editor.create(monaco_editor.value, {
    automaticLayout: true,  // 窗口自适应
    value: code.value,
    language: getMonacoLanguage(language.value),
    theme: props.theme,
    fontSize: props.fontSize,
    minimap: { enabled: false },
    scrollbar: {
      horizontal: 'hidden'
    },
  });

  // 编辑器内容改变事件
  editor.onDidChangeModelContent(() => {
    code.value = editor.getValue();
  })

  // 监听 language 变化，变化之后修改编辑器的语言类型
  watch(language, new_language => {
    monaco.editor.setModelLanguage(editor.getModel(), getMonacoLanguage(new_language));  // 更新编辑器语言类型
    editor.setValue(code.value)  // 更新编辑器代码
  })

  watch(code, newCode => {
    if (editor && editor.getValue() !== newCode) {
      editor.setValue(newCode);
    }
  }, { immediate: true });
})

</script>

<template>
  <div ref="monaco_editor" style="margin: 0 auto; width: 100%; height: 500px"></div>
</template>
