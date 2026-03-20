import NProgress from "@/utils/progress";
import type { GuardContext } from "./type";

/** 进度条守卫 */
export function progressGuard({ to }: GuardContext): boolean {
  to.meta.loaded = (to.meta as any).loaded;

  if (!to.meta.loaded) {
    NProgress.start();
  }

  return true;
}

/** 进度条结束守卫（用于afterEach） */
export function progressDoneGuard(_to: any) {
  NProgress.done();
}
