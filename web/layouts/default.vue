<template>
  <div class="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 relative overflow-x-hidden">
    <!-- 全局背景光晕 - 移动端降级 -->
    <div class="fixed top-[-20%] left-[-10%] rounded-full bg-purple-300/30 dark:bg-purple-700/20 pointer-events-none w-[200px] h-[200px] blur-[40px] md:w-[500px] md:h-[500px] md:blur-[120px] md:animate-pulse" style="animation-duration: 8s"></div>
    <div class="fixed bottom-[-20%] right-[-10%] rounded-full bg-cyan-300/30 dark:bg-cyan-700/20 pointer-events-none w-[200px] h-[200px] blur-[40px] md:w-[600px] md:h-[600px] md:blur-[150px] md:animate-pulse" style="animation-duration: 12s; animation-delay: 2s"></div>
    <AppNavbar />
    <AppSidebar />
    <main class="flex-1 relative z-10">
      <slot />
    </main>
    <AppFooter />
    <ClientOnly>
      <LazyAppMusicPlayer />
    </ClientOnly>
  </div>
</template>
