<template>
  <Teleport to="body">
    <!-- ==================== 悬浮菜单 ==================== -->
    <Transition name="ai-menu-fade">
      <div
        v-if="menuVisible && selectedText"
        class="ai-floating-menu"
        :style="menuStyle"
        @mousedown.stop
      >
        <div class="ai-menu-header">
          <span class="ai-menu-icon">✨</span>
          <span>AI 助手</span>
        </div>
        <div class="ai-menu-actions">
          <button
            v-for="act in actions"
            :key="act.key"
            class="ai-action-btn"
            :disabled="loading"
            @click="handleAction(act.key)"
          >
            <span class="ai-action-icon">{{ act.icon }}</span>
            <span>{{ act.label }}</span>
          </button>
          <button class="ai-action-btn ai-action-seo" :disabled="loading" @click="$emit('generate-seo')">
            <span class="ai-action-icon">🏷️</span>
            <span>生成 SEO TDK</span>
          </button>
        </div>
      </div>
    </Transition>

    <!-- ==================== 结果预览 ==================== -->
    <Transition name="ai-menu-fade">
      <div v-if="previewVisible" class="ai-preview-overlay" @click.self="closePreview">
        <div class="ai-preview-card">
          <div class="ai-preview-header">
            <span>{{ previewTitle }}</span>
            <button class="ai-preview-close" @click="closePreview">&times;</button>
          </div>
          <div v-if="loading" class="ai-preview-loading">
            <div class="ai-spinner"></div>
            <span>AI 正在{{ previewTitle }}…</span>
          </div>
          <template v-else>
            <div class="ai-preview-diff">
              <div class="ai-diff-col">
                <div class="ai-diff-label">原文</div>
                <div class="ai-diff-content">{{ selectedText }}</div>
              </div>
              <div class="ai-diff-arrow">→</div>
              <div class="ai-diff-col">
                <div class="ai-diff-label">AI 结果</div>
                <div class="ai-diff-content ai-diff-result">{{ previewResult }}</div>
              </div>
            </div>
            <div class="ai-preview-footer">
              <button class="ai-btn ai-btn-primary" @click="applyResult">
                ✅ 应用
              </button>
              <button class="ai-btn ai-btn-secondary" @click="closePreview">
                取消
              </button>
            </div>
          </template>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { articleApi } from '../api'

const props = defineProps<{
  /** MdEditor 组件的 editorId，默认 'md-editor-v3' */
  editorId?: string
  /** 文章标题，用作 AI 上下文 */
  articleTitle?: string
}>()

const emit = defineEmits<{
  (e: 'replace', payload: { start: number; end: number; text: string }): void
  (e: 'append', payload: { position: number; text: string }): void
  (e: 'generate-seo'): void
}>()

// ─── 操作列表 ───
const actions = [
  { key: 'polish' as const, icon: '💎', label: 'AI 润色' },
  { key: 'rewrite' as const, icon: '🔄', label: 'AI 重写' },
  { key: 'continue' as const, icon: '✏️', label: 'AI 续写' },
  { key: 'condense' as const, icon: '📐', label: 'AI 精简' },
]

type ActionKey = 'polish' | 'rewrite' | 'continue' | 'condense'

// ─── 状态 ───
const menuVisible = ref(false)
const menuX = ref(0)
const menuY = ref(0)
const selectedText = ref('')
const selectionStart = ref(0)
const selectionEnd = ref(0)

const previewVisible = ref(false)
const previewTitle = ref('')
const previewResult = ref('')
const loading = ref(false)
const currentAction = ref<ActionKey | null>(null)

// 菜单定位（跟随鼠标 / 选区）
const menuStyle = computed(() => ({
  left: `${menuX.value}px`,
  top: `${menuY.value}px`,
}))

// ─── 获取编辑器 textarea ───
function getTextarea(): HTMLTextAreaElement | null {
  const id = props.editorId || 'md-editor-v3'
  return document.querySelector(`#${id} .cm-content`) as HTMLTextAreaElement | null
    || document.querySelector(`#${id} textarea`) as HTMLTextAreaElement | null
}

