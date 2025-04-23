<script setup>
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoaderCircle } from "lucide-vue-next";

import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/components/ui/toast/use-toast";

import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { useAxios } from "@vueuse/integrations/useAxios";
import api from "@/shared/services/api";
import { setAppCookie } from "@/shared/utils/cookies";

const { toast } = useToast();

const schema = toTypedSchema(
	z.object({
		email: z.string().email("Email is invalid"),
		password: z.string().min(1, "Password is required"),
		remember: z.boolean().default(false),
	})
);

const form = useForm({
	validationSchema: schema,
	initialValues: {},
});

const { execute, isLoading } = useAxios(
	"/auth/login",
	{ method: "POST" },
	api,
	{ immediate: false }
);

const onSubmit = form.handleSubmit(async (values) => {
	execute({
		data: values,
	})
		.then(({ data }) => {
			setAppCookie("token", data.value.token);
			setAppCookie("user", data.value.user);
			let redirectUrl = new URL("/app", window.location.origin);
			window.location.href = redirectUrl.href;
		})
		.catch((error) => {
			if (!error?.response) return;
			console.error("error", error);
			toast({
				description:
					error?.response?.data?.message ||
					"Something went wrong while signing up",
				variant: "destructive",
			});
		});
});
</script>

<template>
	<div
		class="w-full h-full lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-[800px]"
	>
		<div class="flex items-center justify-center py-12">
			<div class="mx-auto grid w-[350px] gap-6">
				<div class="grid gap-2 text-center">
					<h1 class="text-3xl font-bold">Login</h1>
				</div>
				<form class="grid gap-5" @submit.prevent="onSubmit">
					<FormField v-slot="{ componentField }" name="email">
						<FormItem class="space-y-1">
							<FormLabel class="">Email</FormLabel>
							<FormControl>
								<Input
									type="email"
									placeholder="e.g johndoe@yahoo.com"
									v-bind="componentField"
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					</FormField>
					<FormField v-slot="{ componentField }" name="password">
						<FormItem class="space-y-1">
							<div class="flex items-center">
								<FormLabel class="">Password</FormLabel>
								<router-link
									to="/forgot-password"
									class="ml-auto inline-block text-sm underline"
								>
									Forgot your password?
								</router-link>
							</div>
							<FormControl>
								<Input
									type="password"
									v-bind="componentField"
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					</FormField>
					<FormField
						v-slot="{ value, handleChange }"
						type="checkbox"
						name="remember"
					>
						<FormItem
							class="flex flex-row items-start gap-x-3 space-y-0 p-2"
						>
							<FormControl>
								<Checkbox
									:model-value="value"
									@update:model-value="handleChange"
								/>
							</FormControl>
							<div class="space-y-0 leading-none">
								<FormLabel>Remember me</FormLabel>
								<FormMessage />
							</div>
						</FormItem>
					</FormField>
					<Button type="submit" class="w-full" :disabled="isLoading">
						<LoaderCircle
							v-if="isLoading"
							class="mt-0.5 loader-spin"
						/>
						<span>Login</span>
					</Button>
				</form>
				<div class="mt-4 text-center text-sm">
					Don't have an account?
					<router-link
						to="/signup"
						class="underline font-semibold text-primary"
					>
						Sign up
					</router-link>
				</div>
			</div>
		</div>
		<div class="hidden bg-muted lg:block">
			<img
				src="#"
				alt="Image"
				width="1920"
				height="1080"
				class="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
			/>
		</div>
	</div>
</template>
