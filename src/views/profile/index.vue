<script setup lang="ts">
import { ref, reactive, computed } from "vue";
import {
  ElMessage,
  ElMessageBox,
  type FormInstance,
  type FormRules,
  type UploadRawFile
} from "element-plus";
import { User, Camera, Iphone, Message } from "@element-plus/icons-vue";
import { useUserStoreHook } from "@/store/modules/user";
import { storageLocal } from "@pureadmin/utils";
import { userKey, type DataInfo } from "@/utils/auth";

defineOptions({
  name: "ProfileIndex"
});

const userStore = useUserStoreHook();
const activeTab = ref("info");

// 用户信息
const userInfo = reactive({
  avatar: userStore.avatar || "",
  username: userStore.username || "",
  nickname: userStore.nickname || "",
  phone: "138****8888",
  email: "example@email.com",
  isPhoneBound: true,
  isEmailBound: true
});

// 表单引用
const infoFormRef = ref<FormInstance>();
const phoneFormRef = ref<FormInstance>();
const emailFormRef = ref<FormInstance>();
const passwordFormRef = ref<FormInstance>();

// 昵称表单
const infoForm = reactive({
  nickname: userInfo.nickname,
  username: userInfo.username
});

// 手机绑定表单
const phoneForm = reactive({
  phone: "",
  code: ""
});

// 邮箱绑定表单
const emailForm = reactive({
  email: "",
  code: ""
});

// 密码修改表单
const passwordForm = reactive({
  oldPassword: "",
  newPassword: "",
  confirmPassword: ""
});

// 验证码倒计时
const phoneCountdown = ref(0);
const emailCountdown = ref(0);
const phoneTimer = ref<NodeJS.Timeout | null>(null);
const emailTimer = ref<NodeJS.Timeout | null>(null);

// 校验规则
const infoRules: FormRules = {
  nickname: [
    { required: true, message: "请输入昵称", trigger: "blur" },
    { min: 2, max: 20, message: "昵称长度在 2 到 20 个字符", trigger: "blur" }
  ]
};

const phoneRules: FormRules = {
  phone: [
    { required: true, message: "请输入手机号", trigger: "blur" },
    { pattern: /^1[3-9]\d{9}$/, message: "请输入正确的手机号", trigger: "blur" }
  ],
  code: [
    { required: true, message: "请输入验证码", trigger: "blur" },
    { pattern: /^\d{6}$/, message: "验证码为6位数字", trigger: "blur" }
  ]
};

const emailRules: FormRules = {
  email: [
    { required: true, message: "请输入邮箱", trigger: "blur" },
    { type: "email", message: "请输入正确的邮箱地址", trigger: "blur" }
  ],
  code: [
    { required: true, message: "请输入验证码", trigger: "blur" },
    { pattern: /^\d{6}$/, message: "验证码为6位数字", trigger: "blur" }
  ]
};

const passwordRules: FormRules = {
  oldPassword: [
    { required: true, message: "请输入原密码", trigger: "blur" },
    { min: 6, max: 20, message: "密码长度在 6 到 20 个字符", trigger: "blur" }
  ],
  newPassword: [
    { required: true, message: "请输入新密码", trigger: "blur" },
    { min: 6, max: 20, message: "密码长度在 6 到 20 个字符", trigger: "blur" },
    {
      validator: (rule, value, callback) => {
        if (value === passwordForm.oldPassword) {
          callback(new Error("新密码不能与原密码相同"));
        } else {
          callback();
        }
      },
      trigger: "blur"
    }
  ],
  confirmPassword: [
    { required: true, message: "请确认新密码", trigger: "blur" },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error("两次输入的密码不一致"));
        } else {
          callback();
        }
      },
      trigger: "blur"
    }
  ]
};

// 计算属性
const canSendPhoneCode = computed(
  () => phoneCountdown.value === 0 && phoneForm.phone
);
const canSendEmailCode = computed(
  () => emailCountdown.value === 0 && emailForm.email
);
const phoneCodeText = computed(() =>
  phoneCountdown.value > 0 ? `${phoneCountdown.value}s后重试` : "获取验证码"
);
const emailCodeText = computed(() =>
  emailCountdown.value > 0 ? `${emailCountdown.value}s后重试` : "获取验证码"
);

