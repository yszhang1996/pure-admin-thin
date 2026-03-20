import { storageLocal, isAllEmpty } from "@pureadmin/utils";
import { initRouter, getTopMenu, findRouteByPath } from "@/router/utils";
import { usePermissionStoreHook } from "@/store/modules/permission";
import { useMultiTagsStoreHook } from "@/store/modules/multiTags";
import { userKey, type DataInfo } from "@/utils/auth";
import type { GuardContext } from "./type";
import Cookies from "js-cookie";
import { multipleTabsKey } from "@/utils/auth";

/** 动态路由初始化守卫 */
export async function dynamicRouteGuard({
  to,
  from,
  router
}: GuardContext): Promise<boolean> {
  const userInfo = storageLocal().getItem<DataInfo<number>>(userKey);
  const hasToken = Cookies.get(multipleTabsKey) && userInfo;

  // 刷新时需要重新初始化动态路由
  if (!from?.name && hasToken) {
    if (
      usePermissionStoreHook().wholeMenus.length === 0 &&
      to.path !== "/login"
    ) {
      try {
        const initializedRouter = await initRouter();

        if (!useMultiTagsStoreHook().getMultiTagsCache) {
          const { path } = to;
          const route = findRouteByPath(
            path,
            initializedRouter.options.routes[0].children
          );
          getTopMenu(true);

          if (route && route.meta?.title) {
            if (isAllEmpty((route as any).parentId) && route.meta?.backstage) {
              // 此处为动态顶级路由（目录）
              const { path, name, meta } = (route as any).children[0];
              useMultiTagsStoreHook().handleTags("push", {
                path,
                name,
                meta
              });
            } else {
              const { path, name, meta } = route as any;
              useMultiTagsStoreHook().handleTags("push", {
                path,
                name,
                meta
              });
            }
          }
        }

        // 确保动态路由完全加入路由列表
        if (isAllEmpty(to.name)) {
          router.push(to.fullPath);
          return false;
        }
      } catch (error) {
        console.error("Failed to initialize dynamic routes:", error);
      }
    }
  }

  return true;
}
