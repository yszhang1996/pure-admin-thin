import NProgress from "@/utils/progress";
import type { RouteLocationNormalized } from "vue-router";

/**
 * 已加载的页面路径集合
 */
const loadedPaths = new Set<string>();

/**
 * 检查页面是否已加载
 */
export function isPageLoaded(path: string): boolean {
  return loadedPaths.has(path);
}

/**
 * 标记页面已加载
 */
export function markPageLoaded(path: string): void {
  loadedPaths.add(path);
}

/**
 * 重置已加载页面记录
 */
export function resetLoadedPaths(): void {
  loadedPaths.clear();
}

/**
 * 开始进度条
 */
export function startProgress(to: RouteLocationNormalized): void {
  if (!isPageLoaded(to.path)) {
    NProgress.start();
  }
}

/**
 * 结束进度条
 */
export function endProgress(to: RouteLocationNormalized): void {
  markPageLoaded(to.path);
  NProgress.done();
}
