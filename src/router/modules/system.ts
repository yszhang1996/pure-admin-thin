const Layout = () => import("@/layout/index.vue");

export default {
  path: "/system",
  name: "System",
  component: Layout,
  redirect: "/system/user",
  meta: {
    icon: "ri/settings-3-line",
    title: "系统管理",
    rank: 1
  },
  children: [
    {
      path: "/system/user",
      name: "UserManage",
      component: () => import("@/views/system/user/index.vue"),
      meta: {
        icon: "ri/user-settings-line",
        title: "用户管理"
      }
    }
  ]
} satisfies RouteConfigsTable;
