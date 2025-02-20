<script setup>
import { ref } from "vue";
import UserAccountInfo from "@/components/UserAccountInfo.vue";
import UserBaseInfo from "@/components/UserBaseInfo.vue";

const selectedKeys = ref(['1'])
</script>

<template>
  <div class="user-center">
    <div class="user-center-menu">
      <a-menu
          style="text-align: center"
          :selected-keys="selectedKeys"
          @click="item => selectedKeys = [item.key]"
      >
        <a-menu-item key="1">
          <span>用户基本信息</span>
        </a-menu-item>
        <a-menu-item key="2">
          <span>用户账号信息</span>
        </a-menu-item>
      </a-menu>
    </div>
    <div class="user-center-content">
      <UserBaseInfo v-if="selectedKeys[0] === '1'" />
      <UserAccountInfo v-else/>
    </div>
  </div>
</template>

<style scoped>
.user-center {
  width: 100%;
  height: max-content;
  background: #ffffff;
  border-radius: 10px;
  padding: 15px 0;
  display: flex;
}
.user-center-menu {
  width: 13%;
  border-right: 1px solid #dcdcdc;
}
.user-center-content {
  width: 85%;
  padding: 10px 30px;
}
</style>