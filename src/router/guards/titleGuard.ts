import { getConfig } from "@/config";
import { isUrl } from "@pureadmin/utils";
import type { RouteLocationNormalized } from "vue-router";

/**
 * 设置页面标题
 */
export function setPageTitle(to: RouteLocationNormalized): void {
  const externalLink = isUrl(to?.name as string);

  if (!externalLink) {
    to.matched.some(item => {
      if (!item.meta.title) return "";
      const Title = getConfig().Title;
      if (Title) {
        document.title = `${item.meta.title} | ${Title}`;
      } else {
        document.title = item.meta.title as string;
      }
    });
  }
}
