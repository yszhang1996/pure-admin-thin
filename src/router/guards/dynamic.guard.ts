import type { Router } from "vue-router";
import Cookies from "js-cookie";
import { isAllEmpty, storageLocal } from "@pureadmin/utils";
import { initRouter, getTopMenu, findRouteByPath } from "../utils";
import { usePermissionStoreHook } from "@/store/modules/permission";
import { useMultiTagsStoreHook } from "@/store/modules/multiTags";
import { userKey, multipleTabsKey, type DataInfo } from "@/utils/auth";

export function setupDynamicRouteGuard(router: Router) {
  router.beforeEach(async (to, _from, next) => {
    const userInfo = storageLocal().getItem<DataInfo<number>>(userKey);
    const hasToken = !!(Cookies.get(multipleTabsKey) && userInfo);

    if (!hasToken) {
      next();
      return;
    }

    if (_from?.name) {
      next();
      return;
    }

    if (
      usePermissionStoreHook().wholeMenus.length === 0 &&
      to.path !== "/login"
    ) {
      try {
        const routerInstance = await initRouter();
        if (!useMultiTagsStoreHook().getMultiTagsCache) {
          const { path } = to;
          const route = findRouteByPath(
            path,
            routerInstance.options.routes[0].children
          );
          getTopMenu(true);

          if (route && route.meta?.title) {
            if (isAllEmpty(route.parentId) && route.meta?.backstage) {
              const { path, name, meta } = route.children[0];
              useMultiTagsStoreHook().handleTags("push", {
                path,
                name,
                meta
              });
            } else {
              const { path, name, meta } = route;
              useMultiTagsStoreHook().handleTags("push", {
                path,
                name,
                meta
              });
            }
          }
        }

        if (isAllEmpty(to.name)) {
          next(to.fullPath);
          return;
        }
      } catch (error) {
        console.error("Dynamic route initialization failed:", error);
      }
    }
    next();
  });
}
