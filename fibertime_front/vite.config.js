import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";
import mpa from "vite-plugin-multi-pages";
import autoprefixer from "autoprefixer";
import tailwind from "tailwindcss";
import HistoryApiFallback from "vite-plugin-history-api-fallback";

export default defineConfig({
	base: "/",
	css: {
		postcss: {
			plugins: [tailwind(), autoprefixer()],
		},
	},
	plugins: [
		vue(),
		mpa({
			scanDir: "src/pages",
			defaultOpenPage: "",
			ignorePageNames: "",
		}),
		HistoryApiFallback({
			rewrites: [
				{ from: /^\/app.*$/, to: "/src/pages/app/index.html" },
				// { from: /^\/main.*$/, to: "/index.html" },
				{ from: /\/?^.*$/, to: "/index.html" },
			],
		}),
	],
	resolve: {
		alias: {
			"@": resolve(__dirname, "src"),
			"@app": resolve(__dirname, "src/pages/app"),
		},
	},
	build: {
		rollupOptions: {
			input: {
				app: resolve(__dirname, "index.html"),
				// app: resolve(__dirname, "src/pages/app/index.html"),
			},
		},
	},
});
