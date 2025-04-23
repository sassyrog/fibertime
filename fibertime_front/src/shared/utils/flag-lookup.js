import * as Flags from "country-flag-icons/string/3x2";

const fallbackSvg =
	'<svg width="20" height="15" viewBox="0 0 20 15"><rect width="20" height="15" fill="#ccc"/></svg>';

export const getFlag = (code) => {
	return Flags[code] || fallbackSvg;
};
