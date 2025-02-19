import { createRouter, createWebHistory } from "vue-router";
import GroupChat from "./pages/GroupChat.vue";
import Login from "./pages/Login.vue";
import NotFound from "./pages/NotFound.vue";

import { defineComponent } from "vue";

const routes = [
  {
    path: "/",
    name: "home",
    component: GroupChat,
  },
  {
    path: "/login",
    name: "login",
    component: Login,
  },
  {
    path: "/:pathMatch(.*)*",
    name: "not-found",
    component: NotFound,
  },
];

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior(to, from, savedPosition) {
    return { top: 0 };
  },
  routes,
});

async function checkAuthStatus() {
  try {
    const response = await fetch("/authstatus");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error:", error);
    return false;
  }
}

router.beforeEach(async (to, from, next) => {
  if (to.meta.requiresAuth) {
    const isAuthenticated = await checkAuthStatus();
    if (!isAuthenticated && to.name !== "login") {
      // If the route requires authentication and the user is not authenticated, redirect to the login page
      next("/login");
    } else {
      next();
    }
  } else {
    // Continue with the route navigation
    next();
  }
});

export default router;
