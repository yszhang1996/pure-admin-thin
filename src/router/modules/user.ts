const Layout = () => import("@/layout/index.vue");

export default {
  path: "/user",
  name: "User",
  component: Layout,
  redirect: "/user/index",
  meta: {
    icon: "ep:user",
    title: "用户管理",
    rank: 1
  },
  children: [
    {
      path: "/user/index",
      name: "UserIndex",
      component: () => import("@/views/user/index.vue"),
      meta: {
        title: "用户管理"
      }
    }
  ]
} satisfies RouteConfigsTable;
