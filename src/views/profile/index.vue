<script setup lang="ts">
import { ref, reactive, computed } from "vue";
import { message } from "@/utils/message";
import { useUserStoreHook } from "@/store/modules/user";
import { storageLocal } from "@pureadmin/utils";
import type { FormInstance, FormRules, UploadProps } from "element-plus";
import { userKey, type DataInfo } from "@/utils/auth";

defineOptions({
  name: "ProfileIndex"
});

const userStore = useUserStoreHook();

const userPhone = ref(
  storageLocal().getItem<DataInfo<number>>(userKey)?.phone || ""
);
const userEmail = ref(
  storageLocal().getItem<DataInfo<number>>(userKey)?.email || ""
);

const userInfo = computed(() => ({
  avatar:
    userStore.avatar ||
    "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png",
  username: userStore.username || "admin",
  nickname: userStore.nickname || "管理员",
  phone: userPhone.value,
  email: userEmail.value
}));

const avatarDialogVisible = ref(false);
const nicknameDialogVisible = ref(false);
const phoneDialogVisible = ref(false);
const emailDialogVisible = ref(false);
const passwordDialogVisible = ref(false);

const avatarFormRef = ref<FormInstance>();
const nicknameFormRef = ref<FormInstance>();
const phoneFormRef = ref<FormInstance>();
const emailFormRef = ref<FormInstance>();
const passwordFormRef = ref<FormInstance>();

const avatarForm = reactive({
  avatar: userInfo.value.avatar
});

const nicknameForm = reactive({
  nickname: userInfo.value.nickname
});

const phoneForm = reactive({
  phone: userInfo.value.phone,
  code: ""
});

const emailForm = reactive({
  email: userInfo.value.email,
  code: ""
});

const passwordForm = reactive({
  oldPassword: "",
  newPassword: "",
  confirmPassword: ""
});

const REGEXP_PWD =
  /^(?![0-9]+$)(?![a-z]+$)(?![A-Z]+$)(?!([^(0-9a-zA-Z)]|[()])+$)(?!^.*[\u4E00-\u9FA5].*$)([^(0-9a-zA-Z)]|[()]|[a-z]|[A-Z]|[0-9]){8,18}$/;
const REGEXP_PHONE = /^1[3-9]\d{9}$/;
const REGEXP_EMAIL = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const nicknameRules = reactive<FormRules>({
  nickname: [
    { required: true, message: "请输入昵称", trigger: "blur" },
    { min: 2, max: 20, message: "昵称长度在2到20个字符", trigger: "blur" }
  ]
});

const phoneRules = reactive<FormRules>({
  phone: [
    { required: true, message: "请输入手机号", trigger: "blur" },
    { pattern: REGEXP_PHONE, message: "请输入正确的手机号", trigger: "blur" }
  ],
  code: [
    { required: true, message: "请输入验证码", trigger: "blur" },
    { len: 6, message: "验证码为6位数字", trigger: "blur" }
  ]
});

const emailRules = reactive<FormRules>({
  email: [
    { required: true, message: "请输入邮箱", trigger: "blur" },
    { pattern: REGEXP_EMAIL, message: "请输入正确的邮箱地址", trigger: "blur" }
  ],
  code: [
    { required: true, message: "请输入验证码", trigger: "blur" },
    { len: 6, message: "验证码为6位数字", trigger: "blur" }
  ]
});

const passwordRules = reactive<FormRules>({
  oldPassword: [{ required: true, message: "请输入原密码", trigger: "blur" }],
  newPassword: [
    { required: true, message: "请输入新密码", trigger: "blur" },
    {
      pattern: REGEXP_PWD,
      message: "密码格式应为8-18位数字、字母、符号的任意两种组合",
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
});

const countdown = ref(0);
const countdownTimer = ref<NodeJS.Timeout | null>(null);

const startCountdown = () => {
  if (countdown.value > 0) return;
  countdown.value = 60;
  countdownTimer.value = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      clearInterval(countdownTimer.value!);
      countdownTimer.value = null;
    }
  }, 1000);
};

const sendPhoneCode = () => {
  phoneFormRef.value?.validateField("phone", valid => {
    if (valid) {
      message("验证码已发送，请查收", { type: "success" });
      startCountdown();
    }
  });
};

const sendEmailCode = () => {
  emailFormRef.value?.validateField("email", valid => {
    if (valid) {
      message("验证码已发送，请查收", { type: "success" });
      startCountdown();
    }
  });
};

