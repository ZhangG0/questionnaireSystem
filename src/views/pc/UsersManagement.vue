<template>
  <div class="users-page">
    <div class="page-header">
      <h2 class="title">用户管理</h2>
      <a-button type="primary" class="add-btn" @click="handleAdd"> + 新建用户 </a-button>
    </div>

    <div class="search-area">
      <div class="search-item">
        <span class="label">用户名：</span>
        <a-input v-model="searchForm.userAccount" placeholder="请输入用户名" allow-clear />
      </div>
      <div class="search-item">
        <span class="label">微信名：</span>
        <a-input v-model="searchForm.wechatName" placeholder="请输入微信名" allow-clear />
      </div>
      <div class="search-item">
        <span class="label">创建时间：</span>
        <a-range-picker
          v-model="searchForm.timeRange"
          style="width: 400px"
          show-time
          format="YYYY-MM-DD HH:mm:ss"
        />
      </div>
    </div>

    <a-table
      :loading="loading"
      :columns="columns"
      :data="tableData"
      :pagination="false"
      :bordered="{ cell: true }"
    >
      <template #index="{ rowIndex }">
        {{ rowIndex + 1 }}
      </template>
      <template #userRole="{ record }">
        <a-tag :color="record.userRole === 'ban' ? 'red' : 'green'">
          {{ record.userRole === 'ban' ? '禁用' : '正常' }}
        </a-tag>
      </template>
      <template #operation="{ record }">
        <a-button type="text" status="success" @click="handleEdit(record)"> 查看 </a-button>
      </template>
    </a-table>

    <a-modal
      v-model:visible="showUserDialog"
      :title="dialogTitle"
      @ok="handleUserSubmit"
      @cancel="showUserDialog = false"
    >
      <a-form ref="formRef" :model="userForm">
        <a-form-item
          field="userAccount"
          label="用户名"
          :rules="[{ required: true, message: '请输入用户名' }]"
        >
          <a-input v-model="userForm.userAccount" placeholder="请输入用户名" allow-clear />
        </a-form-item>
        <a-form-item
          field="userPassword"
          label="密码"
          :rules="[{ required: true, message: '请输入密码' }]"
        >
          <a-input-password v-model="userForm.userPassword" placeholder="请输入密码" allow-clear />
        </a-form-item>
        <a-form-item field="wechatName" label="微信名">
          <a-input v-model="userForm.wechatName" placeholder="请输入微信名（选填）" allow-clear />
        </a-form-item>
      </a-form>
      <template #footer>
        <a-space>
          <a-button @click="showUserDialog = false">取消</a-button>
          <a-button type="primary" :loading="submitting" @click="handleUserSubmit"> 确定 </a-button>
        </a-space>
      </template>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import type { TableColumnData } from '@arco-design/web-vue'
import { debounce } from 'lodash'
import { useRouter } from 'vue-router'
import { queryUserList, register } from '@/api/auth'
import type { UserInfo, UserQueryParams } from '@/types/auth'
import dayjs from 'dayjs'

const router = useRouter()

// 搜索表单
interface SearchForm extends Omit<UserQueryParams, 'startTime' | 'endTime'> {
  timeRange: Date[]
}

const searchForm = reactive<SearchForm>({
  userAccount: '',
  wechatName: '',
  timeRange: []
})

// 表格数据和加载状态
const tableData = ref<UserInfo[]>([])
const loading = ref(false)

// 获取用户列表数据
const fetchUserList = async () => {
  loading.value = true
  try {
    const params: UserQueryParams = {
      userAccount: searchForm.userAccount,
      wechatName: searchForm.wechatName
    }

    if (searchForm.timeRange?.length === 2) {
      params.startTime = dayjs(searchForm.timeRange[0]).format('YYYY-MM-DD HH:mm:ss')
      params.endTime = dayjs(searchForm.timeRange[1]).format('YYYY-MM-DD HH:mm:ss')
    }

    const data = await queryUserList(params)
    tableData.value = data
  } catch (error: any) {
    Message.error(error?.message || '获取数据失败')
  } finally {
    loading.value = false
  }
}

// 用户表单相关
const showUserDialog = ref(false)
const dialogTitle = ref('新建用户')
const formRef = ref()
const submitting = ref(false)
const userForm = reactive({
  userAccount: '',
  userPassword: '',
  wechatName: ''
})

// 防抖处理的搜索函数
const debouncedSearch = debounce(() => {
  fetchUserList()
}, 300)

// 监听搜索条件变化
watch(
  () => searchForm.userAccount,
  () => debouncedSearch()
)

watch(
  () => searchForm.wechatName,
  () => debouncedSearch()
)

watch(
  () => searchForm.timeRange,
  () => debouncedSearch(),
  { deep: true }
)

// 初始化加载数据
onMounted(() => {
  fetchUserList()
})

// 表格配置
const columns: TableColumnData[] = [
  {
    title: '用户名',
    dataIndex: 'userAccount',
    align: 'center'
  },
  {
    title: '微信名',
    dataIndex: 'wechatName',
    align: 'center'
  },
  {
    title: '用户状态',
    dataIndex: 'userRole',
    align: 'center',
    slotName: 'userRole'
  },
  {
    title: '创建时间',
    dataIndex: 'gmtCreate',
    align: 'center'
  },
  {
    title: '操作',
    dataIndex: 'operation',
    width: 120,
    align: 'center',
    slotName: 'operation'
  }
]

const handleAdd = () => {
  dialogTitle.value = '新建用户'
  userForm.userAccount = ''
  userForm.userPassword = ''
  userForm.wechatName = ''
  showUserDialog.value = true
}

const handleEdit = (record: UserInfo) => {
  router.push({
    path: '/pc/userDetail',
    query: {
      id: record.id
    }
  })
}

const handleUserSubmit = async () => {
  try {
    submitting.value = true
    await formRef.value.validate()

    // 调用注册接口
    await register({
      userAccount: userForm.userAccount,
      userPassword: userForm.userPassword,
      wechatName: userForm.wechatName
    })

    // 保存成功后才关闭弹窗和显示成功提示
    Message.success('新建用户成功')
    showUserDialog.value = false

    // 刷新列表
    await fetchUserList()
  } catch (err: any) {
    // 表单验证失败或接口调用失败
    if (err?.type === 'form-validation') {
      Message.error('请填写必填项')
    } else {
      Message.error(err?.message || '操作失败')
    }
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped lang="scss">
.users-page {
  padding: 20px;
  background: #fff;
  border-radius: 4px;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid #f0f0f0;

    .title {
      font-size: 20px;
      font-weight: 500;
      margin: 0;
    }

    .add-btn {
      height: 32px;
      padding: 0 16px;
      font-size: 14px;
    }
  }

  .search-area {
    display: flex;
    gap: 20px;
    margin-bottom: 20px;

    .search-item {
      display: flex;
      align-items: center;

      .label {
        white-space: nowrap;
        margin-right: 8px;
      }

      .arco-input-wrapper {
        width: 200px;
      }
    }
  }

  :deep(.arco-table) {
    .arco-table-th {
      background-color: #f5f5f5;
    }
  }
}
</style>
