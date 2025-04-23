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
import { useRouter } from "vue-router";
import { useRouteQuery } from "@vueuse/router";

const { toast } = useToast();
const router = useRouter();
const token = useRouteQuery("token");
const schema = toTypedSchema(
	z
		.object({
			password: z
				.string()
				.min(8, "Password must be at least 8 characters")
				.refine((password) => /[A-Z]/.test(password), {
					message:
						"Password must contain at least one uppercase letter",
				})
				.refine((password) => /[a-z]/.test(password), {
					message:
						"Password must contain at least one lowercase letter",
				})
				.refine((password) => /[!@#$%^&*(),.?":{}|<>]/.test(password), {
					message:
						"Password must contain at least one special character",
				}),
			confirm_password: z.string().min(8, "Confirm Password is required"),
		})
		.refine((data) => data.password === data.confirm_password, {
			message: "Passwords must match",
			path: ["confirm_password"],
		})
);

const form = useForm({
	validationSchema: schema,
	initialValues: {},
});

const { execute, isLoading } = useAxios(
	"/auth/reset-password",
	{ method: "POST" },
	api,
	{ immediate: false }
);

const formSubmit = form.handleSubmit(async (values) => {
	execute({
		data: {
			token: token.value,
			...values,
		},
	})
		.then(({ data }) => {
			router.push({ name: "login" });
			toast({
				title: "Success",
				description: "Password has been reset successfully",
				variant: "success",
			});
		})
		.catch((error) => {
			console.error("error", error);
			toast({
				description:
					error?.response?.data?.message ||
					"Could not reset password",
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
					<h1 class="text-3xl font-bold">Reset Password</h1>
				</div>
				<form class="grid gap-5" @submit.prevent="formSubmit">
					<FormField v-slot="{ componentField }" name="password">
						<FormItem class="space-y-1">
							<FormLabel class="">New Password</FormLabel>
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
						v-slot="{ componentField }"
						name="confirm_password"
					>
						<FormItem class="space-y-1">
							<FormLabel class="">Confirm Password</FormLabel>
							<FormControl>
								<Input
									type="password"
									v-bind="componentField"
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					</FormField>
					<Button type="submit" class="w-full" :disabled="isLoading">
						<LoaderCircle
							v-if="isLoading"
							class="mt-0.5 loader-spin"
						/>
						<span>Reset Password</span>
					</Button>
				</form>

				<div class="mt-4 text-center text-sm">
					<router-link
						to="/"
						class="underline font-semibold text-primary"
					>
						Go to login
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