const handleAvatarChange: UploadProps["onChange"] = uploadFile => {
  const file = uploadFile.raw;
  if (file) {
    const reader = new FileReader();
    reader.onload = e => {
      avatarForm.avatar = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
};

const updateAvatar = () => {
  userStore.SET_AVATAR(avatarForm.avatar);
  const storedInfo = storageLocal().getItem<DataInfo<number>>(userKey) || {};
  storageLocal().setItem(userKey, {
    ...storedInfo,
    avatar: avatarForm.avatar
  });
  avatarDialogVisible.value = false;
  message("头像修改成功", { type: "success" });
};

const updateNickname = async () => {
  if (!nicknameFormRef.value) return;
  await nicknameFormRef.value.validate(valid => {
    if (valid) {
      userStore.SET_NICKNAME(nicknameForm.nickname);
      const storedInfo =
        storageLocal().getItem<DataInfo<number>>(userKey) || {};
      storageLocal().setItem(userKey, {
        ...storedInfo,
        nickname: nicknameForm.nickname
      });
      nicknameDialogVisible.value = false;
      message("昵称修改成功", { type: "success" });
    }
  });
};

const updatePhone = async () => {
  if (!phoneFormRef.value) return;
  await phoneFormRef.value.validate(valid => {
    if (valid) {
      const storedInfo =
        storageLocal().getItem<DataInfo<number>>(userKey) || {};
      storageLocal().setItem(userKey, {
        ...storedInfo,
        phone: phoneForm.phone
      });
      userPhone.value = phoneForm.phone;
      phoneDialogVisible.value = false;
      message("手机号绑定成功", { type: "success" });
    }
  });
};

const updateEmail = async () => {
  if (!emailFormRef.value) return;
  await emailFormRef.value.validate(valid => {
    if (valid) {
      const storedInfo =
        storageLocal().getItem<DataInfo<number>>(userKey) || {};
      storageLocal().setItem(userKey, {
        ...storedInfo,
        email: emailForm.email
      });
      userEmail.value = emailForm.email;
      emailDialogVisible.value = false;
      message("邮箱绑定成功", { type: "success" });
    }
  });
};

const updatePassword = async () => {
  if (!passwordFormRef.value) return;
  await passwordFormRef.value.validate(valid => {
    if (valid) {
      passwordDialogVisible.value = false;
      message("密码修改成功", { type: "success" });
      passwordForm.oldPassword = "";
      passwordForm.newPassword = "";
      passwordForm.confirmPassword = "";
    }
  });
};

const resetPhoneForm = () => {
  phoneForm.phone = userInfo.value.phone;
  phoneForm.code = "";
  phoneFormRef.value?.clearValidate();
};

const resetEmailForm = () => {
  emailForm.email = userInfo.value.email;
  emailForm.code = "";
  emailFormRef.value?.clearValidate();
};

const resetPasswordForm = () => {
  passwordForm.oldPassword = "";
  passwordForm.newPassword = "";
  passwordForm.confirmPassword = "";
  passwordFormRef.value?.clearValidate();
};
</script>

<template>
  <div class="profile-container">
    <el-card class="profile-card">
      <template #header>
        <div class="card-header">
          <span class="title">个人中心</span>
        </div>
      </template>

      <div class="profile-content">
        <div class="avatar-section">
          <el-avatar :size="120" :src="userInfo.avatar" />
          <el-button type="primary" link @click="avatarDialogVisible = true">
            修改头像
          </el-button>
        </div>

        <el-divider />

        <div class="info-section">
          <div class="info-item">
            <div class="info-label">用户名</div>
            <div class="info-value">{{ userInfo.username }}</div>
          </div>

          <div class="info-item">
            <div class="info-label">昵称</div>
            <div class="info-value">
              <span>{{ userInfo.nickname || "未设置" }}</span>
              <el-button
                type="primary"
                link
                @click="nicknameDialogVisible = true"
              >
                修改
              </el-button>
            </div>
          </div>

          <div class="info-item">
            <div class="info-label">手机号</div>
            <div class="info-value">
              <span>{{ userInfo.phone || "未绑定" }}</span>
              <el-button type="primary" link @click="phoneDialogVisible = true">
                {{ userInfo.phone ? "修改" : "绑定" }}
              </el-button>
            </div>
          </div>

          <div class="info-item">
            <div class="info-label">邮箱</div>
            <div class="info-value">
              <span>{{ userInfo.email || "未绑定" }}</span>
              <el-button type="primary" link @click="emailDialogVisible = true">
                {{ userInfo.email ? "修改" : "绑定" }}
              </el-button>
            </div>
          </div>

          <div class="info-item">
            <div class="info-label">密码</div>
            <div class="info-value">
              <span>******</span>
              <el-button
                type="primary"
                link
                @click="passwordDialogVisible = true"
              >
                修改
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <el-dialog
      v-model="avatarDialogVisible"
      title="修改头像"
      width="400px"
      center
    >
      <div class="avatar-dialog-content">
        <el-avatar :size="150" :src="avatarForm.avatar" />
        <el-upload
          class="avatar-uploader"
          :show-file-list="false"
          :before-upload="() => false"
          :on-change="handleAvatarChange"
          accept="image/*"
        >
          <el-button type="primary">选择图片</el-button>
        </el-upload>
      </div>
      <template #footer>
        <el-button @click="avatarDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="updateAvatar">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="nicknameDialogVisible"
      title="修改昵称"
      width="400px"
      center
    >
      <el-form
        ref="nicknameFormRef"
        :model="nicknameForm"
        :rules="nicknameRules"
        label-width="80px"
      >
        <el-form-item label="昵称" prop="nickname">
          <el-input
            v-model="nicknameForm.nickname"
            placeholder="请输入昵称"
            maxlength="20"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="nicknameDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="updateNickname">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="phoneDialogVisible"
      title="绑定手机号"
      width="400px"
      center
      @close="resetPhoneForm"
    >
      <el-form
        ref="phoneFormRef"
        :model="phoneForm"
        :rules="phoneRules"
        label-width="80px"
      >
        <el-form-item label="手机号" prop="phone">
          <el-input
            v-model="phoneForm.phone"
            placeholder="请输入手机号"
            maxlength="11"
          />
        </el-form-item>
        <el-form-item label="验证码" prop="code">
          <div class="code-input">
            <el-input
              v-model="phoneForm.code"
              placeholder="请输入验证码"
              maxlength="6"
            />
            <el-button
              type="primary"
              :disabled="countdown > 0"
              @click="sendPhoneCode"
            >
              {{ countdown > 0 ? `${countdown}秒后重试` : "获取验证码" }}
            </el-button>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="phoneDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="updatePhone">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="emailDialogVisible"
      title="绑定邮箱"
      width="400px"
      center
      @close="resetEmailForm"
    >
      <el-form
        ref="emailFormRef"
        :model="emailForm"
        :rules="emailRules"
        label-width="80px"
      >
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="emailForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="验证码" prop="code">
          <div class="code-input">
            <el-input
              v-model="emailForm.code"
              placeholder="请输入验证码"
              maxlength="6"
            />
            <el-button
              type="primary"
              :disabled="countdown > 0"
              @click="sendEmailCode"
            >
              {{ countdown > 0 ? `${countdown}秒后重试` : "获取验证码" }}
            </el-button>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="emailDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="updateEmail">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="passwordDialogVisible"
      title="修改密码"
      width="400px"
      center
      @close="resetPasswordForm"
    >
      <el-form
        ref="passwordFormRef"
        :model="passwordForm"
        :rules="passwordRules"
        label-width="80px"
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
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="passwordForm.confirmPassword"
            type="password"
            placeholder="请确认新密码"
            show-password
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="passwordDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="updatePassword">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.profile-container {
  display: flex;
  justify-content: center;
  min-height: calc(100vh - 200px);
  padding: 20px;
}

.profile-card {
  width: 100%;
  max-width: 800px;

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .title {
      font-size: 18px;
      font-weight: 600;
    }
  }
}

.profile-content {
  padding: 20px 40px;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
  padding: 20px 0;
}

.info-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.info-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid var(--el-border-color-lighter);

  &:last-child {
    border-bottom: none;
  }

  .info-label {
    width: 100px;
    font-weight: 500;
    color: var(--el-text-color-regular);
  }

  .info-value {
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: space-between;

    span {
      color: var(--el-text-color-primary);
    }
  }
}

.avatar-dialog-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
}

.code-input {
  display: flex;
  gap: 12px;
  width: 100%;

  .el-input {
    flex: 1;
  }
}

:deep(.el-dialog__body) {
  padding: 20px 30px;
}

:deep(.el-divider) {
  margin: 20px 0;
}
</style>
