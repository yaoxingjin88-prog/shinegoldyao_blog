<template>
  <div class="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 relative overflow-x-hidden">
    <!-- 全局背景光晕 -->
    <div class="fixed top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-purple-300/30 dark:bg-purple-700/20 blur-[120px] pointer-events-none animate-pulse" style="animation-duration: 8s"></div>
    <div class="fixed bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-cyan-300/30 dark:bg-cyan-700/20 blur-[150px] pointer-events-none animate-pulse" style="animation-duration: 12s; animation-delay: 2s"></div>
    <AppNavbar />
    <AppSidebar />
    <main class="flex-1 relative z-10">
      <slot />
    </main>
    <AppFooter />
    <AppMusicPlayer />
  </div>
</template>
