<template>
	<div class="w-full h-full flex flex-col items-center justify-center">
		<LogOut
			class="w-14 h-14 mb-5 stroke-primary bg-purple-100 p-3 rounded-md"
		/>
		<div class="grid gap-6 sm:w-[30rem]">
			<div class="text-center">
				<h1 class="text-3xl font-bold">Logged Out</h1>
			</div>
			<div class="text-justify mx-6 sm:mx-0">
				You have been logged out successfully. If you wish to log back
				in, please click the button below.
			</div>
			<Separator label="" />
			<Button
				type="button"
				class="!text-xs w-fit mx-auto"
				@click.stop.prevent="$router.push({ name: 'login' })"
				>Login Again</Button
			>
		</div>
	</div>
</template>
<script setup>
import { Button } from "@/components/ui/button";
import Separator from "@/components/ui/separator/Separator.vue";
import { LogOut } from "lucide-vue-next";
</script>
