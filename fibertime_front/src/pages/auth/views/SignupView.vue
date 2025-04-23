<template>
	<div
		class="w-full h-full lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-[800px]"
	>
		<div class="flex items-center justify-center py-12">
			<div class="mx-auto grid w-[350px] gap-6">
				<div class="grid gap-2 text-center">
					<h1 class="text-3xl font-bold">Sign Up</h1>
				</div>
				<form class="grid gap-3.5" @submit.prevent="onSubmit">
					<FormField v-slot="{ componentField }" name="firstname">
						<FormItem class="space-y-1">
							<FormLabel class="text-[0.75rem]"
								>First Name/s</FormLabel
							>
							<FormControl>
								<Input
									type="text"
									placeholder="e.g John"
									v-bind="componentField"
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					</FormField>
					<FormField v-slot="{ componentField }" name="lastname">
						<FormItem class="space-y-1">
							<FormLabel class="text-[0.75rem]"
								>Last Name</FormLabel
							>
							<FormControl>
								<Input
									type="text"
									placeholder="e.g Doe"
									v-bind="componentField"
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					</FormField>
					<FormField v-slot="{ componentField }" name="email">
						<FormItem class="space-y-1">
							<FormLabel class="text-[0.75rem]">Email</FormLabel>
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
							<FormLabel class="text-[0.75rem]"
								>Password</FormLabel
							>
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
						name="confirmPassword"
					>
						<FormItem class="space-y-1">
							<FormLabel class="text-[0.75rem]"
								>Confirm Password</FormLabel
							>
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
						name="terms"
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
								<FormLabel>
									<span class="text-xs text-muted-foreground">
										I agree to the{{ " " }}
										<router-link
											to="#"
											class="underline text-primary"
										>
											Terms of Service
										</router-link>
									</span>
								</FormLabel>
								<FormMessage />
							</div>
						</FormItem>
					</FormField>
					<Button type="submit" class="w-full" :disabled="isLoading">
						<LoaderCircle
							v-if="isLoading"
							class="mt-0.5 loader-spin"
						/>
						<span>Create account</span>
					</Button>
				</form>
				<div class="mt-4 text-center text-sm">
					Already have an account?
					<router-link
						to="/"
						class="underline font-semibold text-primary"
					>
						Login
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

const { toast } = useToast();

const schema = toTypedSchema(
	z
		.object({
			firstname: z.string().min(2, "Firstname is required"),
			lastname: z.string().min(2, "Lastname is required"),
			email: z.string().email("Email is invalid"),
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
			confirmPassword: z.string().min(8, "Confirm Password is required"),
			terms: z
				.boolean()
				.default(false)
				.refine((val) => val === true, {
					message: "You must accept the terms and conditions",
				}),
		})
		.refine((data) => data.password === data.confirmPassword, {
			message: "Passwords must match",
			path: ["confirmPassword"],
		})
);

const form = useForm({
	validationSchema: schema,
	initialValues: {
		password: "6me_n_3RdTxu7Ai$",
		confirmPassword: "6me_n_3RdTxu7Ai$",
	},
});

const { isLoading, execute } = useAxios(
	"/auth/register",
	{ method: "POST" },
	api,
	{ immediate: false }
);

const onSubmit = form.handleSubmit((values) => {
	execute({
		data: {
			first_name: values.firstname,
			last_name: values.lastname,
			email: values.email,
			password: values.password,
		},
	})
		.then(({ data }) => {
			setAppCookie("token", data.value.token);
			setAppCookie("user", data.value.user);
			let redirectUrl = new URL("/app", window.location.origin);
			window.location.href = redirectUrl.href;
		})
		.catch((error) => {
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
