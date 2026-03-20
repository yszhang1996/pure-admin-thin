import type {
  Router,
  NavigationGuardNext,
  RouteLocationNormalized
} from "vue-router";

export type ToRouteType = RouteLocationNormalized & {
  meta?: {
    title?: string;
    roles?: Array<string>;
    keepAlive?: boolean;
    loaded?: boolean;
    saveSrollTop?: boolean;
    [key: string]: any;
  };
};

export interface GuardContext {
  to: ToRouteType;
  from: RouteLocationNormalized;
  next: NavigationGuardNext;
  router: Router;
}

export type GuardFunction = (
  context: GuardContext
) => Promise<boolean | void> | boolean | void;
