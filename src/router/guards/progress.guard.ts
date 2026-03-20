import type { Router } from "vue-router";
import NProgress from "@/utils/progress";
import { isRouteLoaded } from "../instance";

export function setupProgressGuard(router: Router) {
  router.beforeEach((to, _from, next) => {
    to.meta.loaded = isRouteLoaded(to.path);

    if (!to.meta.loaded) {
      NProgress.start();
    }
    next();
  });

  router.afterEach(() => {
    NProgress.done();
  });
}
