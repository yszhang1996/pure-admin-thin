import type { Router } from "vue-router";
import { setupProgressGuard } from "./progress.guard";
import { setupTitleGuard } from "./title.guard";
import { setupKeepAliveGuard } from "./keepalive.guard";
import { setupAuthGuard } from "./auth.guard";
import { setupDynamicRouteGuard } from "./dynamic.guard";

export function setupRouterGuards(router: Router) {
  setupProgressGuard(router);
  setupKeepAliveGuard(router);
  setupTitleGuard(router);
  setupAuthGuard(router);
  setupDynamicRouteGuard(router);
}

export {
  setupProgressGuard,
  setupTitleGuard,
  setupKeepAliveGuard,
  setupAuthGuard,
  setupDynamicRouteGuard
};
