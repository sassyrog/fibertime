import debounce from "lodash/debounce";

export default function setupInactivityLogout({
	refreshInterval = 1000 * 60 * 15,
	inactivityLimit = 1000 * 60 * 60,
	logoutCallback,
	refreshTokenCallback,
}) {
	let inactivityTimer = null;

	const logoutUser = function () {
		if (typeof logoutCallback === "function") {
			// Schedule logout in next event loop cycle
			setTimeout(() => logoutCallback(), 0);
		} else {
			console.warn("No logout callback provided.");
		}
	};

	// Function to reset the inactivity timer
	const resetInactivityTimer = function () {
		if (inactivityTimer) clearTimeout(inactivityTimer);
		inactivityTimer = setTimeout(logoutUser, inactivityLimit);
	};

	// Function to refresh token asynchronously
	const refreshToken = async function () {
		if (typeof refreshTokenCallback === "function") {
			setTimeout(async () => {
				// Offload from main thread
				try {
					await refreshTokenCallback();
					resetInactivityTimer();
				} catch (error) {
					console.error("Error refreshing token:", error);
				}
			}, 0);
		} else {
			console.warn("No refresh token callback provided.");
		}
	};

	// Debounced refresh function (refresh every 15 min by default)
	const debouncedTokenRefresh = debounce(refreshToken, refreshInterval, {
		trailing: true,
	});

	// User actions to track activity
	const userActions = ["click", "scroll", "keydown", "mousemove"];

	// Attach event listeners
	userActions.forEach((action) => {
		window.addEventListener(action, () => {
			resetInactivityTimer();
			debouncedTokenRefresh();
		});
	});

	// Start inactivity timer using requestIdleCallback if available
	if ("requestIdleCallback" in window) {
		requestIdleCallback(() => resetInactivityTimer());
	} else {
		resetInactivityTimer();
	}

	// Remove event listeners on unload
	window.addEventListener("unload", () => {
		userActions.forEach((action) => {
			window.removeEventListener(action, resetInactivityTimer);
			window.removeEventListener(action, debouncedTokenRefresh);
		});
	});
}
