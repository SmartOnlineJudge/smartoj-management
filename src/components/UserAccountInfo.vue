<script setup>
import {useUserStore} from "@/stores.js";
import {reactive, ref, computed} from "vue";
import {checkCode, updatePassword, verCode, updateEmail} from "@/request.js";
import {message} from "ant-design-vue";

const userStore = useUserStore();
const user = userStore.user;

const dataSource = [
  {
    title: '账号邮箱',
    description: '用于密码登录和验证码登录。',
    key: 'email',
    content: user['email'],
  },
  {
    title: '账号密码',
    description: '用于该账号的密码登录。',
    key: 'password',
    content: '当前平台不支持展示用户密码',
  },
  {
    title: 'GitHub Token',
    description: '通过 OAuth2 的方式从 GitHub 中获取的登录授权凭证，只能用于普通用户登录且不可修改。',
    key: 'githubToken',
    content: user['github_token'] || '暂未绑定'
  },
  {
    title: 'QQ Token',
    description: '通过 OAuth2 的方式从 QQ 中获取的登录授权凭证，只能用于普通用户登录且不可修改。',
    key: 'qqToken',
    content: user['qq_token'] || '暂未绑定'
  }
]

const open = ref(false);
const codeSentTime = ref(null);
const currentAction = ref('');
const formRef = ref();

const formState = reactive({
  newpassword: '',
  newEmail: '',
  verification_code: '',
  recipient: user['email']
});

const isSendDisabled = computed(() => {
  return currentAction.value === 'password'
      ? !formState.newpassword
      : !formState.newEmail;
});

const isSubmitDisabled = computed(() => {
  if (currentAction.value === 'password') {
    return !(formState.newpassword && formState.verification_code);
  } else {
    return !(formState.newEmail && formState.verification_code);
  }
});

const updateInfo = (key) => {
  currentAction.value = key;
  open.value = true;
}

const resetForm = () => {
  formRef.value?.resetFields();
};

const Send = () => {
  verCode(formState.recipient).then(response => {
    if (response.data.code === 200) {
      codeSentTime.value = Date.now();
      message.success(`验证码已发送`);
    } else if (response.data.code === 235) {
      message.error("邮箱不能为空");
    } else {
      message.error("请求过于频繁");
    }
  }).catch(() => {
    message.error("请求失败");
  });
}

const Update_Password = () => {
  checkCode(formState.verification_code, formState.recipient).then(response => {
    const currentTime = Date.now();
    if (response.data.code === 200) {
      updatePassword(formState.newpassword, formState.verification_code).then(response => {
        if (response.data.code === 200) {
          message.success(`密码修改成功`);
          open.value = false;
          resetForm();
        } else {
          handleVerificationError(currentTime);
        }
      }).catch(() => {
        message.error("密码修改失败");
      });
    } else {
      handleVerificationError(currentTime);
    }
  }).catch(() => {
    message.error("请求失败");
  });
}

const Update_Email = () => {
  checkCode(formState.verification_code, formState.recipient).then(response => {
    const currentTime = Date.now();
    if (response.data.code === 200) {
      updateEmail(formState.newEmail, formState.verification_code).then(response => {
        if (response.data.code === 200) {
          message.success(`邮箱修改成功`);
          userStore.user.email = formState.newEmail; // 更新store中的邮箱
          open.value = false;
          resetForm();
        } else {
          handleVerificationError(currentTime);
        }
      }).catch(() => {
        message.error("邮箱修改失败");
      });
    } else {
      handleVerificationError(currentTime);
    }
  }).catch(() => {
    message.error("请求失败");
  });
}

const handleVerificationError = (currentTime) => {
  if (currentTime - codeSentTime.value > 300000) {
    message.error("验证码已过期");
  } else {
    message.error("验证码错误");
  }
}

const handleCancel = () => {
  open.value = false;
  resetForm();
};
</script>

<template>
  <h2 style="margin-bottom: 0">用户账号信息</h2>
  <a-list item-layout="horizontal" :dataSource="dataSource">
    <template #renderItem="{ item }">
      <a-list-item>
        <template #actions>
          <a v-if="item.key === 'email' || item.key === 'password'"
             type="primary"
             @click="() => {updateInfo(item.key)}"
          >修改</a>
          <a v-else disabled>修改</a>
        </template>
        <a-list-item-meta :description="item.description">
          <template #title>
            {{ item.title }}
          </template>
        </a-list-item-meta>
        <div>{{ item.content }}</div>
      </a-list-item>
    </template>
  </a-list>
  <a-modal v-model:open="open"
           :title="currentAction === 'password'?'修改密码': '修改邮箱'"
           okText="提交"
           cancelText="取消"
           :closable="false"
           :ok-button-props="{ disabled: isSubmitDisabled }"
           @ok="currentAction === 'password'? Update_Password() : Update_Email()"
           @cancel="() => handleCancel()"
  >
    <a-form :model="formState" ref="formRef">
      <a-form-item
          :label="currentAction === 'password'?'新密码': '新邮箱'"
          :name="currentAction === 'password'? 'newpassword' : 'newEmail'"
          :rules="[currentAction === 'password'?
          { required: true, message: '请输入密码!' }:
          { required: true, message: '请输入新邮箱!' }]"
      >
        <a-input-password
            v-if="currentAction === 'password'"
            v-model:value="formState.newpassword"
        />
        <a-input v-else v-model:value="formState.newEmail"/>
      </a-form-item>
      <a-form-item
          label="收件邮箱"
          name="recipient"
      >
        <a-input v-model:value="formState.recipient"/>
      </a-form-item>
      <a-form-item
          label="验证码"
          name="verification_code"
          :rules="[{ required: true, message: '请输入验证码!' }]"
      >
        <div style="display: flex; gap: 20px; width: 280px">
          <a-input v-model:value="formState.verification_code"/>
          <a-button type="primary"
                    @click="Send"
                    :disabled="isSendDisabled"
          >发送验证码
          </a-button>
        </div>
      </a-form-item>
    </a-form>
  </a-modal>
</template>