// ─── 监听选区变化 ───
function onMouseUp(e: MouseEvent) {
  // 延迟一帧确保选区已更新
  requestAnimationFrame(() => {
    const ta = getTextarea()
    if (!ta) return

    // 检查鼠标事件是否发生在编辑器内
    const editorEl = document.getElementById(props.editorId || 'md-editor-v3')
    if (!editorEl?.contains(e.target as Node)) {
      menuVisible.value = false
      return
    }

    // 尝试通过 CodeMirror 获取选区（md-editor-v3 v4+ 使用 CodeMirror）
    const cmContent = editorEl.querySelector('.cm-content')
    if (cmContent) {
      const sel = window.getSelection()
      if (sel && sel.rangeCount > 0 && sel.toString().trim().length > 0) {
        const text = sel.toString().trim()
        if (text.length < 2) { menuVisible.value = false; return }

        selectedText.value = text
        // 计算在 content 中的位置（粗略匹配）
        selectionStart.value = -1
        selectionEnd.value = -1

        // 定位菜单
        const range = sel.getRangeAt(0)
        const rect = range.getBoundingClientRect()
        positionMenu(rect.left + rect.width / 2, rect.top)
        menuVisible.value = true
        return
      }
      menuVisible.value = false
      return
    }

    // Fallback: 传统 textarea
    if (ta.tagName === 'TEXTAREA') {
      const start = ta.selectionStart
      const end = ta.selectionEnd
      if (start === end) { menuVisible.value = false; return }
      const text = ta.value.substring(start, end).trim()
      if (text.length < 2) { menuVisible.value = false; return }

      selectedText.value = text
      selectionStart.value = start
      selectionEnd.value = end

      // 使用鼠标位置定位菜单
      positionMenu(e.clientX, e.clientY)
      menuVisible.value = true
    }
  })
}

function positionMenu(x: number, y: number) {
  const menuW = 200
  const menuH = 260
  // 保证不超出视口
  menuX.value = Math.min(x - menuW / 2, window.innerWidth - menuW - 8)
  menuX.value = Math.max(8, menuX.value)
  // 菜单显示在选区上方
  menuY.value = y - menuH - 8
  if (menuY.value < 8) {
    menuY.value = y + 24
  }
}

function onMouseDown(e: MouseEvent) {
  const target = e.target as Node
  // 点击菜单本身或预览弹窗时不关闭
  const floatingMenu = document.querySelector('.ai-floating-menu')
  const previewCard = document.querySelector('.ai-preview-overlay')
  if (floatingMenu?.contains(target) || previewCard?.contains(target)) return
  const editorEl = document.getElementById(props.editorId || 'md-editor-v3')
  if (!editorEl?.contains(target)) {
    menuVisible.value = false
  }
}

function onKeyDown() {
  menuVisible.value = false
}

// ─── AI 操作 ───
async function handleAction(action: ActionKey) {
  if (!selectedText.value || loading.value) return

  currentAction.value = action
  const labelMap: Record<ActionKey, string> = {
    polish: '润色', rewrite: '重写', continue: '续写', condense: '精简',
  }
  previewTitle.value = labelMap[action]
  previewResult.value = ''
  previewVisible.value = true
  menuVisible.value = false
  loading.value = true

  try {
    const res = await articleApi.aiWriteAssist({
      text: selectedText.value,
      action,
      context: props.articleTitle,
    })
    if (!res?.result) {
      ElMessage.warning('AI 返回为空，请检查 DASHSCOPE_API_KEY 配置')
      previewVisible.value = false
      return
    }
    previewResult.value = res.result
  } catch (err: any) {
    ElMessage.error(err?.message || 'AI 写作辅助请求失败')
    previewVisible.value = false
  } finally {
    loading.value = false
  }
}

function applyResult() {
  if (!previewResult.value) return

  if (currentAction.value === 'continue') {
    // 续写：在选区末尾追加
    emit('append', { position: selectionEnd.value, text: previewResult.value })
  } else {
    // 润色/重写/精简：替换选中文本
    emit('replace', { start: selectionStart.value, end: selectionEnd.value, text: previewResult.value })
  }

  ElMessage.success('已应用 AI 结果')
  closePreview()
}

