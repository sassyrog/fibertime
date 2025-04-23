import { useCookies } from "@vueuse/integrations/useCookies";

export const setAppCookie = (name, value, options) => {
	const cookies = useCookies();
	cookies.set(name, value, {
		maxAge: 60 * 60, // 1 hour
		path: "/",
		...options,
	});
};

export const getAppCookie = (name) => {
	const cookies = useCookies();
	return cookies.get(name);
};

export const deleteAllAppCookies = () => {
	const cookies = useCookies();
	const allCookies = cookies.getAll();
	Object.keys(allCookies).forEach((cookieName) => {
		cookies.remove(cookieName, { path: "/" });
	});
};
