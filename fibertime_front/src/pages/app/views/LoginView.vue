<script setup>
	import { Button } from "@/components/ui/button";
	import { LoaderCircle } from "lucide-vue-next";

	import {
		FormField,
		FormLabel,
		FormMessage,
	} from "@/components/ui/form";
	import { useToast } from "@/components/ui/toast/use-toast";

	import { useForm } from "vee-validate";
	import { toTypedSchema } from "@vee-validate/zod";
	import * as z from "zod";
	import { useAxios } from "@vueuse/integrations/useAxios";
	import api from "@/shared/services/api";
	import PhoneComponent from "../components/PhoneComponent.vue";
	import parsePhoneNumberFromString, { format, isValidNumber } from "libphonenumber-js";
	import { useRouter } from "vue-router";

	const { toast } = useToast();
	const router = useRouter()

	const schema = toTypedSchema(
		z.object({
			phone: z.object({
				code: z.string(),
				number: z.string().min(1, "Phone number is required")


			}).nullable()
				.refine((v) => {
					const parsed = parsePhoneNumberFromString(v.number, v.code);
					return isValidNumber(parsed?.number ?? '');
				}, {
					message: "Invalid phone number",
					path: ["phone", "number"],
				})
				.transform((v) => {
					let parsed = parsePhoneNumberFromString(v.number, v.code);
					if (parsed.isValid)
						return { ...v, phone: format(parsed.number, "E.164") }
					return v;
				})

		})
	);

	const form = useForm({
		validationSchema: schema,
		initialValues: {},
		validateOnMount: false
	});

	const { execute, isLoading } = useAxios(
		"/auth/request-otp",
		{ method: "POST" },
		api,
		{ immediate: false }
	);

	const onSubmit = form.handleSubmit((values) => {
		console.log(values);

		execute({
			data: {
				phone: values.phone.number,
				code: values.phone.code,
			},
		})
			.then(({ data }) => {
				toast({
					description: "OTP sent successfully",
					variant: "success",
				});
				router.push({
					name: "otp-verify",
					query: {
						user: data.value.user.id,
						phone: encodeURIComponent(data.value.user.phone)
					}
				});
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
	<div class="w-full h-full lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-[800px]">
		<div class="flex items-center justify-center h-full py-12">
			<div class="mx-auto grid w-[350px] gap-6">
				<div class="grid gap-2 text-center">
					<h1 class="text-3xl font-bold">Login</h1>
					<h2>
						Login to Connect to WiFi
					</h2>
				</div>
				<form
					class="grid gap-5"
					@submit.prevent="onSubmit"
				>
					<FormField
						v-slot="{ componentField }"
						name="phone"
					>
						<FormLabel class="">Enter a valid phone number below</FormLabel>
						<PhoneComponent
							v-model="componentField.modelValue"
							@update:modelValue="componentField.onChange"
							:name="componentField.name"
							@resetForm="form.resetForm()"
						/>
						<FormMessage />
					</FormField>
					<Button
						type="submit"
						class="w-full"
						:disabled="isLoading"
					>
						<LoaderCircle
							v-if="isLoading"
							class="mt-0.5 loader-spin"
						/>
						<span>Next</span>
					</Button>
				</form>
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
