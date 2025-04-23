import { createWebHistory, createRouter } from "vue-router";
import has from "lodash/has";
import api from "@/shared/services/api";
import { useToast } from "@/components/ui/toast/use-toast";
import { setAppCookie } from "@/shared/utils/cookies";
import { useAuthStore } from "./store/auth";
import { deleteAllAppCookies } from "@/shared/utils/cookies";

const routes = [
	{
		path: "/",
		name: "app",
		meta: { requiresAuth: true },
		component: () => import("@/pages/app/views/AppView.vue"),
		children: [
			{
				path: "",
				name: "home",
				component: () => import("@/pages/app/views/HomeView.vue"),
				meta: { requiresAuth: true },
			},
		],
	},
	{
		path: "/auth",
		name: "auth",
		meta: { requiresAuth: false },
		component: () => import("@/pages/app/views/AuthView.vue"),
		children: [
			{
				path: "",
				name: "login",
				component: () => import("@/pages/app/views/LoginView.vue"),
				meta: { requiresAuth: false },
			},
			{
				path: "/otp-verify",
				name: "otp-verify",
				component: () => import("@/pages/app/views/OtpVerifyView.vue"),
				meta: { requiresAuth: false },
				beforeEnter: async (to, from, next) => {
					const { user } = to.query;
					if (!user) {
						const { toast } = useToast();
						toast({
							title: "Invalid OTP request",
							variant: "destructive",
						});
						return next({ name: "login" });
					}
					next();
				},
			},
		],
	},
];

const beforeEachGuard = async (to, from, next) => {
	const { toast } = useToast();
	const authStore = useAuthStore();
	const token = authStore.token;
	const user = authStore.user;

	console.log(authStore.authenticated);
	const requiresAuth = to.meta.requiresAuth;

	if (requiresAuth && !authStore.authenticated) {
		toast({
			title: "Authentication Required",
			variant: "destructive",
		});
		return next({ name: "login" });
	}

	next();
};

const router = createRouter({
	history: createWebHistory("/"),
	routes,
});

router.beforeEach(beforeEachGuard);

export default router;
