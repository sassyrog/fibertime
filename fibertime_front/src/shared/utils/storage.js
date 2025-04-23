import { useCookies } from "@vueuse/integrations/useCookies";

export const cookieStorageLike = {
	getItem(key) {
		const cookies = useCookies();
		return cookies.get(key);
	},
	setItem(key, value) {
		const cookies = useCookies();
		cookies.set(key, value, {
			maxAge: 60 * 60,
			path: "/",
		});
	},
};
