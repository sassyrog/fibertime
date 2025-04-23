<script setup>
import AppSidebar from "@/pages/app/components/AppSidebar.vue";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";

import { useAuthStore } from "@/pages/app/store/auth";
import { storeToRefs } from "pinia";
import { watch } from "vue";
import { useLookupsStore } from "./store/lookups";

const authStore = useAuthStore();
const lookupsStore = useLookupsStore();
const { storeUser: user, authenticated } = storeToRefs(authStore);

watch(
	authenticated,
	(v) => {
		if (v) lookupsStore.loadPermissions();
	},
	{ immediate: true }
);
</script>
<template>
	<SidebarProvider :key="user">
		<AppSidebar />
		<SidebarInset>
			<header
				class="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12"
			>
				<div class="flex items-center gap-2 px-4">
					<SidebarTrigger class="-ml-1" />
					<Separator orientation="vertical" class="mr-2 h-4" />
					<Breadcrumb>
						<BreadcrumbList>
							<BreadcrumbItem class="hidden md:block">
								<BreadcrumbLink href="#">
									Building Your Application
								</BreadcrumbLink>
							</BreadcrumbItem>
							<BreadcrumbSeparator class="hidden md:block" />
							<BreadcrumbItem>
								<BreadcrumbPage>Data Fetching</BreadcrumbPage>
							</BreadcrumbItem>
						</BreadcrumbList>
					</Breadcrumb>
				</div>
			</header>
			<div class="h-full w-full bg-slate-100 overflow-y-auto px-5 pt-3">
				<router-view :key="user"></router-view>
			</div>
		</SidebarInset>
	</SidebarProvider>
</template>
