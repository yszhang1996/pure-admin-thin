const Layout = () => import("@/layout/index.vue");

export default {
  path: "/system",
  name: "System",
  component: Layout,
  redirect: "/system/user",
  meta: {
    icon: "ep:setting",
    title: "系统管理",
    rank: 20
  },
  children: [
    {
      path: "/system/user",
      name: "SystemUser",
      component: () => import("@/views/system/user.vue"),
      meta: {
        title: "用户管理",
        icon: "ep:user"
      }
    }
  ]
} satisfies RouteConfigsTable;
