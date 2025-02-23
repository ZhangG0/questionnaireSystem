<template>
  <div class="questionnaire-page">
    <div class="page-header">
      <div class="left">
        <h2 class="title">查看问卷</h2>
        <div class="subtitle">共 {{ questionnaireList.length }} 个问卷</div>
      </div>
      <a-button type="primary" shape="round" @click="handleAdd" class="add-btn">
        <template #icon>
          <icon-plus />
        </template>
        创建问卷
      </a-button>
    </div>

    <div class="page-content">
      <div class="questionnaire-list">
        <a-card
          v-for="item in questionnaireList"
          :key="item.id"
          class="questionnaire-card"
          :hoverable="true"
        >
          <div class="card-header">
            <div class="card-title">{{ item.title }}</div>
            <a-tag size="small">问卷</a-tag>
          </div>
          <div class="card-content">
            <div class="info-item">
              <icon-file class="info-icon" />
              <span class="info-text">ID: {{ item.id }}</span>
            </div>
            <div class="info-item">
              <icon-calendar class="info-icon" />
              <span class="info-text">创建于 {{ new Date(item.gmtCreate).toLocaleDateString() }}</span>
            </div>
          </div>
          <div class="card-actions">
            <div class="left-actions">
              <a-button shape="round" type="primary" size="small" @click="handleEdit(item)">
                <template #icon><icon-edit /></template>
                编辑
              </a-button>
              <a-button shape="round" type="outline" size="small" @click="handleStats(item)">
                <template #icon><icon-bar-chart /></template>
                统计
              </a-button>
            </div>
            <div class="right-actions">
              <a-space :size="4">
                <a-tooltip content="下发问卷">
                  <a-button shape="circle" size="mini" type="outline" @click="handleIssue(item)">
                    <template #icon><icon-download /></template>
                  </a-button>
                </a-tooltip>
                <a-tooltip content="复制问卷">
                  <a-button shape="circle" size="mini" type="outline" @click="handleCopy(item)">
                    <template #icon><icon-copy /></template>
                  </a-button>
                </a-tooltip>
                <a-popconfirm
                  content="确认删除该问卷吗？"
                  @ok="handleDelete(item)"
                  position="left"
                >
                  <a-tooltip content="删除问卷">
                    <a-button shape="circle" size="mini" type="outline" status="danger">
                      <template #icon><icon-delete /></template>
                    </a-button>
                  </a-tooltip>
                </a-popconfirm>
              </a-space>
            </div>
          </div>
        </a-card>
      </div>
    </div>

    <!-- 下发成功的 Dialog -->
    <a-modal
      v-model:visible="showIssueDialog"
      title="问卷下发成功"
      :footer="false"
      @cancel="showIssueDialog = false"
      class="issue-dialog"
    >
      <div class="dialog-content">
        <p>问卷下发成功！</p>
        <p>访问链接: <a :href="issueLink" target="_blank">{{ issueLink }}</a></p>
        <a-button type="primary" @click="copyLink">复制链接</a-button>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import { useRouter } from 'vue-router'
import { deleteSurvey, issueSurvey, getSurveysList } from '@/api/survey'
import {
  IconPlus,
  IconDownload,
  IconEdit,
  IconBarChart,
  IconCopy,
  IconDelete,
  IconFile,
  IconCalendar
} from '@arco-design/web-vue/es/icon'

interface Questionnaire {
  id: string
  title: string
  gmtCreate: string
}

const router = useRouter()

// 问卷列表数据
const questionnaireList = ref<Questionnaire[]>([
  {
    id: '12345678901234',
    title: '1号问卷'
  },
  {
    id: '12345678901235',
    title: '2号问卷'
  },
  {
    id: '12345678901236',
    title: '3号问卷'
  }
])

// 下发成功的 Dialog
const showIssueDialog = ref(false)
const issueLink = ref('')

// 获取问卷列表
const fetchSurveysList = async () => {
  try {
    const response = await getSurveysList();
    if (response) {
      questionnaireList.value = response.data; // 更新问卷列表
    }
  } catch (error) {
    Message.error('获取问卷列表失败');
  }
}

// 事件处理
const handleAdd = () => {
  router.push({
    path: '/pc/questionnaireEdit',
    query: { id: Date.now().toString() }
  })
}

const handleDownload = (item: Questionnaire) => {
  Message.success('开始下载问卷数据')
}

