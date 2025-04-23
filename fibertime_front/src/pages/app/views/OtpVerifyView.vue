<template>
	<div class="h-screen w-screen">
		<div class="flex items-center justify-center h-full py-12">
			<form
				class="max-w-sm space-y-6"
				@submit="onSubmit"
			>
				<FormField
					v-slot="{ componentField, value }"
					name="pin"
				>
					<FormItem class="space-y-5">
						<FormLabel class="text-2xl">Login OTP</FormLabel>
						<FormDescription>
							Enter the 6-digit OTP code sent to your mobile number <span
								class="font-bold"
								v-if="route.query.phone"
							>
								{{ decodeURIComponent(route.query.phone) }}
							</span>
						</FormDescription>
						<FormControl>
							<PinInput
								id="pin-input"
								:model-value="value"
								placeholder="○"
								class="flex gap-2 items-center mt-1"
								otp
								type="number"
								:name="componentField.name"
								@update:model-value="(arrStr) => {
									setFieldValue('pin', arrStr.filter(Boolean))
								}"
							>
								<PinInputGroup class="scale-110">
									<PinInputInput
										v-for="(id, index) in 6"
										:key="id"
										:index="index"
										:disabled="isLoading"
									/>
								</PinInputGroup>
							</PinInput>
						</FormControl>
						<FormMessage />
					</FormItem>
				</FormField>

				<Button :disabled="isLoading">
					<LoaderCircle
						v-if="isLoading"
						class="mt-0.5 loader-spin"
					/>
					Login
				</Button>
				<div class="mt-4 text-center text-sm">
					<router-link
						to="/auth"
						class="underline font-semibold text-primary"
					>
						Back to Login
					</router-link>
				</div>
			</form>
		</div>
	</div>
</template>
<script setup>
	import { Button } from '@/components/ui/button'
	import {
		FormControl,
		FormDescription,
		FormField,
		FormItem,
		FormLabel,
		FormMessage,
	} from '@/components/ui/form'
	import {
		PinInput,
		PinInputGroup,
		PinInputInput,
	} from '@/components/ui/pin-input'
	import { LoaderCircle } from "lucide-vue-next";
	import { toTypedSchema } from '@vee-validate/zod'
	import { useForm } from 'vee-validate'
	import api from "@/shared/services/api";
	import { useAxios } from "@vueuse/integrations/useAxios";
	import { useToast } from "@/components/ui/toast/use-toast";
	import * as z from 'zod'
	import { useRoute } from 'vue-router';
	import { useRouter } from 'vue-router';
	import { onBeforeRouteLeave } from 'vue-router';
	import { setAppCookie } from '@/shared/utils/cookies';
	import { useAuthStore } from '@/pages/app_sss/store/auth';

	const { toast } = useToast();
	const route = useRoute();
	const router = useRouter()
	const authStore = useAuthStore()


	const formSchema = toTypedSchema(z.object({
		pin: z.array(z.coerce.string()).length(6, { message: 'Invalid OTP' }),
	}))

	const { handleSubmit, setFieldValue } = useForm({
		validationSchema: formSchema,
		initialValues: {
			pin: [],
		},
	})

	const { execute, isLoading } = useAxios(
		"/auth/login",
		{ method: "POST" },
		api,
		{ immediate: false }
	);

	const onSubmit = handleSubmit(async (values) => {
		const otp = values.pin.join('');
		execute({
			data: {
				otpCode: otp,
				userId: route.query.user,
			}
		}).then(({ data }) => {
			toast({
				description: "Logged in successfully",
				variant: "success",
			});
			setAppCookie("token", data.value.token);
			setAppCookie("user", data.value.user);
			authStore.setUser(data.value.user);
			authStore.setToken(data.value.token);
			router.push({ name: "home" });
		}).catch((error) => {
			console.error(error);
			toast({
				description: error.response?.data?.message || "Failed to login",
				variant: "destructive",
			});
			router.push({ name: "login" });
		})
	})

</script>