import type { Router } from "vue-router";
import { startProgress, endProgress } from "./progressGuard";
import { setPageTitle } from "./titleGuard";
import { handleKeepAlive } from "./keepAliveGuard";
import {
  isAuthenticated,
  handleAuthenticatedNavigation,
  handleUnauthenticatedNavigation
} from "./authGuard";

/**
 * 设置路由守卫
 */
export function setupRouterGuards(router: Router): void {
  // 全局前置守卫
  router.beforeEach(async (to, from, next) => {
    // 设置页面标题
    setPageTitle(to);

    // 开始进度条
    startProgress(to);

    // 处理缓存路由
    handleKeepAlive(to, from);

    // 认证检查
    if (isAuthenticated()) {
      await handleAuthenticatedNavigation(to, from, next, router);
    } else {
      handleUnauthenticatedNavigation(to, next);
    }
  });

  // 全局后置守卫
  router.afterEach(to => {
    endProgress(to);
  });
}

// 导出各个守卫模块，方便单独使用
export * from "./constants";
export * from "./progressGuard";
export * from "./titleGuard";
export * from "./keepAliveGuard";
export * from "./authGuard";
