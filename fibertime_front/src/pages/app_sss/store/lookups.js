import { defineStore } from "pinia";
import api from "@/shared/services/api";
import { every } from "lodash";

export const useLookupsStore = defineStore("lookups", {
	state: () => ({
		permissions: [],
		roles: [],
	}),
	getters: {
		permissionsList() {
			return this.permissions;
		},
		rolesList() {
			return this.roles;
		},
	},

	actions: {
		loadPermissions() {
			// prettier-ignore
			const fetchPromises = [
				{ name: "permissions", promise: api.get("/lookups/permissions") },
				{ name: "roles", promise: api.get("/lookups/roles") },
			];

			fetchPromises.forEach(({ name, promise }) => {
				promise
					.then((response) => {
						this[name] = response.data;
					})
					.catch((error) => {
						console.error(`Error fetching ${name}:`, error);
					});
			});

			// track if all promises are resolved
			Promise.allSettled(
				fetchPromises.map(({ promise }) => promise)
			).then((rs /*results*/) => {
				// prettier-ignore
				const allFullfilled = every(rs, (r) => r.status === "fulfilled");
				if (allFullfilled) {
					console.log(
						"All permissions and roles loaded successfully"
					);
				} else {
					console.error("Some permissions or roles failed to load");
				}
			});
		},
	},
});
