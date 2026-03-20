import type { Router } from "vue-router";
import { getConfig } from "@/config";
import { isUrl } from "@pureadmin/utils";

export function setupTitleGuard(router: Router) {
  router.beforeEach((to, _from, next) => {
    const externalLink = isUrl(to?.name as string);
    
    if (!externalLink) {
      to.matched.some(item => {
        if (!item.meta.title) return "";
        const Title = getConfig().Title;
        if (Title) document.title = `${item.meta.title} | ${Title}`;
        else document.title = item.meta.title as string;
      });
    }
    next();
  });
}
