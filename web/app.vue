<template>
  <NuxtLayout>
    <NuxtPage :transition="{ name: 'page', mode: 'out-in' }" />
  </NuxtLayout>
  <ClientOnly>
    <LazyFlowerBurst v-if="!isMobile" />
    <LazyMeteorShower
      v-if="!isMobile"
      :active="meteorActive"
      :spawn-interval="spawnInterval"
      :base-speed="baseSpeed"
      :max-meteors="maxMeteors"
    />
  </ClientOnly>
</template>

<script setup lang="ts">
const { meteorActive, loadConfig, spawnInterval, baseSpeed, maxMeteors } = useMeteor()

const isMobile = ref(false)
onMounted(() => {
  isMobile.value = window.innerWidth < 768
  loadConfig()
})
</script>

<style>
.page-enter-active {
  transition: opacity 0.3s ease-out, transform 0.3s ease-out;
}
.page-leave-active {
  transition: opacity 0.2s ease-in, transform 0.2s ease-in;
}
.page-enter-from {
  opacity: 0;
  transform: translateY(24px);
}
.page-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}
</style>