// 头像上传前校验
const beforeAvatarUpload = (rawFile: UploadRawFile) => {
  const isJPG = rawFile.type === "image/jpeg";
  const isPNG = rawFile.type === "image/png";
  const isLt2M = rawFile.size / 1024 / 1024 < 2;

  if (!isJPG && !isPNG) {
    ElMessage.error("头像只能是 JPG 或 PNG 格式!");
    return false;
  }
  if (!isLt2M) {
    ElMessage.error("头像大小不能超过 2MB!");
    return false;
  }
  return true;
};

// 头像上传成功
const handleAvatarChange = (uploadFile: { raw?: UploadRawFile }) => {
  // 模拟上传成功，使用本地预览
  const rawFile = uploadFile.raw;
  if (!rawFile) return;
  const reader = new FileReader();
  reader.onload = e => {
    const result = e.target?.result as string;
    userInfo.avatar = result;
    userStore.SET_AVATAR(result);

    // 更新本地存储
    const userData = storageLocal().getItem<DataInfo<number>>(userKey);
    if (userData) {
      userData.avatar = result;
      storageLocal().setItem(userKey, userData);
    }

    ElMessage.success("头像修改成功");
  };
  reader.readAsDataURL(rawFile);
};

// 保存昵称
const saveNickname = async () => {
  if (!infoFormRef.value) return;

  await infoFormRef.value.validate(valid => {
    if (valid) {
      userInfo.nickname = infoForm.nickname;
      userStore.SET_NICKNAME(infoForm.nickname);

      // 更新本地存储
      const userData = storageLocal().getItem<DataInfo<number>>(userKey);
      if (userData) {
        userData.nickname = infoForm.nickname;
        storageLocal().setItem(userKey, userData);
      }

      ElMessage.success("昵称修改成功");
    }
  });
};

// 发送手机验证码
const sendPhoneCode = () => {
  if (!phoneForm.phone) {
    ElMessage.warning("请先输入手机号");
    return;
  }

  const phoneRegex = /^1[3-9]\d{9}$/;
  if (!phoneRegex.test(phoneForm.phone)) {
    ElMessage.warning("请输入正确的手机号");
    return;
  }

  phoneCountdown.value = 60;
  phoneTimer.value = setInterval(() => {
    phoneCountdown.value--;
    if (phoneCountdown.value <= 0) {
      if (phoneTimer.value) {
        clearInterval(phoneTimer.value);
      }
    }
  }, 1000);

  ElMessage.success("验证码已发送");
};

// 发送邮箱验证码
const sendEmailCode = () => {
  if (!emailForm.email) {
    ElMessage.warning("请先输入邮箱");
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(emailForm.email)) {
    ElMessage.warning("请输入正确的邮箱地址");
    return;
  }

  emailCountdown.value = 60;
  emailTimer.value = setInterval(() => {
    emailCountdown.value--;
    if (emailCountdown.value <= 0) {
      if (emailTimer.value) {
        clearInterval(emailTimer.value);
      }
    }
  }, 1000);

  ElMessage.success("验证码已发送");
};

// 绑定手机
const bindPhone = async () => {
  if (!phoneFormRef.value) return;

  await phoneFormRef.value.validate(valid => {
    if (valid) {
      userInfo.phone = phoneForm.phone.replace(
        /(\d{3})\d{4}(\d{4})/,
        "$1****$2"
      );
      userInfo.isPhoneBound = true;
      phoneForm.phone = "";
      phoneForm.code = "";
      ElMessage.success("手机绑定成功");
    }
  });
};

// 绑定邮箱
const bindEmail = async () => {
  if (!emailFormRef.value) return;

  await emailFormRef.value.validate(valid => {
    if (valid) {
      userInfo.email = emailForm.email;
      userInfo.isEmailBound = true;
      emailForm.email = "";
      emailForm.code = "";
      ElMessage.success("邮箱绑定成功");
    }
  });
};

