import {
  type RouterHistory,
  type RouteRecordRaw,
  type RouteComponent,
  createWebHistory,
  createWebHashHistory
} from "vue-router";
import { useTimeoutFn } from "@vueuse/core";
import {
  isString,
  cloneDeep,
  storageLocal,
  isIncludeAllChildren
} from "@pureadmin/utils";
import { getConfig } from "@/config";
import { type menuType, routerArrays } from "@/layout/types";
import { router } from "./instance";
import {
  ascending,
  filterTree,
  isOneOfArray,
  findRouteByPath,
  formatFlatteningRoutes,
  filterNoPermissionTree,
  getParentPaths,
  getHistoryMode as getHistoryModeHelper
} from "./helper";

export {
  ascending,
  filterTree,
  isOneOfArray,
  findRouteByPath,
  formatFlatteningRoutes,
  filterNoPermissionTree,
  getParentPaths
};

const IFrame = () => import("@/layout/frame.vue");
const modulesRoutes = import.meta.glob("/src/views/**/*.{vue,tsx}");
import { getAsyncRoutes } from "@/api/routes";

function addPathMatch() {
  if (!router.hasRoute("pathMatch")) {
    router.addRoute({
      path: "/:pathMatch(.*)*",
      name: "PageNotFound",
      component: () => import("@/views/error/404.vue"),
      meta: {
        title: "404",
        showLink: false
      }
    });
  }
}

function handleAsyncRoutes(routeList: any[], permissionStore: any, multiTagsStore: any) {
  if (routeList.length === 0) {
    permissionStore.handleWholeMenus(routeList);
  } else {
    formatFlatteningRoutes(addAsyncRoutes(routeList)).map(
      (v: RouteRecordRaw) => {
        if (
          router.options.routes[0].children.findIndex(
            value => value.path === v.path
          ) !== -1
        ) {
          return;
        } else {
          router.options.routes[0].children.push(v);
          ascending(router.options.routes[0].children);
          if (!router.hasRoute(v?.name)) router.addRoute(v);
          const flattenRouters: any = router
            .getRoutes()
            .find(n => n.path === "/");
          flattenRouters.children = router.options.routes[0].children;
          router.addRoute(flattenRouters);
        }
      }
    );
    permissionStore.handleWholeMenus(routeList);
  }
  if (!multiTagsStore.getMultiTagsCache) {
    multiTagsStore.handleTags("equal", [
      ...routerArrays,
      ...permissionStore.flatteningRoutes.filter(
        (v: any) => v?.meta?.fixedTag
      )
    ]);
  }
  addPathMatch();
}

async function initRouter() {
  const { usePermissionStoreHook } = await import("@/store/modules/permission");
  const { useMultiTagsStoreHook } = await import("@/store/modules/multiTags");

  if (getConfig()?.CachingAsyncRoutes) {
    const key = "async-routes";
    const asyncRouteList = storageLocal().getItem(key) as any;
    if (asyncRouteList && asyncRouteList?.length > 0) {
      return new Promise(resolve => {
        handleAsyncRoutes(asyncRouteList, usePermissionStoreHook(), useMultiTagsStoreHook());
        resolve(router);
      });
    } else {
      return new Promise(resolve => {
        getAsyncRoutes().then(({ data }) => {
          handleAsyncRoutes(cloneDeep(data), usePermissionStoreHook(), useMultiTagsStoreHook());
          storageLocal().setItem(key, data);
          resolve(router);
        });
      });
    }
  } else {
    return new Promise(resolve => {
      getAsyncRoutes().then(({ data }) => {
        handleAsyncRoutes(cloneDeep(data), usePermissionStoreHook(), useMultiTagsStoreHook());
        resolve(router);
      });
    });
  }
}

function formatTwoStageRoutes(routesList: RouteRecordRaw[]) {
  if (routesList.length === 0) return routesList;
  const newRoutesList: RouteRecordRaw[] = [];
  routesList.forEach((v: RouteRecordRaw) => {
    if (v.path === "/") {
      newRoutesList.push({
        component: v.component,
        name: v.name,
        path: v.path,
        redirect: v.redirect,
        meta: v.meta,
        children: []
      });
    } else {
      newRoutesList[0]?.children.push({ ...v });
    }
  });
  return newRoutesList;
}

function handleAliveRoute(route: { name: string }, mode?: string) {
  import("@/store/modules/permission").then(({ usePermissionStoreHook }) => {
    const name = route.name;
    switch (mode) {
      case "add":
        usePermissionStoreHook().cacheOperate({
          mode: "add",
          name
        });
        break;
      case "delete":
        usePermissionStoreHook().cacheOperate({
          mode: "delete",
          name
        });
        break;
      case "refresh":
        usePermissionStoreHook().cacheOperate({
          mode: "refresh",
          name
        });
        break;
      default:
        usePermissionStoreHook().cacheOperate({
          mode: "delete",
          name
        });
        useTimeoutFn(() => {
          usePermissionStoreHook().cacheOperate({
            mode: "add",
            name
          });
        }, 100);
    }
  });
}

function addAsyncRoutes(arrRoutes: Array<RouteRecordRaw>) {
  if (!arrRoutes || !arrRoutes.length) return;
  const modulesRoutesKeys = Object.keys(modulesRoutes);
  arrRoutes.forEach((v: RouteRecordRaw) => {
    v.meta.backstage = true;
    if (v?.children && v.children.length && !v.redirect)
      v.redirect = v.children[0].path;
    if (v?.children && v.children.length && !v.name)
      v.name = (v.children[0].name as string) + "Parent";
    if (v.meta?.frameSrc) {
      v.component = IFrame;
    } else {
      const index = v?.component
        ? modulesRoutesKeys.findIndex(ev => ev.includes(v.component as any))
        : modulesRoutesKeys.findIndex(ev => ev.includes(v.path));
      v.component = modulesRoutes[modulesRoutesKeys[index]];
    }
    if (v?.children && v.children.length) {
      addAsyncRoutes(v.children as RouteRecordRaw[]);
    }
  });
  return arrRoutes;
}

function getHistoryMode(routerHistory: string): RouterHistory {
  return getHistoryModeHelper(routerHistory);
}

function getAuths(): Array<string> {
  return router.currentRoute.value.meta.auths as Array<string>;
}

function hasAuth(value: string | Array<string>): boolean {
  if (!value) return false;
  const metaAuths = getAuths();
  if (!metaAuths) return false;
  const isAuths = isString(value)
    ? metaAuths.includes(value)
    : isIncludeAllChildren(value, metaAuths);
  return isAuths ? true : false;
}

function handleTopMenu(route: any) {
  if (route?.children && route.children.length > 1) {
    if (route.redirect) {
      return route.children.filter((cur: any) => cur.path === route.redirect)[0];
    } else {
      return route.children[0];
    }
  } else {
    return route;
  }
}

async function getTopMenu(tag = false): Promise<menuType> {
  const { usePermissionStoreHook } = await import("@/store/modules/permission");
  const { useMultiTagsStoreHook } = await import("@/store/modules/multiTags");

  const topMenu = handleTopMenu(
    usePermissionStoreHook().wholeMenus[0]?.children[0]
  );
  tag && useMultiTagsStoreHook().handleTags("push", topMenu);
  return topMenu;
}

export { constantMenus } from "./instance";

export {
  hasAuth,
  getAuths,
  initRouter,
  getTopMenu,
  addPathMatch,
  getHistoryMode,
  addAsyncRoutes,
  handleAliveRoute,
  formatTwoStageRoutes
};
