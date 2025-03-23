<template>
  <div class="side-menu">
    <van-cell-group>
      <van-cell
        v-for="menu in menus"
        :key="menu.path"
        :title="menu.title"
        :to="menu.path"
        :class="{ active: currentPath === menu.path }"
      >
        <template #icon>
          <van-icon :name="menu.icon" class="menu-icon" />
        </template>
      </van-cell>
    </van-cell-group>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const currentPath = computed(() => route.path)

const menus = [
  {
    title: '问卷管理',
    path: '/pc/questionnaireManagement',
    icon: 'notes-o'
  },
  {
    title: '用户管理',
    path: '/pc/usersManagement',
    icon: 'friends-o'
  }
]
</script>

<style scoped lang="scss">
.side-menu {
  height: 100%;
  padding-top: 20px;
  background-color: #fff;
  border-right: 1px solid #f0f0f0;

  :deep(.van-cell) {
    font-size: 16px;
    line-height: 24px;
    padding: 12px 20px;

    &.active {
      background: #e6f7ff;
      color: #1890ff;
      border-right: 3px solid #1890ff;
      .menu-icon {
        color: #1890ff;
      }
    }

    &:hover {
      background: #f5f5f5;
      color: #1890ff;
      .menu-icon {
        color: #1890ff;
      }
    }

    .van-cell__title {
      color: inherit;
    }
  }

  .menu-icon {
    font-size: 20px;
    margin-right: 12px;
    color: #595959;
  }
}
</style>
