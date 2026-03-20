import Cookies from "js-cookie";
import { isUrl, openLink, isAllEmpty, storageLocal } from "@pureadmin/utils";
import {
  userKey,
  removeToken,
  multipleTabsKey,
  type DataInfo
} from "@/utils/auth";
import { whiteList } from "./constants";
import { initRouter, findRouteByPath, getTopMenu } from "../utils";
import { usePermissionStoreHook } from "@/store/modules/permission";
import { useMultiTagsStoreHook } from "@/store/modules/multiTags";
import type { Router, RouteLocationNormalized } from "vue-router";

const { VITE_HIDE_HOME } = import.meta.env;

/**
 * 检查用户是否已登录
 */
export function isAuthenticated(): boolean {
  const userInfo = storageLocal().getItem<DataInfo<number>>(userKey);
  return !!(Cookies.get(multipleTabsKey) && userInfo);
}

/**
 * 获取用户信息
 */
export function getUserInfo(): DataInfo<number> | null {
  return storageLocal().getItem<DataInfo<number>>(userKey);
}

/**
 * 检查用户是否有权限访问目标路由
 */
export function hasRoutePermission(
  to: RouteLocationNormalized,
  userInfo: DataInfo<number> | null
): boolean {
  if (to.meta?.roles && Array.isArray(to.meta.roles)) {
    if (isAllEmpty(to.meta.roles) || isAllEmpty(userInfo?.roles)) {
      return true;
    }
    return (to.meta.roles as string[]).some((role: string) =>
      userInfo?.roles?.includes(role)
    );
  }
  return true;
}

/**
 * 检查是否是隐藏首页后的welcome路由访问
 */
export function isHiddenHomeAccess(to: RouteLocationNormalized): boolean {
  return VITE_HIDE_HOME === "true" && to.fullPath === "/welcome";
}

/**
 * 处理已登录用户的导航逻辑
 */
export async function handleAuthenticatedNavigation(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: any,
  router: Router
): Promise<void> {
  const userInfo = getUserInfo();

  // 无权限跳转403页面
  if (!hasRoutePermission(to, userInfo)) {
    next({ path: "/error/403" });
    return;
  }

  // 开启隐藏首页后在浏览器地址栏手动输入首页welcome路由则跳转到404页面
  if (isHiddenHomeAccess(to)) {
    next({ path: "/error/404" });
    return;
  }

  // 如果已经登录并存在登录信息后不能跳转到路由白名单，而是继续保持在当前页面
  if (whiteList.includes(to.fullPath)) {
    next(from.fullPath);
    return;
  }

  // 处理外链
  const externalLink = isUrl(to?.name as string);
  if (externalLink) {
    openLink(to?.name as string);
    return;
  }

  // 处理刷新时的动态路由初始化
  if (
    usePermissionStoreHook().wholeMenus.length === 0 &&
    to.path !== "/login"
  ) {
    await initDynamicRouter(to, next, router);
    return;
  }

  next();
}

/**
 * 初始化动态路由
 */
async function initDynamicRouter(
  to: RouteLocationNormalized,
  next: any,
  _routerInstance: Router
): Promise<void> {
  try {
    const newRouter = (await initRouter()) as Router;

    if (!useMultiTagsStoreHook().getMultiTagsCache) {
      const { path } = to;
      const route = findRouteByPath(path, newRouter.options.routes[0].children);
      getTopMenu(true);

      // query、params模式路由传参数的标签页不在此处处理
      if (route && route.meta?.title) {
        if (isAllEmpty(route.parentId) && route.meta?.backstage) {
          // 此处为动态顶级路由（目录）
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

    // 确保动态路由完全加入路由列表并且不影响静态路由
    if (isAllEmpty(to.name)) {
      next({ ...to, replace: true });
    } else {
      next();
    }
  } catch (error) {
    console.error("Failed to initialize dynamic router:", error);
    removeToken();
    next({ path: "/login" });
  }
}

/**
 * 处理未登录用户的导航逻辑
 */
export function handleUnauthenticatedNavigation(
  to: RouteLocationNormalized,
  next: any
): void {
  if (to.path !== "/login") {
    if (whiteList.includes(to.path)) {
      next();
    } else {
      removeToken();
      next({ path: "/login", query: { redirect: to.fullPath } });
    }
  } else {
    next();
  }
}
