<template>
  <div class="date-picker">
    <van-field
      v-model="selectedDate"
      is-link
      readonly
      :disabled="disabled"
      placeholder="请选择日期"
      @click="showPicker = true"
    />
    <van-popup v-model:show="showPicker" position="bottom">
      <van-datetime-picker
        type="date"
        title="选择日期"
        v-model="currentDate"
        @confirm="onConfirm"
        @cancel="showPicker = false"
      />
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Question } from '@/types/survey'

const props = defineProps<{
  modelValue: string
  question: Question
  disabled: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const selectedDate = ref(props.modelValue || '')
const currentDate = ref(new Date())
const showPicker = ref(false)

const onConfirm = (value: Date) => {
  // 格式化日期为 YYYY-MM-DD 格式
  const formattedDate = `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`
  selectedDate.value = formattedDate
  showPicker.value = false
  emit('update:modelValue', formattedDate)
}

watch(() => props.modelValue, (newValue) => {
  selectedDate.value = newValue
})
</script> 