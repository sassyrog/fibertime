<template>
	<div id="app" class="h-screen w-screen">
		<Toaster />
		<router-view />
	</div>
</template>

<script setup>
import Toaster from "@/components/ui/toast/Toaster.vue";
</script>
