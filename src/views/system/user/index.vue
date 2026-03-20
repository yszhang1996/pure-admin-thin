<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import {
  ElMessage,
  ElMessageBox,
  type FormInstance,
  type FormRules
} from "element-plus";

defineOptions({
  name: "UserManage"
});

interface UserInfo {
  id: number;
  username: string;
  nickname: string;
  gender: string;
  department: string;
  phone: string;
  createTime: string;
}

const departmentOptions = [
  { label: "技术部", value: "技术部" },
  { label: "产品部", value: "产品部" },
  { label: "运营部", value: "运营部" },
  { label: "市场部", value: "市场部" },
  { label: "人事部", value: "人事部" },
  { label: "财务部", value: "财务部" },
  { label: "设计部", value: "设计部" }
];

const genderOptions = [
  { label: "男", value: "男" },
  { label: "女", value: "女" }
];

const generateMockData = (): UserInfo[] => {
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
  const data: UserInfo[] = [];

  for (let i = 1; i <= 35; i++) {
    const year = 2023 + Math.floor(Math.random() * 2);
    const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, "0");
    const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, "0");
    const hour = String(Math.floor(Math.random() * 24)).padStart(2, "0");
    const minute = String(Math.floor(Math.random() * 60)).padStart(2, "0");
    const second = String(Math.floor(Math.random() * 60)).padStart(2, "0");

    data.push({
      id: 1000 + i,
      username: `user${i}`,
      nickname: `用户${i}`,
      gender: genders[Math.floor(Math.random() * 2)],
      department: departments[Math.floor(Math.random() * departments.length)],
      phone: `1${["3", "5", "7", "8", "9"][Math.floor(Math.random() * 5)]}${String(Math.floor(Math.random() * 1000000000)).padStart(9, "0")}`,
      createTime: `${year}-${month}-${day} ${hour}:${minute}:${second}`
    });
  }

  return data.sort(
    (a, b) =>
      new Date(b.createTime).getTime() - new Date(a.createTime).getTime()
  );
};

const tableData = ref<UserInfo[]>([]);
const filteredData = ref<UserInfo[]>([]);
const loading = ref(false);

const searchForm = reactive({
  username: "",
  phone: ""
});

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
});

const dialogVisible = ref(false);
const dialogTitle = ref("新增用户");
const formRef = ref<FormInstance>();
const editId = ref<number | null>(null);

const userForm = reactive({
  username: "",
  nickname: "",
  gender: "男",
  department: "",
  phone: ""
});

const phoneValidator = (rule: any, value: string, callback: any) => {
  if (!value) {
    callback(new Error("请输入手机号码"));
  } else if (!/^1[3-9]\d{9}$/.test(value)) {
    callback(new Error("请输入正确的手机号码格式"));
  } else {
    callback();
  }
};

const formRules: FormRules = {
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
  phone: [{ required: true, validator: phoneValidator, trigger: "blur" }]
};

const currentPageData = computed(() => {
  const start = (pagination.currentPage - 1) * pagination.pageSize;
  const end = start + pagination.pageSize;
  return filteredData.value.slice(start, end);
});

const handleSearch = () => {
  loading.value = true;
  pagination.currentPage = 1;

  setTimeout(() => {
    filteredData.value = tableData.value.filter(item => {
      const matchUsername =
        !searchForm.username ||
        item.username
          .toLowerCase()
          .includes(searchForm.username.toLowerCase()) ||
        item.nickname.toLowerCase().includes(searchForm.username.toLowerCase());
      const matchPhone =
        !searchForm.phone || item.phone.includes(searchForm.phone);
      return matchUsername && matchPhone;
    });
    pagination.total = filteredData.value.length;
    loading.value = false;
  }, 300);
};

const handleReset = () => {
  searchForm.username = "";
  searchForm.phone = "";
  pagination.currentPage = 1;
  filteredData.value = [...tableData.value];
  pagination.total = tableData.value.length;
};

const handleAdd = () => {
  dialogTitle.value = "新增用户";
  editId.value = null;
  resetForm();
  dialogVisible.value = true;
};

const handleEdit = (row: UserInfo) => {
  dialogTitle.value = "编辑用户";
  editId.value = row.id;
  userForm.username = row.username;
  userForm.nickname = row.nickname;
  userForm.gender = row.gender;
  userForm.department = row.department;
  userForm.phone = row.phone;
  dialogVisible.value = true;
};

const handleDelete = (row: UserInfo) => {
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
      ElMessage.info("已取消删除");
    });
};

