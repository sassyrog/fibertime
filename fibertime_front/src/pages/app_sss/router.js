import { createWebHistory, createRouter } from "vue-router";
import { useToast } from "@/components/ui/toast";
import { useCookies } from "@vueuse/integrations/useCookies";
import has from "lodash/has";
import api from "@/shared/services/api";
import { useAuthStore } from "./store/auth";
import { deleteAllAppCookies } from "@/shared/utils/cookies";

const EmptyComponent = { template: "<div></div>" };

const routes = [
	{ path: "/", name: "home", component: () => import("@app/views/Home.vue") },
	{
		path: "/logout",
		name: "logout",
		component: EmptyComponent,
		beforeEnter: async (to, from) => {
			try {
				await api.get("/auth/logout");
			} catch (error) {
				console.error("Logout error:", error);
			} finally {
				const authStore = useAuthStore();
				authStore.logout();
				deleteAllAppCookies();
				window.location.href = "/auth/logout";
			}
		},
	},
];

const router = createRouter({
	history: createWebHistory("/app"),
	routes,
});

const fetchUser = (token) => {
	const cookies = useCookies();

	return api
		.get("/auth/user", {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		})
		.then((res) => {
			cookies.set("user", res.data.user, {
				maxAge: 60 * 60,
				path: "/",
			}); // 1 hour
			return res.data.user;
		})
		.catch(() => {
			const { toast } = useToast();
			toast({
				title: "Access Error",
				description: "Could not fetch user data",
				variant: "destructive",
			});
			return null;
		});
};

router.beforeEach((to, from, next) => {
	const authStore = useAuthStore();
	const cookies = useCookies();
	const token = cookies.get("token");
	const user = cookies.get("user");

	if (!token) {
		window.location.href = "/auth/logout";
		next(false); // prevent navigation
		return;
	}

	if (!user)
		fetchUser(token).then((u) => {
			if (u) {
				authStore.setToken(token);
				authStore.setUser(u);
			} else {
				window.location.href = "/auth/logout";
			}
		});

	if (!authStore.isAuthenticated) {
		authStore.setToken(token);
		authStore.setUser(user);
	}

	if (has(to.query, "returnUrl")) {
		const returnUrl = to.query.returnUrl;
		// rest of the code
	}

	next();
});

export default router;