const handleEdit = (item: Questionnaire) => {
  router.push({
    path: '/pc/questionnaireEdit',
    query: { type: 'edit', surveyId: item.id }
  })
}

const handleStats = (item: Questionnaire) => {
  router.push({
    path: '/pc/questionnaireStats',
    query: { surveyId: item.id }
  })
}

const handleCopy = async (item: Questionnaire) => {
  router.push({
    path: '/pc/questionnaireEdit',
    query: { type: 'new', surveyId: item.id }
  });
}

const handleIssue = async (item: Questionnaire) => {
  try {
    const response = await issueSurvey({ surveyId: item.id });
    if (response) {
      issueLink.value = response; // 设置返回的链接
      showIssueDialog.value = true; // 显示 Dialog
    }
  } catch (error) {
    Message.error('下发问卷失败');
  }
}

// 复制链接
const copyLink = () => {
  navigator.clipboard.writeText(issueLink.value)
  Message.success('链接已复制');
}

// 删除问卷
const handleDelete = async (item: Questionnaire) => {
  try {
    const response = await deleteSurvey({ surveyId: item.id });
    if (response) {
      questionnaireList.value = questionnaireList.value.filter(q => q.id !== item.id);
      Message.success('删除成功');
    }
  } catch (error) {
    Message.error('删除失败');
  }
}

// 在组件挂载时获取问卷列表
onMounted(() => {
  fetchSurveysList();
});
</script>

<style scoped lang="scss">
.questionnaire-page {
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

    .add-btn {
      padding: 0 28px;
      height: 40px;
      font-weight: 500;
      font-size: 15px;
      box-shadow: 0 2px 6px rgba(var(--primary-6), 0.2);
      
      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(var(--primary-6), 0.4);
      }

      .arco-icon {
        font-size: 16px;
      }
    }
  }

  .page-content {
    .questionnaire-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
      gap: 24px;

      .questionnaire-card {
        border: 1px solid var(--color-border);
        border-radius: 16px;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        overflow: hidden;
        background: #ffffff;

        &:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
        }

        .card-header {
          padding: 20px 20px 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;

          .card-title {
            font-size: 16px;
            font-weight: 600;
            color: var(--color-text-1);
          }

          :deep(.arco-tag) {
            background: var(--color-fill-2);
            border: none;
            color: var(--color-text-2);
            padding: 0 8px;
            border-radius: 4px;
          }
        }

        .card-content {
          padding: 0 20px 20px;

          .info-item {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 8px;
            color: var(--color-text-3);

            &:last-child {
              margin-bottom: 0;
            }

            .info-icon {
              font-size: 14px;
            }

            .info-text {
              font-size: 13px;
            }
          }
        }

        .card-actions {
          padding: 16px 20px;
          background: #ffffff;
          border-top: 1px solid rgba(var(--gray-3), 0.3);
          display: flex;
          justify-content: space-between;
          align-items: center;

          .left-actions {
            display: flex;
            gap: 8px;
          }

          .right-actions {
            display: flex;
            align-items: center;
          }

          :deep(.arco-btn) {
            font-weight: 500;
            transition: all 0.3s ease;

            &[shape="round"] {
              padding: 0 16px;
              height: 32px;
              font-size: 13px;

              &[type="primary"] {
                background: rgb(var(--primary-6));
                border-color: rgb(var(--primary-6));
                color: #fff;

                &:hover {
                  background: rgb(var(--primary-5));
                  border-color: rgb(var(--primary-5));
                  transform: translateY(-1px);
                }
              }

              &[type="outline"] {
                color: var(--color-text-2);
                border-color: var(--color-border);
                background: var(--color-bg-2);

                &:hover {
                  color: rgb(var(--primary-6));
                  border-color: rgb(var(--primary-6));
                  background: var(--color-fill-2);
                  transform: translateY(-1px);
                }
              }
            }

            &[shape="circle"] {
              width: 24px;
              height: 24px;
              padding: 0;
              color: var(--color-text-2);
              border-color: var(--color-border);
              background: var(--color-bg-2);

              .arco-icon {
                font-size: 12px;
              }

              &:hover {
                color: rgb(var(--primary-6));
                border-color: rgb(var(--primary-6));
                background: var(--color-fill-2);
                transform: translateY(-1px);
              }

              &[status="danger"] {
                &:hover {
                  color: rgb(var(--danger-6));
                  border-color: rgb(var(--danger-6));
                  background: var(--color-danger-light-1);
                }
              }
            }
          }
        }
      }
    }
  }
}
</style> 