import { createWebHistory, createRouter } from "vue-router";
import has from "lodash/has";
import api from "@/shared/services/api";
import { useToast } from "@/components/ui/toast";
import { setAppCookie } from "@/shared/utils/cookies";

const verifyBeforeEnter = (to, from, next) => {
	if (!has(to.query, "token")) {
		next();
		return;
	}

	const token = to.query.token;
	api.post("/auth/verify", { token })
		.then((res) => {
			setAppCookie("token", res.data.token);
			setAppCookie("user", res.data.user);
			next(null);
			window.location.href = "/app";
		})
		.catch((err) => {
			console.error(err);
			const { toast } = useToast();
			toast({
				title: "Verification Error",
				description:
					err.response?.data?.message || "Could not verify account",
				variant: "destructive",
			});
			next();
		});
};

const resetPasswordBeforeEnter = (to, from, next) => {
	console.log("resetPasswordBeforeEnter", to.query);

	const { toast } = useToast();
	if (!has(to.query, "token")) {
		toast({
			title: "Invalid Link",
			description: "Password reset link has expired or is invalid",
			variant: "destructive",
		});
		next({ name: "login" });
		return;
	}

	const token = to.query.token;

	api.get(`/auth/check-password-reset-token/${token}`)
		.then(() => next())
		.catch((err) => {
			console.error(err);
			toast({
				title: "Invalid Link",
				description: "Password reset link has expired or is invalid",
				variant: "destructive",
			});
			next({ name: "login" });
		});
};

const routes = [
	{
		path: "/",
		name: "login",
		component: () => import("@auth/views/LoginView.vue"),
	},
	{
		path: "/login",
		name: "login1",
		component: () => import("@auth/views/LoginView.vue"),
	},
	{
		path: "/signup",
		name: "signup",
		component: () => import("@auth/views/SignupView.vue"),
	},
	{
		path: "/verify",
		name: "verify",
		component: () => import("@auth/views/VerifyView.vue"),
		beforeEnter: verifyBeforeEnter,
	},
	{
		path: "/logout",
		name: "logout",
		component: () => import("@auth/views/LogoutView.vue"),
	},
	{
		path: "/forgot-password",
		name: "forgot-password",
		component: () => import("@auth/views/ForgotPasswordView.vue"),
	},
	{
		path: "/reset-password",
		name: "reset-password",
		component: () => import("@auth/views/ResetPasswordView.vue"),
		beforeEnter: resetPasswordBeforeEnter,
	},
];

const router = createRouter({
	history: createWebHistory("/auth"),
	routes,
});

export default router;
