const Layout = () => import("@/layout/index.vue");

export default {
  path: "/user",
  name: "User",
  component: Layout,
  redirect: "/user/management",
  meta: {
    icon: "ri:user-settings-line",
    title: "用户管理",
    rank: 1
  },
  children: [
    {
      path: "/user/management",
      name: "UserManagement",
      component: () => import("@/views/user/index.vue"),
      meta: {
        title: "用户管理"
      }
    }
  ]
} satisfies RouteConfigsTable;
