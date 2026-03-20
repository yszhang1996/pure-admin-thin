import { isUrl, openLink } from "@pureadmin/utils";
import NProgress from "@/utils/progress";
import type { GuardContext } from "./type";

/** 外部链接守卫 */
export function externalLinkGuard({ to, next }: GuardContext): boolean {
  const externalLink = isUrl(to?.name as string);

  if (externalLink) {
    openLink(to?.name as string);
    NProgress.done();
    next(false);
    return false;
  }

  return true;
}
