<script setup lang="ts">
import { ref, reactive, computed } from "vue";
import type { FormInstance, UploadProps, UploadRawFile } from "element-plus";
import { ElMessage } from "element-plus";
import { useUserStoreHook } from "@/store/modules/user";
import { storageLocal } from "@pureadmin/utils";
import { userKey } from "@/utils/auth";
import {
  nicknameRules,
  phoneRules,
  emailRules,
  passwordRules
} from "./utils/rule";

defineOptions({
  name: "Profile"
});

const userStore = useUserStoreHook();

// 激活的标签页
const activeTab = ref("info");

// 加载状态
const loading = ref(false);

// 头像上传相关
const dialogVisible = ref(false);
const imageUrl = ref(userStore.avatar || "");
const uploadRef = ref();
const avatarInputRef = ref<HTMLInputElement>();

// 修复头像点击 - 手动触发文件选择
const handleAvatarClick = () => {
  avatarInputRef.value?.click();
};

const handleFileChange = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  const isJPGOrPNG = file.type === "image/jpeg" || file.type === "image/png";
  const isLt2M = file.size / 1024 / 1024 < 2;

  if (!isJPGOrPNG) {
    ElMessage.error("头像图片只能是 JPG 或 PNG 格式!");
    return;
  }
  if (!isLt2M) {
    ElMessage.error("头像图片大小不能超过 2MB!");
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    imageUrl.value = reader.result as string;
    dialogVisible.value = true;
  };
  reader.readAsDataURL(file);
};

const saveAvatar = () => {
  userStore.SET_AVATAR(imageUrl.value);
  const userInfo = storageLocal().getItem(userKey);
  storageLocal().setItem(userKey, { ...userInfo, avatar: imageUrl.value });
  ElMessage.success("头像更新成功！");
  dialogVisible.value = false;
};

// 昵称编辑相关
const nicknameFormRef = ref<FormInstance>();
const nicknameForm = reactive({
  nickname: userStore.nickname || ""
});

const saveNickname = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  await formEl.validate(valid => {
    if (valid) {
      loading.value = true;
      setTimeout(() => {
        userStore.SET_NICKNAME(nicknameForm.nickname);
        const userInfo = storageLocal().getItem(userKey);
        storageLocal().setItem(userKey, {
          ...userInfo,
          nickname: nicknameForm.nickname
        });
        ElMessage.success("昵称更新成功！");
        loading.value = false;
      }, 500);
    }
  });
};

// 手机绑定相关
const phoneFormRef = ref<FormInstance>();
const phoneForm = reactive({
  phone: userStore.phone || "",
  code: ""
});

const sendCode = () => {
  if (!phoneForm.phone) {
    ElMessage.warning("请先输入手机号");
    return;
  }
  ElMessage.success("验证码已发送到您的手机");
};

const bindPhone = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  await formEl.validate(valid => {
    if (valid) {
      loading.value = true;
      setTimeout(() => {
        userStore.SET_PHONE(phoneForm.phone);
        const userInfo = storageLocal().getItem(userKey);
        storageLocal().setItem(userKey, {
          ...userInfo,
          phone: phoneForm.phone
        });
        ElMessage.success("手机号绑定成功！");
        loading.value = false;
      }, 500);
    }
  });
};

// 邮箱绑定相关
const emailFormRef = ref<FormInstance>();
const emailForm = reactive({
  email: userStore.email || "",
  code: ""
});

const sendEmailCode = () => {
  if (!emailForm.email) {
    ElMessage.warning("请先输入邮箱");
    return;
  }
  ElMessage.success("验证码已发送到您的邮箱");
};

const bindEmail = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  await formEl.validate(valid => {
    if (valid) {
      loading.value = true;
      setTimeout(() => {
        userStore.SET_EMAIL(emailForm.email);
        const userInfo = storageLocal().getItem(userKey);
        storageLocal().setItem(userKey, {
          ...userInfo,
          email: emailForm.email
        });
        ElMessage.success("邮箱绑定成功！");
        loading.value = false;
      }, 500);
    }
  });
};

