<template>
	<div class="grid grid-cols-12">
		<div class="col-span-4">
			<Popover class="w-fit">
				<PopoverTrigger as-child>
					<Button
						variant="outline"
						role="combobox"
						class="w-full justify-between rounded-r-none"
					>
						<div
							v-if="innerModel.code"
							class="flex gap-2 items-center"
						>
							<div v-html="getFlag(innerModel.code)"></div>
							<div> {{ innerModel.dialling_code }}</div>
						</div>
						<span v-else>
							{{ "Country" }}

						</span>
						<ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
					</Button>
				</PopoverTrigger>
				<PopoverContent class="w-[300px] p-0">
					<Command>
						<CommandInput placeholder="Search Country..." />
						<CommandEmpty>Nothing found.</CommandEmpty>
						<CommandList>
							<CommandGroup>
								<CommandItem
									v-for="(c, i) in filteredCountries"
									:key="c.code"
									:value="c.name"
									class="flex justify-between items-center gap-3"
									@select="() => selectCountryCode(c)"
								>
									<div class="flex gap-3 ">
										<div v-html="getFlag(c.code)"></div>
										<div> {{ c.name }}</div>
									</div>
									<strong class="justify-self-end">{{ c.dialling_code }}</strong>
								</CommandItem>
							</CommandGroup>
						</CommandList>
					</Command>
				</PopoverContent>
			</Popover>
		</div>
		<div class="col-span-8 ">
			<FormControl>
				<Input
					v-model="innerModel.number"
					class="rounded-l-none"
					v-bind="attrs"
					type="tel"
					:placeholder="innerModel?.code ? getPhoneExampleNumber(innerModel?.code) : 'Phone Number'"
					@blur="model = cloneDeep(innerModel)"
					@change="model = cloneDeep(innerModel)"
				/>
			</FormControl>
		</div>
	</div>
</template>
<script lang="js" setup>
	import { Button } from '@/components/ui/button'
	import { Input } from "@/components/ui/input";

	import {
		Popover,
		PopoverContent,
		PopoverTrigger,
	} from '@/components/ui/popover'
	import {
		Command,
		CommandEmpty,
		CommandGroup,
		CommandInput,
		CommandItem,
		CommandList,
	} from '@/components/ui/command'
	import {
		FormControl
	} from '@/components/ui/form'
	import { Check, ChevronsUpDown } from 'lucide-vue-next'
	import { getFlag } from '@/shared/utils/flag-lookup'
	import { getPhoneExampleNumber } from '@/shared/utils/phone-examples'
	import { ref, computed } from 'vue'

	import { tryOnMounted } from '@vueuse/shared';
	import { useAttrs } from 'vue'
	import { cloneDeep, find, map } from 'lodash'
	// imports end here


	defineOptions({
		inheritAttrs: false
	})

	const props = defineProps([])
	const emit = defineEmits(['resetForm'])

	const attrs = useAttrs();

	const model = defineModel({ default: {} })
	const innerModel = ref(cloneDeep(model.value))
	const countries = ref([]);
	const filteredCountries = computed(() => countries.value)


	tryOnMounted(async () => {
		const countries_data = await import('@/shared/assets/countries.json')
		countries.value = map(countries_data.default,
			({ name, code, dialling_code }) => ({ name, code, dialling_code }))

		innerModel.value = find(countries.value, ({ code }) => code == 'ZA')

	})

	const selectCountryCode = (country) => {
		innerModel.value = country
	}

</script>
