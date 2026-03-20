<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import dayjs from "dayjs";
import { ElMessage, ElMessageBox } from "element-plus";
defineOptions({
  name: "UserIndex"
});
// 部门选项
const departmentOptions = [
  { label: "技术部", value: "技术部" },
  { label: "产品部", value: "产品部" },
  { label: "运营部", value: "运营部" },
  { label: "市场部", value: "市场部" },
  { label: "人事部", value: "人事部" },
  { label: "财务部", value: "财务部" }
];
// 性别选项
const genderOptions = [
  { label: "男", value: "男" },
  { label: "女", value: "女" },
  { label: "未知", value: "未知" }
];
// 用户数据类型
interface User {
  id: number;
  username: string;
  nickname: string;
  gender: string;
  department: string;
  phone: string;
  createTime: string;
}
// 生成模拟数据
const generateMockData = (count: number): User[] => {
  const mockUsers: User[] = [];
  const names = [
    "张三",
    "李四",
    "王五",
    "赵六",
    "钱七",
    "孙八",
    "周九",
    "吴十",
    "郑十一",
    "王小明",
    "李小红",
    "张小华",
    "刘晓强",
    "陈美丽",
    "杨建国",
    "赵海",
    "孙磊",
    "周婷",
    "吴涛",
    "郑洁"
  ];
  for (let i = 1; i <= count; i++) {
    const name = names[i % names.length];
    mockUsers.push({
      id: 10000 + i,
      username: `user${i}`,
      nickname: name,
      gender: genderOptions[Math.floor(Math.random() * 3)].value,
      department: departmentOptions[Math.floor(Math.random() * 6)].value,
      phone: `1${3 + Math.floor(Math.random() * 6)}${Math.floor(
        Math.random() * 100000000
      )
        .toString()
        .padStart(8, "0")}`,
      createTime: dayjs()
        .subtract(Math.floor(Math.random() * 365), "day")
        .format("YYYY-MM-DD HH:mm:ss")
    });
  }
  return mockUsers;
};
// 原始数据
const originalData = ref<User[]>(generateMockData(35));
// 搜索表单
const searchForm = reactive({
  username: "",
  phone: ""
});
// 过滤后的数据
const filteredData = computed(() => {
  let data = [...originalData.value];
  if (searchForm.username) {
    data = data.filter(item => item.nickname.includes(searchForm.username));
  }
  if (searchForm.phone) {
    data = data.filter(item => item.phone.includes(searchForm.phone));
  }
  return data;
});
// 分页相关
const currentPage = ref(1);
const pageSize = ref(10);
const total = computed(() => filteredData.value.length);
// 当前页数据
const tableData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredData.value.slice(start, end);
});
// 弹窗相关
const dialogVisible = ref(false);
const dialogTitle = ref("新增用户");
const isEdit = ref(false);
// 表单数据
const formData = reactive({
  id: 0,
  username: "",
  nickname: "",
  gender: "",
  department: "",
  phone: ""
});
// 表单验证规则
const rules = {
  username: [
    { required: true, message: "请输入用户名称", trigger: "blur" },
    { min: 2, max: 20, message: "用户名称长度在2-20个字符", trigger: "blur" }
  ],
  nickname: [
    { required: true, message: "请输入用户昵称", trigger: "blur" },
    { min: 2, max: 20, message: "用户昵称长度在2-20个字符", trigger: "blur" }
  ],
  gender: [{ required: true, message: "请选择性别", trigger: "change" }],
  department: [{ required: true, message: "请选择部门", trigger: "change" }],
  phone: [
    { required: true, message: "请输入手机号码", trigger: "blur" },
    {
      pattern: /^1[3-9]\d{9}$/,
      message: "请输入正确的手机号码格式",
      trigger: "blur"
    }
  ]
};
// 表单引用
const formRef = ref();
// 搜索
const handleSearch = () => {
  currentPage.value = 1;
  ElMessage.success("搜索成功");
};
// 重置
const handleReset = () => {
  searchForm.username = "";
  searchForm.phone = "";
  currentPage.value = 1;
  ElMessage.success("重置成功");
};
// 打开新增弹窗
const handleAdd = () => {
  dialogTitle.value = "新增用户";
  isEdit.value = false;
  formData.id = 0;
  formData.username = "";
  formData.nickname = "";
  formData.gender = "";
  formData.department = "";
  formData.phone = "";
  dialogVisible.value = true;
};
// 打开编辑弹窗
const handleEdit = (row: User) => {
  dialogTitle.value = "修改用户";
  isEdit.value = true;
  formData.id = row.id;
  formData.username = row.username;
  formData.nickname = row.nickname;
  formData.gender = row.gender;
  formData.department = row.department;
  formData.phone = row.phone;
  dialogVisible.value = true;
};
// 关闭弹窗
const handleClose = () => {
  dialogVisible.value = false;
  formRef.value?.resetFields();
};
// 提交表单
const handleSubmit = async () => {
  await formRef.value?.validate();
  if (isEdit.value) {
    // 修改
    const index = originalData.value.findIndex(item => item.id === formData.id);
    if (index !== -1) {
      originalData.value[index] = {
        ...originalData.value[index],
        username: formData.username,
        nickname: formData.nickname,
        gender: formData.gender,
        department: formData.department,
        phone: formData.phone
      };
    }
    ElMessage.success("修改成功");
  } else {
    // 新增
    const newUser: User = {
      id: 10000 + originalData.value.length + 1,
      username: formData.username,
      nickname: formData.nickname,
      gender: formData.gender,
      department: formData.department,
      phone: formData.phone,
      createTime: dayjs().format("YYYY-MM-DD HH:mm:ss")
    };
    originalData.value.unshift(newUser);
    ElMessage.success("新增成功");
  }
  handleClose();
};
// 删除
const handleDelete = (row: User) => {
  ElMessageBox.confirm(`确定要删除用户"${row.nickname}"吗？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(() => {
      const index = originalData.value.findIndex(item => item.id === row.id);
      if (index !== -1) {
        originalData.value.splice(index, 1);
      }
      ElMessage.success("删除成功");
    })
    .catch(() => {});
};
// 页码变化
const handleCurrentChange = (page: number) => {
  currentPage.value = page;
};
// 每页条数变化
const handleSizeChange = (size: number) => {
  pageSize.value = size;
  currentPage.value = 1;
};
onMounted(() => {
  console.log("用户管理页面加载完成");
});
</script>

<template>
  <div class="user-manage-container">
    <!-- 搜索区域 -->
    <el-form :model="searchForm" inline class="search-form">
      <el-form-item label="用户名称">
        <el-input
          v-model="searchForm.username"
          placeholder="请输入用户名称"
          clearable
          style="width: 200px"
        />
      </el-form-item>
      <el-form-item label="手机号码">
        <el-input
          v-model="searchForm.phone"
          placeholder="请输入手机号码"
          clearable
          style="width: 200px"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">
          <el-icon><Search /></el-icon>
          搜索
        </el-button>
        <el-button @click="handleReset">
          <el-icon><Refresh /></el-icon>
          重置
        </el-button>
        <el-button type="success" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          新增用户
        </el-button>
      </el-form-item>
    </el-form>

    <!-- 表格区域 -->
    <el-table
      v-loading="false"
      :data="tableData"
      border
      stripe
      class="user-table"
    >
      <el-table-column prop="id" label="用户ID" width="100" align="center" />
      <el-table-column
        prop="username"
        label="用户名称"
        width="120"
        align="center"
      />
      <el-table-column
        prop="nickname"
        label="用户昵称"
        width="120"
        align="center"
      />
      <el-table-column prop="gender" label="性别" width="80" align="center">
        <template #default="{ row }">
          <el-tag
            :type="
              row.gender === '男'
                ? 'primary'
                : row.gender === '女'
                  ? 'danger'
                  : 'info'
            "
          >
            {{ row.gender }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="department"
        label="部门"
        width="120"
        align="center"
      >
        <template #default="{ row }">
          <el-tag>{{ row.department }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="phone"
        label="手机号码"
        width="140"
        align="center"
      />
      <el-table-column
        prop="createTime"
        label="创建时间"
        width="180"
        align="center"
      />
      <el-table-column label="操作" width="150" fixed="right" align="center">
        <template #default="{ row }">
          <el-button type="primary" link @click="handleEdit(row)"
            >修改</el-button
          >
          <el-button type="danger" link @click="handleDelete(row)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页区域 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @current-change="handleCurrentChange"
        @size-change="handleSizeChange"
      />
    </div>

    <!-- 弹窗表单 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="80px"
        class="dialog-form"
      >
        <el-form-item label="用户名称" prop="username">
          <el-input v-model="formData.username" placeholder="请输入用户名称" />
        </el-form-item>
        <el-form-item label="用户昵称" prop="nickname">
          <el-input v-model="formData.nickname" placeholder="请输入用户昵称" />
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-select
            v-model="formData.gender"
            placeholder="请选择性别"
            style="width: 100%"
          >
            <el-option
              v-for="item in genderOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="部门" prop="department">
          <el-select
            v-model="formData.department"
            placeholder="请选择部门"
            style="width: 100%"
          >
            <el-option
              v-for="item in departmentOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="手机号码" prop="phone">
          <el-input v-model="formData.phone" placeholder="请输入手机号码" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleClose">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.user-manage-container {
  min-height: calc(100vh - 100px);
  padding: 20px;
  background-color: #f5f7fa;
}

.search-form {
  padding: 20px;
  margin-bottom: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgb(0 0 0 / 10%);
}

.user-table {
  overflow: hidden;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgb(0 0 0 / 10%);
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  padding: 20px;
  margin-top: 1px;
  background: #fff;
  border-radius: 0 0 8px 8px;
  box-shadow: 0 2px 12px 0 rgb(0 0 0 / 10%);
}

.dialog-form {
  padding-right: 20px;
}
</style>
