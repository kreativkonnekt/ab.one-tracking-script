//
// Config
//

const config = {
	debug: true,
	prefix: "ab.one",
	localStorageKey: "ab.one_visitor",
};

//
// Utilities
//

/** Custom log prefix, used to make debugging easier. */
const log = (...args: any[]) => {
	if (!config.debug) return;
	console.log(`[${config.prefix}]`, ...args);
};

/** Custom error log prefix, used to make debugging easier. */
const error = (...args: any[]) => {
	if (!config.debug) return;

	console.error(`[${config.prefix}]`, ...args);
};

/** Returns the device type of the visitor. */
const getDeviceType = (): Device => {
	const ua = navigator.userAgent;

	if (/Tablet|iPad/i.test(ua)) return "tablet";
	if (/Mobile|Android|iPhone|iPod|IEMobile|BlackBerry/i.test(ua))
		return "mobile";
	return "desktop";
};

/** Returns the referring domain. */
const getReferringDomain = (referrer: string): string => {
	if (!referrer) return "";

	return new URL(referrer).hostname;
};

/** Returns the visitors UTM parameters. */
const getUTMParameters = (): Record<string, string> => {
	const params = new URLSearchParams(window.location.search);
	const keys = [
		"utm_source",
		"utm_medium",
		"utm_campaign",
		"utm_term",
		"utm_content",
	];

	return keys.reduce((acc, key) => {
		const value = params.get(key);
		if (value) acc[key] = value;
		return acc;
	}, {} as Record<string, string>);
};

/** Generates a UUID */
const generateUUID = (): string => {
	return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
		var r = (Math.random() * 16) | 0,
			v = c == "x" ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
};

/** Emits an event to the Shopify pixel. */
const emit = (eventType: string, eventData: any = null): void => {
	try {
		Shopify.analytics.publish(`abone_${eventType}`, eventData ?? undefined);

		log({ eventType, eventData });
	} catch (e) {
		error("Could not send event:", e);
	}
};

/** Load or create the visitor. */
const loadVisitor = (): Visitor => {
	let foundVisitor = true;
	let visitor: Visitor = JSON.parse(
		localStorage.getItem(config.localStorageKey) || "{}"
	);

	if (!visitor.id) {
		foundVisitor = false;

		visitor = {
			id: generateUUID(),
		};

		localStorage.setItem(config.localStorageKey, JSON.stringify(visitor));
	}

	log(`${foundVisitor ? "Loaded" : "Created"} visitor.`, visitor);

	return visitor;
};

//
// Main script
//

const abone = {
	init(tests: any, templateName: string, shopId: number, localization: any) {
		log({ tests, templateName, shopId, localization });

		if (Shopify.designMode)
			return log("Design mode detected. Abandoning script execution.");

		const visitor = loadVisitor();
	},
	reset() {
		log("Resetting tracking script.");
	},
};
