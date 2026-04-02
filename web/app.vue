<template>
  <NuxtLayout>
    <NuxtPage :transition="{ name: 'page', mode: 'out-in' }" />
  </NuxtLayout>
</template>

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