function closePreview() {
  previewVisible.value = false
  previewResult.value = ''
  loading.value = false
  currentAction.value = null
}

// ─── 生命周期 ───
onMounted(() => {
  document.addEventListener('mouseup', onMouseUp)
  document.addEventListener('mousedown', onMouseDown)
  document.addEventListener('keydown', onKeyDown)
})

onBeforeUnmount(() => {
  document.removeEventListener('mouseup', onMouseUp)
  document.removeEventListener('mousedown', onMouseDown)
  document.removeEventListener('keydown', onKeyDown)
})
</script>

<style scoped>
/* ─── 悬浮菜单 ─── */
.ai-floating-menu {
  position: fixed;
  z-index: 9999;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 8px;
  min-width: 180px;
  border: 1px solid #e8e8e8;
  backdrop-filter: blur(12px);
}

.ai-menu-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px 8px;
  font-size: 13px;
  font-weight: 600;
  color: #333;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 4px;
}

.ai-menu-icon {
  font-size: 16px;
}

.ai-menu-actions {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.ai-action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 10px;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  color: #333;
  transition: all 0.15s;
  text-align: left;
}

.ai-action-btn:hover:not(:disabled) {
  background: #f0f5ff;
  color: #1677ff;
}

.ai-action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.ai-action-icon {
  font-size: 15px;
  width: 20px;
  text-align: center;
}

.ai-action-seo {
  border-top: 1px solid #f0f0f0;
  margin-top: 4px;
  padding-top: 10px;
}

/* ─── 结果预览 ─── */
.ai-preview-overlay {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(4px);
}

.ai-preview-card {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  width: 720px;
  max-width: 90vw;
  max-height: 80vh;
  overflow: auto;
}

.ai-preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  border-bottom: 1px solid #f0f0f0;
}

.ai-preview-close {
  border: none;
  background: none;
  font-size: 22px;
  cursor: pointer;
  color: #999;
  padding: 0 4px;
  line-height: 1;
}
.ai-preview-close:hover { color: #333; }

.ai-preview-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 48px 20px;
  color: #666;
  font-size: 14px;
}

.ai-spinner {
  width: 36px;
  height: 36px;
  border: 3px solid #e8e8e8;
  border-top-color: #1677ff;
  border-radius: 50%;
  animation: ai-spin 0.8s linear infinite;
}

@keyframes ai-spin {
  to { transform: rotate(360deg); }
}

/* ─── Diff 对比 ─── */
.ai-preview-diff {
  display: flex;
  gap: 12px;
  padding: 20px;
  align-items: stretch;
}

.ai-diff-col {
  flex: 1;
  min-width: 0;
}

.ai-diff-label {
  font-size: 12px;
  font-weight: 600;
  color: #999;
  text-transform: uppercase;
  margin-bottom: 8px;
}

.ai-diff-content {
  background: #fafafa;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 12px;
  font-size: 14px;
  line-height: 1.7;
  color: #333;
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 40vh;
  overflow-y: auto;
}

.ai-diff-result {
  background: #f0f9eb;
  border-color: #b7eb8f;
}

.ai-diff-arrow {
  display: flex;
  align-items: center;
  font-size: 20px;
  color: #ccc;
  flex-shrink: 0;
}

.ai-preview-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 20px 16px;
  border-top: 1px solid #f0f0f0;
}

.ai-btn {
  padding: 8px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.2s;
}

.ai-btn-primary {
  background: #1677ff;
  color: #fff;
  border-color: #1677ff;
}
.ai-btn-primary:hover { background: #4096ff; border-color: #4096ff; }

.ai-btn-secondary {
  background: #fff;
  color: #666;
  border-color: #d9d9d9;
}
.ai-btn-secondary:hover { color: #1677ff; border-color: #1677ff; }

/* ─── Transition ─── */
.ai-menu-fade-enter-active,
.ai-menu-fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.ai-menu-fade-enter-from,
.ai-menu-fade-leave-to {
  opacity: 0;
  transform: translateY(4px);
}
</style>
