import { reactive } from "vue";
import type { FormRules } from "element-plus";

/** 手机号正则 */
export const REGEXP_PHONE = /^1[3-9]\d{9}$/;

/** 邮箱正则 */
export const REGEXP_EMAIL = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/** 密码正则（密码格式应为8-18位数字、字母、符号的任意两种组合） */
export const REGEXP_PWD =
  /^(?![0-9]+$)(?![a-z]+$)(?![A-Z]+$)(?!([^(0-9a-zA-Z)]|[()])+$)(?!^.*[\u4E00-\u9FA5].*$)([^(0-9a-zA-Z)]|[()]|[a-z]|[A-Z]|[0-9]){8,18}$/;

/** 昵称校验 */
const nicknameRules = reactive<FormRules>({
  nickname: [
    { required: true, message: "请输入昵称", trigger: "blur" },
    { min: 2, max: 20, message: "昵称长度应在2-20个字符之间", trigger: "blur" }
  ]
});

/** 手机校验 */
const phoneRules = reactive<FormRules>({
  phone: [
    { required: true, message: "请输入手机号", trigger: "blur" },
    {
      pattern: REGEXP_PHONE,
      message: "请输入正确的手机号格式",
      trigger: "blur"
    }
  ]
});

/** 邮箱校验 */
const emailRules = reactive<FormRules>({
  email: [
    { required: true, message: "请输入邮箱", trigger: "blur" },
    { pattern: REGEXP_EMAIL, message: "请输入正确的邮箱格式", trigger: "blur" }
  ]
});

/** 密码校验 */
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
      pattern: REGEXP_PWD,
      message: "密码格式应为8-18位数字、字母、符号的任意两种组合",
      trigger: "blur"
    }
  ]
});

export { nicknameRules, phoneRules, emailRules, passwordRules };
