const Layout = () => import("@/layout/index.vue");

export default {
  path: "/profile",
  component: Layout,
  redirect: "/profile/index",
  name: "Profile",
  meta: {
    title: "个人中心",
    icon: "ep:user-filled",
    rank: 1
  },
  children: [
    {
      path: "/profile/index",
      name: "ProfileIndex",
      component: () => import("@/views/profile/index.vue"),
      meta: {
        title: "个人中心"
      }
    }
  ]
} satisfies RouteConfigsTable;
