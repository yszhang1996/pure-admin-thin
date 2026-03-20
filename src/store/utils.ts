// 从纯工具库导出，避免循环依赖
export { routerArrays } from "@/layout/types";
export { getConfig, responsiveStorageNameSpace } from "@/config";
export {
  ascending,
  filterTree,
  filterNoPermissionTree,
  formatFlatteningRoutes
} from "@/router/utils";
export {
  isUrl,
  isEqual,
  isNumber,
  debounce,
  isBoolean,
  getKeyList,
  storageLocal,
  deviceDetection
} from "@pureadmin/utils";
export type {
  setType,
  appType,
  userType,
  multiType,
  cacheType,
  positionType
} from "./types";

// store实例在index.ts中定义，避免循环依赖
export { store } from "./index";
