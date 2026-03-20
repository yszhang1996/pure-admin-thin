import type { Router, RouteLocationNormalized } from "vue-router";
import Cookies from "js-cookie";
import { isUrl, openLink, storageLocal } from "@pureadmin/utils";
import { type DataInfo, userKey, removeToken, multipleTabsKey } from "@/utils/auth";
import { isOneOfArray } from "../utils";

const whiteList = ["/login"];

const { VITE_HIDE_HOME } = import.meta.env;

export function hasToken(): boolean {
  const userInfo = storageLocal().getItem<DataInfo<number>>(userKey);
  return !!(Cookies.get(multipleTabsKey) && userInfo);
}

export function getUserInfo(): DataInfo<number> | null {
  return storageLocal().getItem<DataInfo<number>>(userKey);
}

export function isInWhiteList(path: string): boolean {
  return whiteList.includes(path);
}

export function checkRoutePermission(to: RouteLocationNormalized): boolean {
  const userInfo = getUserInfo();
  if (to.meta?.roles && userInfo?.roles) {
    return isOneOfArray(to.meta?.roles, userInfo.roles);
  }
  return true;
}

export function setupAuthGuard(router: Router) {
  router.beforeEach((to, _from, next) => {
    const externalLink = isUrl(to?.name as string);
    const userInfo = getUserInfo();
    const isLoggedIn = Cookies.get(multipleTabsKey) && userInfo;

    function toCorrectRoute() {
      whiteList.includes(to.fullPath) ? next(_from.fullPath) : next();
    }

    if (isLoggedIn) {
      if (!checkRoutePermission(to)) {
        next({ path: "/error/403" });
        return;
      }

      if (VITE_HIDE_HOME === "true" && to.fullPath === "/welcome") {
        next({ path: "/error/404" });
        return;
      }

      if (_from?.name) {
        if (externalLink) {
          openLink(to?.name as string);
          next(false);
          return;
        }
        toCorrectRoute();
      } else {
        toCorrectRoute();
      }
    } else {
      if (to.path !== "/login") {
        if (isInWhiteList(to.path)) {
          next();
        } else {
          removeToken();
          next({ path: "/login" });
        }
      } else {
        next();
      }
    }
  });
}
