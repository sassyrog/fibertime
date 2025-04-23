import { defineStore } from "pinia";
import { cookieStorageLike } from "@/shared/utils/storage";

export const useAuthStore = defineStore("auth", {
	state: () => ({
		token: null,
		user: null,
	}),
	getters: {
		authenticated() {
			return !!this.token && !!this.user;
		},
		storeUser() {
			return this.user;
		},
	},
	actions: {
		setToken(token) {
			this.token = token;
		},
		setUser(user) {
			this.user = user;
		},
		logout() {
			this.token = null;
			this.user = null;
		},
	},
	persist: {
		storage: cookieStorageLike,
	},
});
