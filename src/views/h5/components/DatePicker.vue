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
      <van-date-picker
        v-model="selectedDate"
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

const selectedDate = ref(props.modelValue)
const showPicker = ref(false)

const onConfirm = (value: string) => {
  selectedDate.value = value
  showPicker.value = false
  emit('update:modelValue', value)
}

watch(() => props.modelValue, (newValue) => {
  selectedDate.value = newValue
})
</script> 