<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { FormInstance, FormRules } from "element-plus";

defineOptions({
  name: "UserManagement"
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

// 用户表单
const userForm = reactive({
  id: 0,
  username: "",
  nickname: "",
  gender: "",
  department: "",
  phone: ""
});

// 表单校验规则
const userFormRules: FormRules = {
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

// 部门选项
const departmentOptions = [
  { value: "技术部", label: "技术部" },
  { value: "产品部", label: "产品部" },
  { value: "运营部", label: "运营部" },
  { value: "市场部", label: "市场部" },
  { value: "人事部", label: "人事部" },
  { value: "财务部", label: "财务部" },
  { value: "设计部", label: "设计部" }
];

// 性别选项
const genderOptions = [
  { value: "男", label: "男" },
  { value: "女", label: "女" }
];

// 表格数据
const tableData = ref<User[]>([]);
const filteredData = ref<User[]>([]);

// 分页相关
const currentPage = ref(1);
const pageSize = ref(10);
const total = computed(() => filteredData.value.length);

// 分页后的数据
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredData.value.slice(start, end);
});

// 弹窗相关
const dialogVisible = ref(false);
const dialogTitle = ref("新增用户");
const isEdit = ref(false);
const userFormRef = ref<FormInstance>();

// 生成模拟数据
const generateMockData = () => {
  const mockUsers: User[] = [
    {
      id: 1,
      username: "zhangsan",
      nickname: "张三",
      gender: "男",
      department: "技术部",
      phone: "13800138001",
      createTime: "2024-01-15 09:30:00"
    },
    {
      id: 2,
      username: "lisi",
      nickname: "李四",
      gender: "女",
      department: "产品部",
      phone: "13800138002",
      createTime: "2024-01-16 10:15:00"
    },
    {
      id: 3,
      username: "wangwu",
      nickname: "王五",
      gender: "男",
      department: "运营部",
      phone: "13800138003",
      createTime: "2024-01-17 14:20:00"
    },
    {
      id: 4,
      username: "zhaoliu",
      nickname: "赵六",
      gender: "女",
      department: "市场部",
      phone: "13800138004",
      createTime: "2024-01-18 16:45:00"
    },
    {
      id: 5,
      username: "qianqi",
      nickname: "钱七",
      gender: "男",
      department: "人事部",
      phone: "13800138005",
      createTime: "2024-01-19 08:30:00"
    },
    {
      id: 6,
      username: "sunba",
      nickname: "孙八",
      gender: "女",
      department: "财务部",
      phone: "13800138006",
      createTime: "2024-01-20 11:00:00"
    },
    {
      id: 7,
      username: "zhoujiu",
      nickname: "周九",
      gender: "男",
      department: "设计部",
      phone: "13800138007",
      createTime: "2024-01-21 15:30:00"
    },
    {
      id: 8,
      username: "wushi",
      nickname: "吴十",
      gender: "女",
      department: "技术部",
      phone: "13800138008",
      createTime: "2024-01-22 09:00:00"
    },
    {
      id: 9,
      username: "zheng11",
      nickname: "郑十一",
      gender: "男",
      department: "产品部",
      phone: "13800138009",
      createTime: "2024-01-23 13:20:00"
    },
    {
      id: 10,
      username: "chen12",
      nickname: "陈十二",
      gender: "女",
      department: "运营部",
      phone: "13800138010",
      createTime: "2024-01-24 17:00:00"
    },
    {
      id: 11,
      username: "liu13",
      nickname: "刘十三",
      gender: "男",
      department: "市场部",
      phone: "13800138011",
      createTime: "2024-01-25 10:45:00"
    },
    {
      id: 12,
      username: "huang14",
      nickname: "黄十四",
      gender: "女",
      department: "人事部",
      phone: "13800138012",
      createTime: "2024-01-26 14:15:00"
    }
  ];
  tableData.value = mockUsers;
  filteredData.value = mockUsers;
};

// 搜索功能
const handleSearch = () => {
  filteredData.value = tableData.value.filter(item => {
    const matchUsername = searchForm.username
      ? item.username.includes(searchForm.username) ||
        item.nickname.includes(searchForm.username)
      : true;
    const matchPhone = searchForm.phone
      ? item.phone.includes(searchForm.phone)
      : true;
    return matchUsername && matchPhone;
  });
  currentPage.value = 1;
};

// 重置功能
const handleReset = () => {
  searchForm.username = "";
  searchForm.phone = "";
  filteredData.value = [...tableData.value];
  currentPage.value = 1;
};

// 打开新增弹窗
const handleAdd = () => {
  isEdit.value = false;
  dialogTitle.value = "新增用户";
  resetForm();
  dialogVisible.value = true;
};

// 打开编辑弹窗
const handleEdit = (row: User) => {
  isEdit.value = true;
  dialogTitle.value = "修改用户";
  Object.assign(userForm, row);
  dialogVisible.value = true;
};

// 删除用户
const handleDelete = (row: User) => {
  ElMessageBox.confirm(`确定要删除用户 "${row.nickname}" 吗？`, "提示", {
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
  userForm.id = 0;
  userForm.username = "";
  userForm.nickname = "";
  userForm.gender = "";
  userForm.department = "";
  userForm.phone = "";
};

// 提交表单
const handleSubmit = async () => {
  if (!userFormRef.value) return;

  await userFormRef.value.validate(valid => {
    if (valid) {
      if (isEdit.value) {
        // 编辑模式
        const index = tableData.value.findIndex(
          item => item.id === userForm.id
        );
        if (index > -1) {
          tableData.value[index] = {
            ...userForm,
            createTime: tableData.value[index].createTime
          };
          ElMessage.success("修改成功");
        }
      } else {
        // 新增模式
        const newUser: User = {
          ...userForm,
          id: Date.now(),
          createTime: new Date().toLocaleString("zh-CN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
          })
        };
        tableData.value.unshift(newUser);
        ElMessage.success("新增成功");
      }
      handleSearch();
      dialogVisible.value = false;
    }
  });
};

// 关闭弹窗
const handleClose = () => {
  dialogVisible.value = false;
  resetForm();
  userFormRef.value?.resetFields();
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

onMounted(() => {
  generateMockData();
});
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
            <el-icon><Refresh /></el-icon>
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
      <el-table :data="paginatedData" stripe border style="width: 100%">
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
              :type="row.gender === '男' ? 'primary' : 'danger'"
              size="small"
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
            <el-tag type="info" size="small">{{ row.department }}</el-tag>
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
          min-width="160"
          align="center"
        />
        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              link
              size="small"
              @click="handleEdit(row)"
            >
              <el-icon><Edit /></el-icon>
              修改
            </el-button>
            <el-button
              type="danger"
              link
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
        ref="userFormRef"
        :model="userForm"
        :rules="userFormRules"
        label-width="100px"
      >
        <el-form-item label="用户名称" prop="username">
          <el-input v-model="userForm.username" placeholder="请输入用户名称" />
        </el-form-item>
        <el-form-item label="用户昵称" prop="nickname">
          <el-input v-model="userForm.nickname" placeholder="请输入用户昵称" />
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-select
            v-model="userForm.gender"
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
            v-model="userForm.department"
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
          <el-input v-model="userForm.phone" placeholder="请输入手机号码" />
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

.dialog-footer {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}
</style>
