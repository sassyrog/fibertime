<template ">
	<div class=" h-screen w-screen bg-gradient-to-br from-slate-50 to-yellow-400 flex justify-center items-center
	flex-col">
		<div class="w-1/2 p-8">
			<p class="text-8xl italic font-bold text-center">
				Fibertime
			</p>
		</div>
		<Card class="w-full lg:w-1/2 text-center">
			<CardHeader>
				<CardTitle>
					<p class="text-2xl">Go to to <strong>fibertime.tv</strong> on your mobile device and enter this code
					</p>
				</CardTitle>
			</CardHeader>
			<CardContent class="flex justify-center">

			</CardContent>
			<CardFooter class="flex justify-center">
				<p class="text-xl">Go to to <strong>fibertime.tv</strong> on your mobile device and enter this
					code
				</p>
			</CardFooter>
		</Card>
	</div>
</template>
<script setup>
	import { Button } from '@/components/ui/button'
	import {
		Card,
		CardContent,
		CardDescription,
		CardFooter,
		CardHeader,
		CardTitle,
	} from '@/components/ui/card'
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
		PinInputSeparator
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
</script>