<script setup>
import NavMain from "@app/components/NavMain.vue";
import NavProjects from "@app/components/NavProjects.vue";
import NavUser from "@app/components/NavUser.vue";
import TeamSwitcher from "@app/components/TeamSwitcher.vue";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarRail,
} from "@/components/ui/sidebar";

import {
	AudioWaveform,
	BookOpen,
	Bot,
	Command,
	Frame,
	GalleryVerticalEnd,
	Map,
	PieChart,
	Settings2,
	SquareTerminal,
} from "lucide-vue-next";
import { useAuthStore } from "@/pages/app/store/auth";
import { computed } from "vue";
import { storeToRefs } from "pinia";

const props = defineProps({
	side: { type: String, required: false },
	variant: { type: String, required: false },
	collapsible: { type: String, required: false, default: "icon" },
	class: { type: null, required: false },
});

const authStore = useAuthStore();

const { storeUser: user } = storeToRefs(authStore);

const data = {
	user: {
		name: `${user.value?.first_name} ${user.value?.last_name}`,
		email: user.value?.email,
		avatar: "/avatars/shadcn.jpg",
	},
	teams: [
		{
			name: "Acme Inc",
			logo: GalleryVerticalEnd,
			plan: "Enterprise",
		},
	],
	navMain: [],
	projects: [],
};

// This is sample data.
// const data = {
// 	user: {
// 		name: "shadcn",
// 		email: "m@example.com",
// 		avatar: "/avatars/shadcn.jpg",
// 	},
// 	teams: [
// 		{
// 			name: "Acme Inc",
// 			logo: GalleryVerticalEnd,
// 			plan: "Enterprise",
// 		},
// 		{
// 			name: "Acme Corp.",
// 			logo: AudioWaveform,
// 			plan: "Startup",
// 		},
// 		{
// 			name: "Evil Corp.",
// 			logo: Command,
// 			plan: "Free",
// 		},
// 	],
// 	navMain: [
// 		{
// 			title: "Playground",
// 			url: "#",
// 			icon: SquareTerminal,
// 			isActive: true,
// 			items: [
// 				{
// 					title: "History",
// 					url: "#",
// 				},
// 				{
// 					title: "Starred",
// 					url: "#",
// 				},
// 				{
// 					title: "Settings",
// 					url: "#",
// 				},
// 			],
// 		},
// 		{
// 			title: "Models",
// 			url: "#",
// 			icon: Bot,
// 			items: [
// 				{
// 					title: "Genesis",
// 					url: "#",
// 				},
// 				{
// 					title: "Explorer",
// 					url: "#",
// 				},
// 				{
// 					title: "Quantum",
// 					url: "#",
// 				},
// 			],
// 		},
// 		{
// 			title: "Documentation",
// 			url: "#",
// 			icon: BookOpen,
// 			items: [
// 				{
// 					title: "Introduction",
// 					url: "#",
// 				},
// 				{
// 					title: "Get Started",
// 					url: "#",
// 				},
// 				{
// 					title: "Tutorials",
// 					url: "#",
// 				},
// 				{
// 					title: "Changelog",
// 					url: "#",
// 				},
// 			],
// 		},
// 		{
// 			title: "Settings",
// 			url: "#",
// 			icon: Settings2,
// 			items: [
// 				{
// 					title: "General",
// 					url: "#",
// 				},
// 				{
// 					title: "Team",
// 					url: "#",
// 				},
// 				{
// 					title: "Billing",
// 					url: "#",
// 				},
// 				{
// 					title: "Limits",
// 					url: "#",
// 				},
// 			],
// 		},
// 	],
// 	projects: [
// 		{
// 			name: "Design Engineering",
// 			url: "#",
// 			icon: Frame,
// 		},
// 		{
// 			name: "Sales & Marketing",
// 			url: "#",
// 			icon: PieChart,
// 		},
// 		{
// 			name: "Travel",
// 			url: "#",
// 			icon: Map,
// 		},
// 	],
// };
</script>

<template>
	<Sidebar v-bind="props" :key="user">
		<SidebarHeader>
			<TeamSwitcher :teams="data.teams" />
		</SidebarHeader>
		<SidebarContent>
			<NavMain :items="data.navMain" />
			<NavProjects :projects="data.projects" />
		</SidebarContent>
		<SidebarFooter>
			<NavUser :user="data.user" />
		</SidebarFooter>
		<SidebarRail />
	</Sidebar>
</template>