// 解绑手机
const unbindPhone = () => {
  ElMessageBox.confirm("确定要解绑手机吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    userInfo.isPhoneBound = false;
    userInfo.phone = "";
    ElMessage.success("手机解绑成功");
  });
};

// 解绑邮箱
const unbindEmail = () => {
  ElMessageBox.confirm("确定要解绑邮箱吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    userInfo.isEmailBound = false;
    userInfo.email = "";
    ElMessage.success("邮箱解绑成功");
  });
};

// 修改密码
const changePassword = async () => {
  if (!passwordFormRef.value) return;

  await passwordFormRef.value.validate(valid => {
    if (valid) {
      passwordForm.oldPassword = "";
      passwordForm.newPassword = "";
      passwordForm.confirmPassword = "";
      ElMessage.success("密码修改成功");
    }
  });
};
</script>

<template>
  <div class="profile-container">
    <el-card class="profile-card">
      <el-tabs v-model="activeTab" type="border-card">
        <!-- 个人信息 -->
        <el-tab-pane label="个人信息" name="info">
          <div class="tab-content">
            <div class="avatar-section">
              <el-avatar :size="120" :src="userInfo.avatar" class="avatar">
                <el-icon :size="60"><User /></el-icon>
              </el-avatar>
              <el-upload
                class="avatar-uploader"
                action="#"
                :show-file-list="false"
                :before-upload="beforeAvatarUpload"
                :on-change="handleAvatarChange"
                :auto-upload="false"
              >
                <el-button
                  type="primary"
                  :icon="Camera"
                  class="change-avatar-btn"
                >
                  修改头像
                </el-button>
              </el-upload>
            </div>

            <el-form
              ref="infoFormRef"
              :model="infoForm"
              :rules="infoRules"
              label-width="100px"
              class="info-form"
            >
              <el-form-item label="用户名">
                <el-input v-model="infoForm.username" disabled />
              </el-form-item>

              <el-form-item label="昵称" prop="nickname">
                <el-input
                  v-model="infoForm.nickname"
                  placeholder="请输入昵称"
                  maxlength="20"
                  show-word-limit
                />
              </el-form-item>

              <el-form-item>
                <el-button type="primary" @click="saveNickname">
                  保存修改
                </el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>

        <!-- 账号绑定 -->
        <el-tab-pane label="账号绑定" name="bind">
          <div class="tab-content">
            <!-- 手机绑定 -->
            <div class="bind-section">
              <div class="bind-header">
                <div class="bind-title">
                  <el-icon :size="20"><Iphone /></el-icon>
                  <span>手机绑定</span>
                </div>
                <el-tag :type="userInfo.isPhoneBound ? 'success' : 'info'">
                  {{ userInfo.isPhoneBound ? "已绑定" : "未绑定" }}
                </el-tag>
              </div>

              <div v-if="userInfo.isPhoneBound" class="bind-info">
                <span class="bind-value">{{ userInfo.phone }}</span>
                <el-button type="danger" link @click="unbindPhone"
                  >解绑</el-button
                >
              </div>

              <el-form
                v-else
                ref="phoneFormRef"
                :model="phoneForm"
                :rules="phoneRules"
                label-width="100px"
                class="bind-form"
              >
                <el-form-item label="手机号" prop="phone">
                  <el-input
                    v-model="phoneForm.phone"
                    placeholder="请输入手机号"
                    maxlength="11"
                  />
                </el-form-item>

                <el-form-item label="验证码" prop="code">
                  <div class="code-input-group">
                    <el-input
                      v-model="phoneForm.code"
                      placeholder="请输入验证码"
                      maxlength="6"
                    />
                    <el-button
                      :disabled="!canSendPhoneCode"
                      class="code-btn"
                      @click="sendPhoneCode"
                    >
                      {{ phoneCodeText }}
                    </el-button>
                  </div>
                </el-form-item>

                <el-form-item>
                  <el-button type="primary" @click="bindPhone"
                    >绑定手机</el-button
                  >
                </el-form-item>
              </el-form>
            </div>

            <el-divider />

            <!-- 邮箱绑定 -->
            <div class="bind-section">
              <div class="bind-header">
                <div class="bind-title">
                  <el-icon :size="20"><Message /></el-icon>
                  <span>邮箱绑定</span>
                </div>
                <el-tag :type="userInfo.isEmailBound ? 'success' : 'info'">
                  {{ userInfo.isEmailBound ? "已绑定" : "未绑定" }}
                </el-tag>
              </div>

              <div v-if="userInfo.isEmailBound" class="bind-info">
                <span class="bind-value">{{ userInfo.email }}</span>
                <el-button type="danger" link @click="unbindEmail"
                  >解绑</el-button
                >
              </div>

              <el-form
                v-else
                ref="emailFormRef"
                :model="emailForm"
                :rules="emailRules"
                label-width="100px"
                class="bind-form"
              >
                <el-form-item label="邮箱" prop="email">
                  <el-input
                    v-model="emailForm.email"
                    placeholder="请输入邮箱"
                  />
                </el-form-item>

                <el-form-item label="验证码" prop="code">
                  <div class="code-input-group">
                    <el-input
                      v-model="emailForm.code"
                      placeholder="请输入验证码"
                      maxlength="6"
                    />
                    <el-button
                      :disabled="!canSendEmailCode"
                      class="code-btn"
                      @click="sendEmailCode"
                    >
                      {{ emailCodeText }}
                    </el-button>
                  </div>
                </el-form-item>

                <el-form-item>
                  <el-button type="primary" @click="bindEmail"
                    >绑定邮箱</el-button
                  >
                </el-form-item>
              </el-form>
            </div>
          </div>
        </el-tab-pane>

        <!-- 修改密码 -->
        <el-tab-pane label="修改密码" name="password">
          <div class="tab-content">
            <el-form
              ref="passwordFormRef"
              :model="passwordForm"
              :rules="passwordRules"
              label-width="120px"
              class="password-form"
            >
              <el-form-item label="原密码" prop="oldPassword">
                <el-input
                  v-model="passwordForm.oldPassword"
                  type="password"
                  placeholder="请输入原密码"
                  show-password
                />
              </el-form-item>

              <el-form-item label="新密码" prop="newPassword">
                <el-input
                  v-model="passwordForm.newPassword"
                  type="password"
                  placeholder="请输入新密码"
                  show-password
                />
              </el-form-item>

              <el-form-item label="确认新密码" prop="confirmPassword">
                <el-input
                  v-model="passwordForm.confirmPassword"
                  type="password"
                  placeholder="请再次输入新密码"
                  show-password
                />
              </el-form-item>

              <el-form-item>
                <el-button type="primary" @click="changePassword"
                  >修改密码</el-button
                >
                <el-button @click="passwordFormRef?.resetFields()"
                  >重置</el-button
                >
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<style scoped>
.profile-container {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  min-height: calc(100vh - 200px);
  padding: 20px;
}

.profile-card {
  width: 100%;
  max-width: 800px;
}

.tab-content {
  padding: 30px 20px;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 40px;
}

.avatar {
  margin-bottom: 20px;
  border: 4px solid #f0f0f0;
}

.change-avatar-btn {
  margin-top: 10px;
}

.info-form,
.bind-form,
.password-form {
  max-width: 500px;
  margin: 0 auto;
}

.bind-section {
  margin-bottom: 20px;
}

.bind-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.bind-title {
  display: flex;
  gap: 10px;
  align-items: center;
  font-size: 16px;
  font-weight: 500;
}

.bind-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 8px;
}

.bind-value {
  font-size: 14px;
  color: #606266;
}

.code-input-group {
  display: flex;
  gap: 10px;
  width: 100%;
}

.code-btn {
  min-width: 120px;
  white-space: nowrap;
}

:deep(.el-tabs__header) {
  margin-bottom: 0;
}

:deep(.el-tabs__content) {
  padding: 0;
}

:deep(.el-tab-pane) {
  min-height: 400px;
}
</style>
