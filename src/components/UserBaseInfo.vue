<script setup>
import dayjs from 'dayjs';
import { ref } from "vue";
import { Modal, message } from "ant-design-vue";
import uploadOutlined from "@ant-design/icons-vue/lib/icons/UploadOutlined.js";
import { useUserStore } from "@/stores.js";
import { updateAdminInfo } from "@/request.js";

const MINIO_URL = import.meta.env.VITE_MINIO_URL
const userStore = useUserStore();
const user = userStore.user;
const dateFormat = 'YYYY-MM-DD';

const username = ref(user['name']);
const profile = ref(user['profile']);
const createdAt = dayjs(user['created_at'], dateFormat);

const updateInfo = () => {
  Modal.confirm({
    title: '提示',
    content: '是否更新当前信息？',
    onOk() {
      return updateAdminInfo(username.value, profile.value).then(response => {
        if (response.data.code === 200) {
          message.success("信息更新成功")
        } else {
          message.error("信息更新失败")
        }
      }).catch(() => {
        message.error("信息更新失败")
      })
    },
    okText: '确认',
    cancelText: '取消',
    centered: true
  })
}

const onChange = info => {
  if (info.file.status === 'done') {
    message.success('头像修改成功！');
  } else if (info.file.status === 'error') {
    message.error("头像修改失败");
  }
}
</script>

<template>
  <h2>用户基本信息</h2>
  <div class="base-info">
    <div class="account-info">
      <div class="field">
        <div class="field-name">用户ID</div>
        <a-input :value="user['user_id']" disabled style="width: 100%"></a-input>
      </div>
      <div class="field">
        <div class="field-name">用户名</div>
        <a-input v-model:value="username" allow-clear></a-input>
      </div>
      <div class="field">
        <div class="field-name">个人介绍</div>
        <a-textarea v-model:value="profile" allow-clear></a-textarea>
      </div>
      <div class="field">
        <div class="field-name">超级管理员身份</div>
        <a-radio-group v-model:value="user['is_superuser']">
          <a-radio :value="true">是</a-radio>
          <a-radio :value="false" disabled>否</a-radio>
        </a-radio-group>
      </div>
      <div class="field">
        <div class="field-name">账号是否被禁用</div>
        <a-radio-group v-model:value="user['is_deleted']">
          <a-radio :value="true" disabled>是</a-radio>
          <a-radio :value="false">否</a-radio>
        </a-radio-group>
      </div>
      <div class="field">
        <div class="field-name">账号创建时间</div>
        <a-date-picker :value="createdAt" disabled style="width: 100%"/>
      </div>
      <div class="field">
        <div class="field-name">账号等级</div>
        <a-input-number :value="user['grade']" disabled style="width: 100%"/>
      </div>
      <div class="field">
        <div class="field-name">经验值</div>
        <a-input-number :value="user['experience']" disabled style="width: 100%"/>
      </div>
      <a-button type="primary" @click="updateInfo">更改信息</a-button>
    </div>
    <div class="avatar-info">
      <div class="field">
        <div class="field-name">用户头像</div>
        <a-avatar :src="MINIO_URL + user['avatar']" :size="120" alt="favicon.svg"/><br/>
        <a-upload
            name="avatar"
            action="/api/user/avatar"
            :withCredentials="true"
            @change="onChange"
        >
          <a-button>
            <uploadOutlined/>
            更换头像
          </a-button>
        </a-upload>
      </div>
    </div>
  </div>
</template>

<style scoped>
.field {
  margin-bottom: 15px;
}
.field-name {
  margin-bottom: 5px;
}
.base-info {
  display: flex;
}
.account-info {
  width: 30%;
}
.avatar-info {
  margin-left: 60px;
}
</style>