import { cloneDeep } from "@pureadmin/utils";
import {
  router,
  constantRoutes,
  initConstantRoutes,
  resetLoadedPaths,
  remainingPaths
} from "./instance";
import { setupRouterGuards } from "./guards";
import { formatTwoStageRoutes, formatFlatteningRoutes, ascending } from "./utils";
import { buildHierarchyTree } from "@/utils/tree";
import remainingRouter from "./modules/remaining";

const modules: Record<string, any> = import.meta.glob(
  ["./modules/**/*.ts", "!./modules/**/remaining.ts"],
  {
    eager: true
  }
);

const routes = [];

Object.keys(modules).forEach(key => {
  routes.push(modules[key].default);
});

export function resetRouter() {
  router.clearRoutes();
  for (const route of initConstantRoutes.concat(...(remainingRouter as any))) {
    router.addRoute(route);
  }
  router.options.routes = formatTwoStageRoutes(
    formatFlatteningRoutes(buildHierarchyTree(ascending(routes.flat(Infinity))))
  );

  import("@/store/modules/permission").then(({ usePermissionStoreHook }) => {
    usePermissionStoreHook().clearAllCachePage();
  });
  resetLoadedPaths();
}

setupRouterGuards(router);

export {
  router,
  constantRoutes,
  remainingPaths
};

export default router;
