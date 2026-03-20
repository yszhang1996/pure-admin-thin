import { getConfig } from "@/config";
import { isUrl } from "@pureadmin/utils";
import type { GuardContext } from "./type";

/** 页面标题守卫 */
export function titleGuard({ to }: GuardContext): boolean {
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
      return true;
    });
  }

  return true;
}
