import type { Router } from "vue-router";
import { handleAliveRoute } from "../utils";

export function setupKeepAliveGuard(router: Router) {
  router.beforeEach((to, from, next) => {
    if (to.meta?.keepAlive) {
      handleAliveRoute(to, "add");
      if (from.name === undefined || from.name === "Redirect") {
        handleAliveRoute(to);
      }
    }
    next();
  });
}
