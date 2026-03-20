import Cookies from "js-cookie";
import { storageLocal } from "@pureadmin/utils";
import { isOneOfArray } from "@/router/utils";
import {
  removeToken,
  multipleTabsKey,
  userKey,
  type DataInfo
} from "@/utils/auth";
import type { GuardContext } from "./type";

const { VITE_HIDE_HOME } = import.meta.env;

/** 权限验证守卫 */
export function permissionGuard({ to, next }: GuardContext): boolean {
  const userInfo = storageLocal().getItem<DataInfo<number>>(userKey);
  const hasToken = Cookies.get(multipleTabsKey) && userInfo;

  if (!hasToken) {
    if (to.path !== "/login") {
      const whiteList = ["/login"];
      if (whiteList.indexOf(to.path) !== -1) {
        next();
      } else {
        removeToken();
        next({ path: "/login" });
      }
    } else {
      next();
    }
    return false;
  }

  // 无权限跳转403页面
  if (to.meta?.roles && !isOneOfArray(to.meta?.roles, userInfo?.roles || [])) {
    next({ path: "/error/403" });
    return false;
  }

  // 开启隐藏首页后在浏览器地址栏手动输入首页welcome路由则跳转到404页面
  if (VITE_HIDE_HOME === "true" && to.fullPath === "/welcome") {
    next({ path: "/error/404" });
    return false;
  }

  return true;
}

/** 白名单重定向守卫 */
export function whiteListRedirectGuard({
  to,
  from,
  next
}: GuardContext): boolean {
  const whiteList = ["/login"];

  if (whiteList.includes(to.fullPath)) {
    next(from.fullPath);
    return false;
  }

  return true;
}