const handleSubmit = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(valid => {
    if (valid) {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      const hour = String(now.getHours()).padStart(2, "0");
      const minute = String(now.getMinutes()).padStart(2, "0");
      const second = String(now.getSeconds()).padStart(2, "0");
      const createTime = `${year}-${month}-${day} ${hour}:${minute}:${second}`;

      if (editId.value) {
        const index = tableData.value.findIndex(
          item => item.id === editId.value
        );
        if (index > -1) {
          tableData.value[index] = {
            ...tableData.value[index],
            username: userForm.username,
            nickname: userForm.nickname,
            gender: userForm.gender,
            department: userForm.department,
            phone: userForm.phone
          };
          ElMessage.success("修改成功");
        }
      } else {
        const newId = Math.max(...tableData.value.map(item => item.id)) + 1;
        tableData.value.unshift({
          id: newId,
          username: userForm.username,
          nickname: userForm.nickname,
          gender: userForm.gender,
          department: userForm.department,
          phone: userForm.phone,
          createTime
        });
        ElMessage.success("新增成功");
      }

      handleSearch();
      dialogVisible.value = false;
      resetForm();
    }
  });
};

const handleCancel = () => {
  dialogVisible.value = false;
  resetForm();
};

const resetForm = () => {
  userForm.username = "";
  userForm.nickname = "";
  userForm.gender = "男";
  userForm.department = "";
  userForm.phone = "";
  formRef.value?.resetFields();
};

const handleSizeChange = (val: number) => {
  pagination.pageSize = val;
  pagination.currentPage = 1;
};

const handleCurrentChange = (val: number) => {
  pagination.currentPage = val;
};

onMounted(() => {
  tableData.value = generateMockData();
  filteredData.value = [...tableData.value];
  pagination.total = tableData.value.length;
});
</script>

<template>
  <div class="user-manage-container">
    <el-card shadow="never" class="mb-4">
      <el-form :model="searchForm" inline>
        <el-form-item label="用户名称">
          <el-input
            v-model="searchForm.username"
            placeholder="请输入用户名称"
            clearable
            class="w-[200px]"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="手机号码">
          <el-input
            v-model="searchForm.phone"
            placeholder="请输入手机号码"
            clearable
            class="w-[200px]"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <template #icon>
              <span class="i-ep-search" />
            </template>
            搜索
          </el-button>
          <el-button @click="handleReset">
            <template #icon>
              <span class="i-ep-refresh" />
            </template>
            重置
          </el-button>
          <el-button type="success" @click="handleAdd">
            <template #icon>
              <span class="i-ep-plus" />
            </template>
            新增用户
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never">
      <el-table
        v-loading="loading"
        :data="currentPageData"
        stripe
        border
        highlight-current-row
        style="width: 100%"
      >
        <el-table-column prop="id" label="用户ID" width="100" align="center" />
        <el-table-column
          prop="username"
          label="用户名称"
          min-width="120"
          show-overflow-tooltip
        />
        <el-table-column
          prop="nickname"
          label="用户昵称"
          min-width="120"
          show-overflow-tooltip
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
          min-width="100"
          align="center"
        >
          <template #default="{ row }">
            <el-tag type="info" size="small">
              {{ row.department }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="phone"
          label="手机号码"
          min-width="130"
          align="center"
        />
        <el-table-column
          prop="createTime"
          label="创建时间"
          min-width="170"
          align="center"
        />
        <el-table-column label="操作" width="160" align="center" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              link
              size="small"
              @click="handleEdit(row)"
            >
              <template #icon>
                <span class="i-ep-edit" />
              </template>
              修改
            </el-button>
            <el-button
              type="danger"
              link
              size="small"
              @click="handleDelete(row)"
            >
              <template #icon>
                <span class="i-ep-delete" />
              </template>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="flex justify-end mt-4">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
      :close-on-click-modal="false"
      @close="handleCancel"
    >
      <el-form
        ref="formRef"
        :model="userForm"
        :rules="formRules"
        label-width="80px"
      >
        <el-form-item label="用户名称" prop="username">
          <el-input
            v-model="userForm.username"
            placeholder="请输入用户名称"
            maxlength="20"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="用户昵称" prop="nickname">
          <el-input
            v-model="userForm.nickname"
            placeholder="请输入用户昵称"
            maxlength="20"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-radio-group v-model="userForm.gender">
            <el-radio
              v-for="item in genderOptions"
              :key="item.value"
              :value="item.value"
            >
              {{ item.label }}
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="部门" prop="department">
          <el-select
            v-model="userForm.department"
            placeholder="请选择部门"
            class="w-full"
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
            v-model="userForm.phone"
            placeholder="请输入手机号码"
            maxlength="11"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleCancel">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.user-manage-container {
  padding: 0;
}
</style>
