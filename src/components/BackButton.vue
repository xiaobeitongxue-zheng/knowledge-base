<template>
  <el-button class="back-button" @click="goBack" size="small" icon="ArrowLeft" type="default">
    返回
  </el-button>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
  router.back()
}
</script>

<style scoped>
.back-button {
  margin-bottom: 15px;
}
</style>