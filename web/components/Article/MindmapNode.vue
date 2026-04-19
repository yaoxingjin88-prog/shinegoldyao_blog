<template>
  <div class="mm-node" :class="{ 'mm-root': root }">
    <div class="mm-label-wrap">
      <span class="mm-label" :class="levelClass">{{ node.title }}</span>
    </div>
    <div v-if="node.children?.length" class="mm-children">
      <MindmapNode
        v-for="(child, i) in node.children"
        :key="i"
        :node="child"
        :level="(level || 0) + 1"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Node { title: string; children?: Node[] }
const props = withDefaults(
  defineProps<{ node: Node; root?: boolean; level?: number }>(),
  { root: false, level: 0 },
)

const levelClass = computed(() => {
  if (props.root || props.level === 0) return 'mm-level-0'
  if (props.level === 1) return 'mm-level-1'
  if (props.level === 2) return 'mm-level-2'
  return 'mm-level-3'
})
</script>

<style scoped>
/* 水平树形布局：使用 flex + ::before/::after 画连线 */
.mm-node {
  display: flex;
  align-items: center;
  position: relative;
}
.mm-label-wrap {
  padding: 6px 0;
  position: relative;
  z-index: 1;
}
.mm-label {
  display: inline-block;
  padding: 6px 14px;
  border-radius: 10px;
  font-size: 13px;
  line-height: 1.4;
  white-space: nowrap;
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  border: 1px solid transparent;
  transition: all 0.2s ease;
  cursor: default;
}
.mm-label:hover {
  transform: translateX(2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
.mm-level-0 {
  background: linear-gradient(135deg, #7c3aed, #3b82f6);
  color: #fff;
  font-weight: 600;
  font-size: 14px;
  box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
}
.mm-level-1 {
  background: rgba(59, 130, 246, 0.1);
  color: #2563eb;
  border-color: rgba(59, 130, 246, 0.3);
  font-weight: 500;
}
:global(.dark) .mm-level-1 {
  background: rgba(59, 130, 246, 0.15);
  color: #93c5fd;
  border-color: rgba(59, 130, 246, 0.4);
}
.mm-level-2 {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
  border-color: rgba(16, 185, 129, 0.3);
}
:global(.dark) .mm-level-2 {
  background: rgba(16, 185, 129, 0.15);
  color: #6ee7b7;
  border-color: rgba(16, 185, 129, 0.4);
}
.mm-level-3 {
  background: rgba(148, 163, 184, 0.1);
  color: #475569;
  border-color: rgba(148, 163, 184, 0.3);
  font-size: 12px;
}
:global(.dark) .mm-level-3 {
  background: rgba(148, 163, 184, 0.15);
  color: #cbd5e1;
  border-color: rgba(148, 163, 184, 0.4);
}

/* 子节点容器 */
.mm-children {
  display: flex;
  flex-direction: column;
  margin-left: 28px;
  position: relative;
}
/* 父→子 的水平连线 */
.mm-node:not(.mm-root) > .mm-label-wrap::before {
  content: '';
  position: absolute;
  left: -28px;
  top: 50%;
  width: 28px;
  height: 2px;
  background: linear-gradient(to right, rgba(100, 116, 139, 0.4), rgba(100, 116, 139, 0.2));
  border-radius: 2px;
}
/* 兄弟间的垂直连线（在子容器左边画一条竖线） */
.mm-children::before {
  content: '';
  position: absolute;
  left: 0;
  top: 20px;
  bottom: 20px;
  width: 2px;
  background: rgba(100, 116, 139, 0.25);
  border-radius: 2px;
}
/* 单子节点时无需竖线 */
.mm-children:has(> .mm-node:only-child)::before {
  display: none;
}
</style>
