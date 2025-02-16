<template>
  <div id="login-form">
    <div class="title">
      <img src="/favicon.svg" width="55" alt="favicon.svg"/>
      <h2 style="margin-left: 10px">智能算法刷题平台</h2>
    </div>
    <a-form
        :model="formState"
        autocomplete="off"
        @finish="onFinish"
    >
      <!-- 用户名 -->
      <a-form-item name="email" :rules="rules.emailRule">
        <a-input v-model:value="formState.email" placeholder="请输入管理员邮箱">
          <template #prefix>
            <MailOutlined />
          </template>
        </a-input>
      </a-form-item>
      <!-- 密码 -->
      <a-form-item name="password" :rules="rules.passwordRule">
        <a-input-password v-model:value="formState.password" placeholder="请输入管理员密码">
          <template #prefix>
            <LockOutlined/>
          </template>
        </a-input-password>
      </a-form-item>
      <!-- 登录 -->
      <a-form-item>
        <a-button type="primary" html-type="submit" style="width: 100%">登录</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { MailOutlined, LockOutlined } from "@ant-design/icons-vue";
import { message } from 'ant-design-vue';
import { adminLogin } from "@/request.js";

const emits = defineEmits(['onLoginSuccess'])
const rules = {
  emailRule: [{ required: true, message: '请输入邮箱' }],
  passwordRule: [{ required: true, message: '请输入密码' }]
}
const formState = reactive({
  email: '',
  password: '',
});
const onFinish = values => {
  adminLogin(values.email, values.password).then(response => {
    if (response.data.code === 300) {
      emits('onLoginSuccess')
    } else {
      message.error(response.data.message)
    }
  }).catch(error => {
    if (error.status === 422) {
      message.error("输入数据格式不正确")
    } else {
      message.error("登录异常")
    }
  })
};
</script>

<style scoped>
.title {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
}
</style>
