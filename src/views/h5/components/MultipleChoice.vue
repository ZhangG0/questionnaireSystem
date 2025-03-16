<template>
  <div class="multiple-choice">
    <van-checkbox-group v-model="selectedValues" :disabled="disabled">
      <van-checkbox 
        v-for="option in question.optionList" 
        :key="option.optionId"
        :name="option.optionId"
      >
        {{ option.optionText }}
      </van-checkbox>
    </van-checkbox-group>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Question } from '@/types/survey'

const props = defineProps<{
  modelValue: string[]
  question: Question
  disabled: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void
}>()

const selectedValues = ref(props.modelValue)

watch(selectedValues, (newValue) => {
  emit('update:modelValue', newValue)
})

watch(() => props.modelValue, (newValue) => {
  selectedValues.value = newValue
})
</script>

<style scoped lang="scss">
.multiple-choice {
  .van-checkbox {
    margin-bottom: 12px;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
}
</style> 