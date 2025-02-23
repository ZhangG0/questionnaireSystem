<template>
  <div class="questionnaire-stats">
    <div class="page-header">
      <div class="left">
        <h2 class="title">问卷统计</h2>
      </div>
      <a-button type="text" class="back-btn" @click="handleBack">
        <template #icon><icon-left /></template>
        返回列表
      </a-button>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <a-card class="stats-card">
        <div class="stats-value">{{ statistics.todayAdd || 0 }}</div>
        <div class="stats-label">今日新增</div>
      </a-card>
      <a-card class="stats-card">
        <div class="stats-value">{{ statistics.total || 0 }}</div>
        <div class="stats-label">总数</div>
      </a-card>
    </div>

    <!-- 筛选区域 -->
    <div class="filter-area">
      <div class="filter-item">
        <span class="label">微信名：</span>
        <a-input v-model="filterForm.wechatName" placeholder="请输入微信名" allow-clear />
      </div>
      <div class="filter-item">
        <span class="label">用户名：</span>
        <a-input v-model="filterForm.userName" placeholder="请输入用户名" allow-clear />
      </div>
      <div class="filter-item">
        <span class="label">提交时间：</span>
        <a-range-picker
          v-model="filterForm.timeRange"
          style="width: 360px"
          show-time
          format="YYYY-MM-DD HH:mm:ss"
        />
      </div>
      <div class="filter-actions">
        <a-button type="primary" @click="handleSearch">
          <template #icon><icon-search /></template>
          搜索
        </a-button>
        <a-button @click="handleReset">
          <template #icon><icon-refresh /></template>
          重置
        </a-button>
      </div>
    </div>

    <!-- 表格 -->
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
      <template #operation="{ record }">
        <a-button type="text" @click="handleView(record)">查看</a-button>
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import type { TableColumnData } from '@arco-design/web-vue'
import { IconLeft, IconSearch, IconRefresh } from '@arco-design/web-vue/es/icon'
import { getUserResponse, getQuantityStatistics } from '@/api/survey'
import dayjs from 'dayjs'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const statistics = ref({
  todayAdd: '0',
  total: '0'
})

// 筛选表单
const filterForm = reactive({
  wechatName: '',
  userName: '',
  timeRange: [] as Date[]
})

// 表格数据
const tableData = ref<any[]>([])

// 表格列配置
const columns: TableColumnData[] = [
  {
    title: '序号',
    dataIndex: 'index',
    width: 80,
    align: 'center',
    slotName: 'index'
  },
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
    title: '提交时间',
    dataIndex: 'submitTime',
    align: 'center'
  },
  {
    title: '操作',
    width: 100,
    align: 'center',
    slotName: 'operation'
  }
]

// 获取问卷回答列表
const fetchUserResponses = async () => {
  const surveyId = route.query.surveyId as string
  if (!surveyId) return

  loading.value = true
  try {
    const params = {
      surveyId,
      userAccount: filterForm.userName,
      wechatName: filterForm.wechatName,
      startTime: filterForm.timeRange[0] ? dayjs(filterForm.timeRange[0]).format('YYYY-MM-DD HH:mm:ss') : undefined,
      endTime: filterForm.timeRange[1] ? dayjs(filterForm.timeRange[1]).format('YYYY-MM-DD HH:mm:ss') : undefined
    }
    
    const response = await getUserResponse(params)
    if (response) {
      tableData.value = response
    }
  } catch (error) {
    Message.error('获取问卷回答列表失败')
  } finally {
    loading.value = false
  }
}

// 获取问卷数量统计
const fetchStatistics = async () => {
  const surveyId = route.query.surveyId as string
  if (!surveyId) return

  try {
    const response = await getQuantityStatistics({ surveyId })
    if (response) {
      statistics.value = response
    }
  } catch (error) {
    Message.error('获取问卷统计数据失败')
  }
}

// 返回列表
const handleBack = () => {
  router.push('/pc/questionnaireManagement')
}

// 查看答卷详情
const handleView = (record: any) => {
  router.push({
    path: '/pc/responseDetail',
    query: {
      responseId: record.responseId,
      surveyId: route.query.surveyId
    }
  })
}

// 搜索
const handleSearch = () => {
  fetchUserResponses()
}

// 重置
const handleReset = () => {
  filterForm.wechatName = ''
  filterForm.userName = ''
  filterForm.timeRange = []
  fetchUserResponses()
}

onMounted(() => {
  fetchStatistics()
  fetchUserResponses()
})
</script>

<style scoped lang="scss">
.questionnaire-stats {
  padding: 24px;
  background: linear-gradient(to bottom, #ffffff, var(--color-fill-2));
  border-radius: 8px;
  min-height: calc(100vh - 100px);

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32px;
    padding-bottom: 20px;
    border-bottom: 1px solid var(--color-border);

    .left {
      display: flex;
      flex-direction: column;
      gap: 4px;

      .title {
        font-size: 24px;
        font-weight: 600;
        margin: 0;
        color: var(--color-text-1);
        letter-spacing: -0.5px;
      }

      .subtitle {
        color: var(--color-text-3);
        font-size: 14px;
      }
    }

    .back-btn {
      color: var(--color-text-2);
      
      &:hover {
        color: rgb(var(--primary-6));
      }
    }
  }

  .stats-cards {
    display: flex;
    gap: 24px;
    margin-bottom: 24px;

    .stats-card {
      flex: 1;
      text-align: center;
      background: #ffffff;
      border-radius: 8px;
      transition: all 0.3s;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
      }

      .stats-value {
        font-size: 32px;
        font-weight: 600;
        color: rgb(var(--primary-6));
        margin-bottom: 8px;
      }

      .stats-label {
        font-size: 14px;
        color: var(--color-text-2);
      }
    }
  }

  .filter-area {
    display: flex;
    gap: 20px;
    margin-bottom: 24px;
    padding: 24px;
    background: #ffffff;
    border-radius: 8px;
    border: 1px solid var(--color-border);
    flex-wrap: wrap;

    .filter-item {
      display: flex;
      align-items: center;

      .label {
        white-space: nowrap;
        margin-right: 8px;
        color: var(--color-text-2);
      }

      :deep(.arco-input-wrapper) {
        width: 200px;
      }
    }

    .filter-actions {
      display: flex;
      gap: 8px;
      margin-left: auto;
      align-items: center;
    }
  }

  :deep(.arco-table) {
    background: #ffffff;
    border-radius: 8px;
    border: 1px solid var(--color-border);

    .arco-table-th {
      background-color: var(--color-fill-2);
      font-weight: 500;
    }

    .arco-table-tr {
      &:hover {
        td {
          background-color: var(--color-fill-2);
        }
      }
    }

    .arco-btn-text {
      color: rgb(var(--primary-6));
      
      &:hover {
        background-color: var(--color-fill-2);
      }
    }
  }
}
</style> 