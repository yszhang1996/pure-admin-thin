<script setup lang="ts">
import { ref, reactive, onMounted, computed } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { FormInstance, FormRules } from "element-plus";

defineOptions({
  name: "SystemUser"
});

// 用户类型定义
interface User {
  id: number;
  username: string;
  nickname: string;
  gender: string;
  department: string;
  phone: string;
  createTime: string;
}

// 搜索表单
const searchForm = reactive({
  username: "",
  phone: ""
});

// 表格数据
const tableData = ref<User[]>([]);
const filteredData = ref<User[]>([]);

// 分页相关
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

// 弹窗相关
const dialogVisible = ref(false);
const dialogTitle = ref("新增用户");
const isEdit = ref(false);
const currentEditId = ref<number | null>(null);
const formRef = ref<FormInstance>();

// 表单数据
const formData = reactive({
  username: "",
  nickname: "",
  gender: "",
  department: "",
  phone: ""
});

// 部门选项
const departmentOptions = [
  { label: "技术部", value: "技术部" },
  { label: "产品部", value: "产品部" },
  { label: "运营部", value: "运营部" },
  { label: "市场部", value: "市场部" },
  { label: "人事部", value: "人事部" },
  { label: "财务部", value: "财务部" },
  { label: "设计部", value: "设计部" }
];

// 性别选项
const genderOptions = [
  { label: "男", value: "男" },
  { label: "女", value: "女" }
];

// 表单校验规则
const rules: FormRules = {
  username: [
    { required: true, message: "请输入用户名称", trigger: "blur" },
    { min: 2, max: 20, message: "长度在 2 到 20 个字符", trigger: "blur" }
  ],
  nickname: [
    { required: true, message: "请输入用户昵称", trigger: "blur" },
    { min: 2, max: 20, message: "长度在 2 到 20 个字符", trigger: "blur" }
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

// 生成模拟数据
const generateMockData = (): User[] => {
  const mockData: User[] = [];
  const departments = [
    "技术部",
    "产品部",
    "运营部",
    "市场部",
    "人事部",
    "财务部",
    "设计部"
  ];
  const genders = ["男", "女"];

  for (let i = 1; i <= 35; i++) {
    mockData.push({
      id: i,
      username: `user${i.toString().padStart(3, "0")}`,
      nickname: `用户${i}`,
      gender: genders[i % 2],
      department: departments[i % departments.length],
      phone: `138${String(Math.floor(Math.random() * 100000000)).padStart(8, "0")}`,
      createTime: new Date(
        Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000)
      ).toLocaleString()
    });
  }
  return mockData;
};

// 初始化数据
onMounted(() => {
  tableData.value = generateMockData();
  filteredData.value = [...tableData.value];
  total.value = filteredData.value.length;
});

// 分页后的数据
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredData.value.slice(start, end);
});

// 搜索功能
const handleSearch = () => {
  filteredData.value = tableData.value.filter(item => {
    const matchUsername = searchForm.username
      ? item.username.includes(searchForm.username)
      : true;
    const matchPhone = searchForm.phone
      ? item.phone.includes(searchForm.phone)
      : true;
    return matchUsername && matchPhone;
  });
  currentPage.value = 1;
  total.value = filteredData.value.length;
};

// 重置功能
const handleReset = () => {
  searchForm.username = "";
  searchForm.phone = "";
  filteredData.value = [...tableData.value];
  currentPage.value = 1;
  total.value = filteredData.value.length;
};

// 打开新增弹窗
const handleAdd = () => {
  isEdit.value = false;
  dialogTitle.value = "新增用户";
  currentEditId.value = null;
  resetForm();
  dialogVisible.value = true;
};

// 打开编辑弹窗
const handleEdit = (row: User) => {
  isEdit.value = true;
  dialogTitle.value = "修改用户";
  currentEditId.value = row.id;
  formData.username = row.username;
  formData.nickname = row.nickname;
  formData.gender = row.gender;
  formData.department = row.department;
  formData.phone = row.phone;
  dialogVisible.value = true;
};

