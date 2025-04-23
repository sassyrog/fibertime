import axios from "axios";
import { useToast } from "@/components/ui/toast/use-toast";
import { getAppCookie } from "../utils/cookies";

const api = axios.create({
	baseURL: "http://localhost:3000/api/v1",
	timeout: 10000,
	headers: {
		"Content-Type": "application/json",
	},
});

const redirectResponseInterceptor = (response) => {
	return response;
};

api.interceptors.request.use(
	(config) => {
		const token = getAppCookie("token");
		if (token) config.headers.Authorization = `Bearer ${token}`;

		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

api.interceptors.response.use(
	function (response) {
		return Promise.resolve(response);
	},
	function (error) {
		const { toast } = useToast();
		if (!error.response) return Promise.reject(error);
		const { status } = error.response;

		if (status === 302) {
			const { redirect_url, message } = error.response?.data;
			let redirectUrl = new URL(redirect_url, window.location.origin);
			window.location.href = redirectUrl.href;

			return Promise.resolve();
		}
		return Promise.reject(error);
	}
);

export default api;
