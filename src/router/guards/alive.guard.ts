import { handleAliveRoute } from "@/router/utils";
import type { GuardContext } from "./type";

/** keep-alive缓存守卫 */
export function aliveGuard({ to, from }: GuardContext): boolean {
  if (to.meta?.keepAlive) {
    handleAliveRoute(to as any, "add");
    // 页面整体刷新和点击标签页刷新
    if (from.name === undefined || from.name === "Redirect") {
      handleAliveRoute(to as any);
    }
  }

  return true;
}
