import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/Home.vue";

Vue.use(VueRouter);

const originalPush = VueRouter.prototype.push;
VueRouter.prototype.push = function push(location) {
  undefined;
  return originalPush.call(this, location).catch((err) => err);
};
const originalReplace = VueRouter.prototype.replace;
VueRouter.prototype.replace = function replace(location) {
  undefined;
  return originalReplace.call(this, location).catch((err) => err);
};

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/list",
    name: "list",
    component: () => import("../views/List.vue"),
  },

  {
    path: "/assets",
    name: "assets",
    component: () => import("../views/Assets.vue"),
  },
  
  {
    path: "/assetsPotion",
    name: "assetsPotion",
    component: () => import("../views/AssetsPotion.vue"),
  },
  {
    path: "/assetsmarket",
    name: "assetsmarket",
    component: () => import("../views/AssetsInMarket.vue"),
  },
  {
    path: "/mine",
    name: "mine",
    component: () => import("../views/Mine.vue"),
  },
  {
    path: "/market",
    name: "market",
    component: () => import("../views/Market.vue"),
  },
];

const router = new VueRouter({
  routes,
});

export default router;
