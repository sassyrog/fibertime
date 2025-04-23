import { createApp } from "vue";
import "@/shared/styles/style.css";
import App from "./App.vue";
import router from "./router";
import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import debounce from "lodash/debounce";
import api from "@/shared/services/api";
import { setAppCookie } from "@/shared/utils/cookies";
import setupInactivityLogout from "@/shared/utils/inactivity_logout";

const refreshToken = async function () {
	const { data } = await api.get("/auth/refresh");
	if (!data?.token) throw new Error("Token not found");
	setAppCookie("token", data.token, { path: "/" });
	return data.token;
};

setupInactivityLogout({
	logoutCallback: () => {
		window.location.href = "/app/logout";
	},
	refreshTokenCallback: refreshToken,
});

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

createApp(App).use(pinia).use(router).mount("#app");
