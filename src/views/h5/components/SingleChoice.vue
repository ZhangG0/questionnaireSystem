<template>
  <div class="single-choice">
    <van-radio-group v-model="selectedValue" :disabled="disabled">
      <van-radio 
        v-for="option in question.optionList" 
        :key="option.optionId"
        :name="option.optionId"
      >
        {{ option.optionText }}
      </van-radio>
    </van-radio-group>
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

const selectedValue = ref(props.modelValue)

watch(selectedValue, (newValue) => {
  emit('update:modelValue', newValue)
})

watch(() => props.modelValue, (newValue) => {
  selectedValue.value = newValue
})
</script>

<style scoped lang="scss">
.single-choice {
  .van-radio {
    margin-bottom: 12px;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
}
</style> 