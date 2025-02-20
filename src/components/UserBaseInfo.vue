<script setup>
import dayjs from 'dayjs';
import { ref } from "vue";
import uploadOutlined from "@ant-design/icons-vue/lib/icons/UploadOutlined.js";
import { useUserStore } from "@/stores.js";

const MINIO_URL = import.meta.env.VITE_MINIO_URL
const userStore = useUserStore();
const user = userStore.user;
const dateFormat = 'YYYY-MM-DD';

const username = ref(user['name']);
const profile = ref(user['profile']);
const createdAt = dayjs(user['created_at'], dateFormat);
const fileList = ref([]);

const updateInfo = () => {

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
        <a-input :value="username" allow-clear></a-input>
      </div>
      <div class="field">
        <div class="field-name">个人介绍</div>
        <a-textarea :value="profile" allow-clear></a-textarea>
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
            :file-list="fileList"
            name="file"
            action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
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