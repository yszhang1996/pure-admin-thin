import type { Router } from "vue-router";
import { progressGuard, progressDoneGuard } from "./progress.guard";
import { titleGuard } from "./title.guard";
import { aliveGuard } from "./alive.guard";
import { permissionGuard, whiteListRedirectGuard } from "./permission.guard";
import { externalLinkGuard } from "./external.guard";
import { dynamicRouteGuard } from "./dynamic.guard";
import type { GuardContext } from "./type";

export * from "./type";

/**
 * 路由守卫执行管道
 * 按顺序执行守卫函数，任何一个守卫返回false则终止执行
 */
async function runGuardPipeline(
  context: GuardContext,
  guards: Function[]
): Promise<boolean> {
  for (const guard of guards) {
    const result = await guard(context);
    if (result === false) {
      return false;
    }
  }
  return true;
}

/**
 * 创建路由守卫管理器
 * @param router 路由实例
 */
export function createRouterGuard(router: Router) {
  // 记录已经加载的页面路径
  const loadedPaths = new Set<string>();

  // 重置已加载页面记录
  function resetLoadedPaths() {
    loadedPaths.clear();
  }

  // 全局前置守卫
  router.beforeEach(async (to, from, next) => {
    // 注入loaded状态
    (to.meta as any).loaded = loadedPaths.has(to.path);

    const context: GuardContext = {
      to: to as any,
      from,
      next,
      router
    };

    // 第一阶段：基础处理守卫（总是执行）
    const baseGuards = [progressGuard, aliveGuard, titleGuard];

    const basePassed = await runGuardPipeline(context, baseGuards);
    if (!basePassed) return;

    // 第二阶段：权限验证守卫
    const permissionPassed = permissionGuard(context);
    if (!permissionPassed) return;

    // 第三阶段：白名单重定向守卫
    const whiteListPassed = whiteListRedirectGuard(context);
    if (!whiteListPassed) return;

    // 第四阶段：外部链接处理
    const externalPassed = externalLinkGuard(context);
    if (!externalPassed) return;

    // 第五阶段：动态路由初始化（可能需要异步）
    const dynamicPassed = await dynamicRouteGuard(context);
    if (!dynamicPassed) return;

    // 所有守卫通过，继续导航
    next();
  });

  // 全局后置守卫
  router.afterEach(to => {
    loadedPaths.add(to.path);
    progressDoneGuard(to);
  });

  return {
    resetLoadedPaths,
    loadedPaths
  };
}