// 删除功能
const handleDelete = (row: User) => {
  ElMessageBox.confirm(`确定要删除用户 "${row.username}" 吗？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(() => {
      const index = tableData.value.findIndex(item => item.id === row.id);
      if (index > -1) {
        tableData.value.splice(index, 1);
        handleSearch();
        ElMessage.success("删除成功");
      }
    })
    .catch(() => {
      // 取消删除
    });
};

// 重置表单
const resetForm = () => {
  formData.username = "";
  formData.nickname = "";
  formData.gender = "";
  formData.department = "";
  formData.phone = "";
  formRef.value?.resetFields();
};

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(valid => {
    if (valid) {
      if (isEdit.value && currentEditId.value !== null) {
        // 编辑模式
        const index = tableData.value.findIndex(
          item => item.id === currentEditId.value
        );
        if (index > -1) {
          tableData.value[index] = {
            ...tableData.value[index],
            username: formData.username,
            nickname: formData.nickname,
            gender: formData.gender,
            department: formData.department,
            phone: formData.phone
          };
          ElMessage.success("修改成功");
        }
      } else {
        // 新增模式
        const newUser: User = {
          id: Math.max(...tableData.value.map(item => item.id), 0) + 1,
          username: formData.username,
          nickname: formData.nickname,
          gender: formData.gender,
          department: formData.department,
          phone: formData.phone,
          createTime: new Date().toLocaleString()
        };
        tableData.value.unshift(newUser);
        ElMessage.success("新增成功");
      }
      dialogVisible.value = false;
      handleSearch();
    }
  });
};

// 关闭弹窗
const handleClose = () => {
  dialogVisible.value = false;
  resetForm();
};

// 分页大小变化
const handleSizeChange = (val: number) => {
  pageSize.value = val;
  currentPage.value = 1;
};

// 页码变化
const handleCurrentChange = (val: number) => {
  currentPage.value = val;
};
</script>

<template>
  <div class="user-management">
    <!-- 搜索区域 -->
    <el-card shadow="never" class="search-card">
      <el-form :model="searchForm" inline>
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
            <el-icon><RefreshRight /></el-icon>
            重置
          </el-button>
          <el-button type="success" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增用户
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 表格区域 -->
    <el-card shadow="never" class="table-card">
      <el-table
        v-loading="false"
        :data="paginatedData"
        border
        stripe
        style="width: 100%"
      >
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="id" label="用户ID" width="80" align="center" />
        <el-table-column prop="username" label="用户名称" min-width="120" />
        <el-table-column prop="nickname" label="用户昵称" min-width="120" />
        <el-table-column prop="gender" label="性别" width="80" align="center" />
        <el-table-column prop="department" label="部门" min-width="120" />
        <el-table-column prop="phone" label="手机号码" min-width="140" />
        <el-table-column prop="createTime" label="创建时间" min-width="180" />
        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template #default="{ row }">
            <el-button
              link
              type="primary"
              size="small"
              @click="handleEdit(row)"
            >
              <el-icon><Edit /></el-icon>
              修改
            </el-button>
            <el-button
              link
              type="danger"
              size="small"
              @click="handleDelete(row)"
            >
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
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
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
      :close-on-click-modal="false"
      @close="handleClose"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="100px"
        style="padding: 20px"
      >
        <el-form-item label="用户名称" prop="username">
          <el-input
            v-model="formData.username"
            placeholder="请输入用户名称"
            maxlength="20"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="用户昵称" prop="nickname">
          <el-input
            v-model="formData.nickname"
            placeholder="请输入用户昵称"
            maxlength="20"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-radio-group v-model="formData.gender">
            <el-radio
              v-for="item in genderOptions"
              :key="item.value"
              :label="item.value"
            >
              {{ item.label }}
            </el-radio>
          </el-radio-group>
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
          <el-input
            v-model="formData.phone"
            placeholder="请输入手机号码"
            maxlength="11"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleClose">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.user-management {
  padding: 20px;
}

.search-card {
  margin-bottom: 20px;
}

.table-card {
  margin-bottom: 20px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  padding-top: 20px;
  margin-top: 20px;
}

:deep(.el-card__body) {
  padding: 20px;
}
</style>
