import examples from "libphonenumber-js/mobile/examples";
import { getExampleNumber } from "libphonenumber-js";

export const getPhoneExampleNumber = (countryCode) => {
	const phoneNumber = getExampleNumber(countryCode, examples);
	return phoneNumber.formatNational();
};
