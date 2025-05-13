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

const monaco_editor = ref(null);
let editor = null;

onMounted(() => {
  editor = monaco.editor.create(monaco_editor.value, {
    automaticLayout: true,  // 窗口自适应
    value: code.value,
    language: language.value,
    theme: props.theme,
    fontSize: props.fontSize,
  });

  // 编辑器内容改变事件
  editor.onDidChangeModelContent(() => {
    code.value = editor.getValue();
  })

  // 监听 language 变化，变化之后修改编辑器的语言类型
  watch(language, new_language => {
    monaco.editor.setModelLanguage(editor.getModel(), new_language);  // 更新编辑器语言类型
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
  <div ref="monaco_editor" style="margin: 0 auto; width: 900px; height: 500px"></div>
</template>
