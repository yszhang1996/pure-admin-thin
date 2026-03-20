import {
  type Router,
  type RouterHistory,
  type RouteRecordRaw,
  type RouteComponent,
  createRouter,
  createWebHistory,
  createWebHashHistory
} from "vue-router";
import { formatTwoStageRoutes, formatFlatteningRoutes, ascending, getHistoryMode } from "./helper";
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

import { buildHierarchyTree } from "@/utils/tree";

export const constantRoutes: Array<RouteRecordRaw> = formatTwoStageRoutes(
  formatFlatteningRoutes(buildHierarchyTree(ascending(routes.flat(Infinity))))
);

export const initConstantRoutes: Array<RouteRecordRaw> = JSON.parse(
  JSON.stringify(constantRoutes)
);

export const constantMenus: Array<RouteComponent> = ascending(
  routes.flat(Infinity)
).concat(...remainingRouter);

export const remainingPaths = Object.keys(remainingRouter).map(v => {
  return remainingRouter[v].path;
});

export const router: Router = createRouter({
  history: getHistoryMode(import.meta.env.VITE_ROUTER_HISTORY),
  routes: constantRoutes.concat(...(remainingRouter as any)),
  strict: true,
  scrollBehavior(to, from, savedPosition) {
    return new Promise(resolve => {
      if (savedPosition) {
        return savedPosition;
      } else {
        if (from.meta.saveSrollTop) {
          const top: number =
            document.documentElement.scrollTop || document.body.scrollTop;
          resolve({ left: 0, top });
        }
      }
    });
  }
});

const loadedPaths = new Set<string>();

export function resetLoadedPaths() {
  loadedPaths.clear();
}

export function isRouteLoaded(path: string): boolean {
  return loadedPaths.has(path);
}

export function markRouteLoaded(path: string) {
  loadedPaths.add(path);
}

export function getLoadedPaths(): Set<string> {
  return loadedPaths;
}
