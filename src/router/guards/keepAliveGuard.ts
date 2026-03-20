import { handleAliveRoute } from "../utils";
import type { RouteLocationNormalized } from "vue-router";

/**
 * 处理缓存路由
 */
export function handleKeepAlive(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized
): void {
  if (to.meta?.keepAlive) {
    handleAliveRoute(to, "add");

    // 页面整体刷新和点击标签页刷新
    if (from.name === undefined || from.name === "Redirect") {
      handleAliveRoute(to);
    }
  }
}
