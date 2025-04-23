<template>
	<div class="w-full h-full flex flex-col items-center justify-center">
		<Mail
			class="w-14 h-14 mb-5 stroke-primary bg-purple-100 p-3 rounded-md"
		/>
		<form class="grid gap-6 lg:w-[30rem]" @submit="onSubmit">
			<div class="text-center">
				<h1 class="text-3xl font-bold">Verify Account</h1>
			</div>
			<div class="text-justify">
				<span class="text-primary font-semibold">
					Account requires verification.
				</span>
				Please check your email for the verification link. If you did
				not receive the email, please enter your email below to resend
				the verification link.
			</div>
			<FormField v-slot="{ componentField }" name="email">
				<FormItem>
					<FormControl>
						<Input
							placeholder="Email e.g john@yahoo.com"
							v-bind="componentField"
						/>
					</FormControl>
					<FormMessage />
				</FormItem>
			</FormField>
			<Separator label="" />
			<div class="flex justify-between">
				<Button
					variant="outline"
					type="button !text-"
					class="!text-xs"
					@click="$router.push('/')"
				>
					Back To Login
				</Button>
				<Button
					type="submit"
					class="!text-xs"
					:disabled="isLoading || !form.meta?.valid"
				>
					<span v-if="isInCooldown" class="w-8">
						({{ cooldown }}s )
					</span>
					Resend Verification Email
				</Button>
			</div>
		</form>
	</div>
</template>
<script setup>
import { computed, ref, watch } from "vue";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-vue-next";
import {
	FormField,
	FormControl,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import Separator from "@/components/ui/separator/Separator.vue";
import { Input } from "@/components/ui/input";
import { useAxios } from "@vueuse/integrations/useAxios";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import api from "@/shared/services/api";
import { useToast } from "@/components/ui/toast";
import { useCookies } from "@vueuse/integrations/useCookies";
import { tryOnUnmounted } from "@vueuse/core";

const { toast } = useToast();
const cookies = ref(useCookies());

const COOKIE_NAME = "resend_cooldown";
const COOLDOWN_PERIOD = 60 * 3; // 3 minutes
const cooldown = ref(0);
let interval = null;

const isInCooldown = computed(() => cooldown.value > 0);

const updateCooldown = () => {
	const expiryTime = cookies.value.get(COOKIE_NAME);
	if (!expiryTime) {
		cooldown.value = 0;
		return;
	}

	const now = Math.floor(Date.now() / 1000);
	cooldown.value = Math.max(0, expiryTime - now);
};

watch(
	cooldown,
	(v, o) => {
		if (v) {
			clearInterval(interval);
			updateCooldown();
			interval = setInterval(() => {
				if (cooldown.value <= 0) clearInterval(interval);
				updateCooldown();
			}, 1000);
		} else {
			clearInterval(interval);
			updateCooldown();
		}
	},
	{ immediate: true }
);

tryOnUnmounted(() => {
	clearInterval(interval);
});

const schema = toTypedSchema(
	z.object({
		email: z.string().email("Email is invalid"),
	})
);

const form = ref(
	useForm({
		validationSchema: schema,
		initialValues: {},
	})
);

const { execute, isLoading } = useAxios(
	"/auth/resend_verification",
	{ method: "POST" },
	api,
	{ immediate: false }
);

const onSubmit = form.value.handleSubmit(async (values) => {
	if (isInCooldown.value) {
		toast({
			description: `Please wait ${cooldown.value} seconds before resending the verification email.`,
			variant: "destructive",
		});
		return;
	}

	const expiryTime = Math.floor(Date.now() / 1000) + COOLDOWN_PERIOD;
	cookies.value.set(COOKIE_NAME, expiryTime, {
		maxAge: COOLDOWN_PERIOD,
		path: "/",
	});
	updateCooldown();

	execute({
		data: values,
	})
		.then((res) => {
			toast({
				description:
					res.data?.message ||
					"Verification email resent successfully",
				variant: "success",
			});
		})
		.catch((error) => {
			if (!error?.response) return;
			console.error("error", error);
			toast({
				description:
					error?.response?.data?.message || "Something went wrong",
				variant: "destructive",
			});
		});
});
</script>