// 密码修改相关
const passwordFormRef = ref<FormInstance>();
const passwordForm = reactive({
  oldPassword: "",
  newPassword: "",
  confirmPassword: ""
});

const modifyPassword = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  await formEl.validate(valid => {
    if (valid) {
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        ElMessage.error("两次输入的新密码不一致");
        return;
      }
      loading.value = true;
      setTimeout(() => {
        ElMessage.success("密码修改成功！");
        passwordForm.oldPassword = "";
        passwordForm.newPassword = "";
        passwordForm.confirmPassword = "";
        loading.value = false;
      }, 500);
    }
  });
};

// 计算属性
const displayPhone = computed(() => {
  if (!userStore.phone) return "未绑定";
  const phone = userStore.phone;
  return phone.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2");
});

const displayEmail = computed(() => {
  if (!userStore.email) return "未绑定";
  const email = userStore.email;
  const [name, domain] = email.split("@");
  if (name.length <= 2) return email;
  return `${name.slice(0, 2)}****@${domain}`;
});
</script>

<template>
  <div
    class="profile-container min-h-[calc(100vh-100px)] flex justify-center py-8"
  >
    <div class="w-full max-w-3xl">
      <el-card shadow="hover" class="overflow-hidden">
        <el-tabs v-model="activeTab" class="profile-tabs">
          <!-- 个人信息 -->
          <el-tab-pane label="个人信息" name="info">
            <div class="py-10 px-8">
              <!-- 头像 -->
              <div class="flex flex-col items-center mb-10">
                <div
                  class="relative group cursor-pointer"
                  @click="handleAvatarClick"
                >
                  <el-avatar
                    :src="
                      imageUrl ||
                      'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
                    "
                    :size="120"
                    class="border-4 border-white shadow-lg"
                  />
                  <div
                    class="absolute inset-0 rounded-full bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center"
                  >
                    <el-icon
                      class="text-white text-2xl opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Camera />
                    </el-icon>
                  </div>
                  <input
                    ref="avatarInputRef"
                    type="file"
                    accept="image/*"
                    class="hidden"
                    @change="handleFileChange"
                  />
                </div>
                <p
                  class="text-center text-gray-500 mt-3 text-sm cursor-pointer hover:text-primary"
                  @click="handleAvatarClick"
                >
                  点击更换头像
                </p>
              </div>

              <!-- 用户名/昵称 - 统一卡片布局 -->
              <div class="max-w-md mx-auto space-y-6">
                <!-- 用户名 -->
                <div class="bg-gray-50 rounded-xl p-5">
                  <div class="flex items-center justify-between">
                    <span class="text-gray-600 text-base">用户名</span>
                    <span class="font-medium text-gray-800">{{
                      userStore.username || "-"
                    }}</span>
                  </div>
                </div>

                <!-- 昵称 -->
                <div class="bg-gray-50 rounded-xl p-5">
                  <el-form
                    ref="nicknameFormRef"
                    :model="nicknameForm"
                    :rules="nicknameRules"
                    class="mb-0"
                  >
                    <el-form-item label="昵称" prop="nickname" class="mb-0">
                      <div class="flex items-center justify-between gap-4">
                        <span class="text-gray-600 text-base w-16 flex-shrink-0"
                          >昵称</span
                        >
                        <div class="flex-1 flex gap-3">
                          <el-input
                            v-model="nicknameForm.nickname"
                            placeholder="请输入昵称"
                            class="flex-1"
                          />
                          <el-button
                            type="primary"
                            :loading="loading"
                            @click="saveNickname(nicknameFormRef)"
                          >
                            保存
                          </el-button>
                        </div>
                      </div>
                    </el-form-item>
                  </el-form>
                </div>
              </div>
            </div>
          </el-tab-pane>

          <!-- 账号绑定 -->
          <el-tab-pane label="账号绑定" name="bind">
            <div class="py-10 px-8">
              <div class="max-w-2xl mx-auto space-y-8">
                <!-- 手机绑定 -->
                <div
                  class="border border-gray-200 rounded-xl p-6 hover:border-primary/30 transition-colors"
                >
                  <div class="flex items-center justify-between mb-5">
                    <div class="flex items-center gap-3">
                      <div
                        class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"
                      >
                        <el-icon class="text-xl text-primary"
                          ><Phone
                        /></el-icon>
                      </div>
                      <span class="text-lg font-medium text-gray-800"
                        >绑定手机</span
                      >
                    </div>
                    <el-tag
                      :type="userStore.phone ? 'success' : 'warning'"
                      class="px-3 py-1"
                    >
                      {{ userStore.phone ? "已绑定" : "未绑定" }}
                    </el-tag>
                  </div>
                  <p class="text-gray-500 text-sm mb-5 pl-13">
                    当前绑定手机号：<span class="font-medium text-gray-700">{{
                      displayPhone
                    }}</span>
                  </p>
                  <el-form
                    ref="phoneFormRef"
                    :model="phoneForm"
                    :rules="phoneRules"
                    class="pl-13"
                  >
                    <el-form-item prop="phone" class="mb-4">
                      <el-input
                        v-model="phoneForm.phone"
                        placeholder="请输入手机号"
                        :disabled="!!userStore.phone"
                        size="large"
                      >
                        <template #prefix>
                          <el-icon class="text-gray-400"><Phone /></el-icon>
                        </template>
                      </el-input>
                    </el-form-item>
                    <el-form-item
                      v-if="!userStore.phone"
                      prop="code"
                      class="mb-4"
                    >
                      <div class="flex gap-3">
                        <el-input
                          v-model="phoneForm.code"
                          placeholder="请输入验证码"
                          class="flex-1"
                          size="large"
                        >
                          <template #prefix>
                            <el-icon class="text-gray-400"><Key /></el-icon>
                          </template>
                        </el-input>
                        <el-button size="large" @click="sendCode"
                          >获取验证码</el-button
                        >
                      </div>
                    </el-form-item>
                    <el-form-item v-if="!userStore.phone" class="mb-0">
                      <el-button
                        type="primary"
                        class="w-full"
                        size="large"
                        :loading="loading"
                        @click="bindPhone(phoneFormRef)"
                      >
                        绑定手机号
                      </el-button>
                    </el-form-item>
                  </el-form>
                </div>

                <!-- 邮箱绑定 -->
                <div
                  class="border border-gray-200 rounded-xl p-6 hover:border-primary/30 transition-colors"
                >
                  <div class="flex items-center justify-between mb-5">
                    <div class="flex items-center gap-3">
                      <div
                        class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"
                      >
                        <el-icon class="text-xl text-primary"
                          ><Message
                        /></el-icon>
                      </div>
                      <span class="text-lg font-medium text-gray-800"
                        >绑定邮箱</span
                      >
                    </div>
                    <el-tag
                      :type="userStore.email ? 'success' : 'warning'"
                      class="px-3 py-1"
                    >
                      {{ userStore.email ? "已绑定" : "未绑定" }}
                    </el-tag>
                  </div>
                  <p class="text-gray-500 text-sm mb-5 pl-13">
                    当前绑定邮箱：<span class="font-medium text-gray-700">{{
                      displayEmail
                    }}</span>
                  </p>
                  <el-form
                    ref="emailFormRef"
                    :model="emailForm"
                    :rules="emailRules"
                    class="pl-13"
                  >
                    <el-form-item prop="email" class="mb-4">
                      <el-input
                        v-model="emailForm.email"
                        placeholder="请输入邮箱"
                        :disabled="!!userStore.email"
                        size="large"
                      >
                        <template #prefix>
                          <el-icon class="text-gray-400"><Message /></el-icon>
                        </template>
                      </el-input>
                    </el-form-item>
                    <el-form-item
                      v-if="!userStore.email"
                      prop="code"
                      class="mb-4"
                    >
                      <div class="flex gap-3">
                        <el-input
                          v-model="emailForm.code"
                          placeholder="请输入验证码"
                          class="flex-1"
                          size="large"
                        >
                          <template #prefix>
                            <el-icon class="text-gray-400"><Key /></el-icon>
                          </template>
                        </el-input>
                        <el-button size="large" @click="sendEmailCode"
                          >获取验证码</el-button
                        >
                      </div>
                    </el-form-item>
                    <el-form-item v-if="!userStore.email" class="mb-0">
                      <el-button
                        type="primary"
                        class="w-full"
                        size="large"
                        :loading="loading"
                        @click="bindEmail(emailFormRef)"
                      >
                        绑定邮箱
                      </el-button>
                    </el-form-item>
                  </el-form>
                </div>
              </div>
            </div>
          </el-tab-pane>

          <!-- 修改密码 -->
          <el-tab-pane label="修改密码" name="password">
            <div class="py-10 px-8">
              <div class="max-w-md mx-auto">
                <div class="text-center mb-8">
                  <div
                    class="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4"
                  >
                    <el-icon class="text-3xl text-primary"><Lock /></el-icon>
                  </div>
                  <p class="text-gray-500">
                    为了您的账号安全，修改密码前需要验证原密码
                  </p>
                </div>
                <el-form
                  ref="passwordFormRef"
                  :model="passwordForm"
                  :rules="passwordRules"
                  label-position="top"
                >
                  <el-form-item label="原密码" prop="oldPassword" class="mb-5">
                    <el-input
                      v-model="passwordForm.oldPassword"
                      type="password"
                      show-password
                      placeholder="请输入原密码"
                      size="large"
                    >
                      <template #prefix>
                        <el-icon class="text-gray-400"><Lock /></el-icon>
                      </template>
                    </el-input>
                  </el-form-item>
                  <el-form-item label="新密码" prop="newPassword" class="mb-5">
                    <el-input
                      v-model="passwordForm.newPassword"
                      type="password"
                      show-password
                      placeholder="请输入新密码"
                      size="large"
                    >
                      <template #prefix>
                        <el-icon class="text-gray-400"><Lock /></el-icon>
                      </template>
                    </el-input>
                  </el-form-item>
                  <el-form-item
                    label="确认新密码"
                    prop="confirmPassword"
                    class="mb-6"
                  >
                    <el-input
                      v-model="passwordForm.confirmPassword"
                      type="password"
                      show-password
                      placeholder="请再次输入新密码"
                      size="large"
                    >
                      <template #prefix>
                        <el-icon class="text-gray-400"><Lock /></el-icon>
                      </template>
                    </el-input>
                  </el-form-item>
                  <el-form-item class="mb-0">
                    <el-button
                      type="primary"
                      class="w-full"
                      size="large"
                      :loading="loading"
                      @click="modifyPassword(passwordFormRef)"
                    >
                      确认修改
                    </el-button>
                  </el-form-item>
                </el-form>
                <div class="mt-6 p-4 bg-blue-50 rounded-lg">
                  <p class="text-sm text-blue-600 flex items-center">
                    <el-icon class="mr-2"><InfoFilled /></el-icon>
                    密码格式应为8-18位数字、字母、符号的任意两种组合
                  </p>
                </div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </el-card>
    </div>
  </div>

  <!-- 头像预览弹窗 -->
  <el-dialog
    v-model="dialogVisible"
    title="预览头像"
    width="420px"
    :close-on-click-modal="false"
  >
    <div class="flex justify-center py-4">
      <el-avatar :src="imageUrl" :size="200" fit="cover" />
    </div>
    <template #footer>
      <div class="flex justify-end gap-3">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveAvatar">保存</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
.profile-container {
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);

  :deep(.el-card) {
    border: none;
    border-radius: 16px;
  }

  :deep(.el-tabs__nav-wrap) {
    padding: 0 32px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

    &::after {
      display: none;
    }
  }

  :deep(.el-tabs__item) {
    height: 64px;
    padding: 0 32px;
    font-size: 16px;
    font-weight: 500;
    line-height: 64px;
    color: rgb(255 255 255 / 85%);

    &.is-active {
      color: #fff;
    }
  }

  :deep(.el-tabs__active-bar) {
    height: 3px;
    background: #fff;
    border-radius: 2px;
  }

  :deep(.el-form-item) {
    margin-bottom: 20px;
  }

  :deep(.el-form-item__label) {
    font-weight: 500;
    color: #606266;
  }

  .pl-13 {
    padding-left: 52px;
  }
}
</style>
