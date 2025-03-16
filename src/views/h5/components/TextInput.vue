<template>
  <div class="text-input">
    <van-field
      v-model="inputValue"
      :disabled="disabled"
      :placeholder="question.optionList[0]?.optionText || '请输入'"
      type="textarea"
      rows="3"
    />
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

const inputValue = ref(props.modelValue)

watch(inputValue, (newValue) => {
  emit('update:modelValue', newValue)
})

watch(() => props.modelValue, (newValue) => {
  inputValue.value = newValue
})
</script> 