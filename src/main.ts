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

	if (/Tablet|iPad/i.test(ua)) return "mobile"; // normally this is a tablet
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
const getUTMParameters = (): Record<UtmParameter, string> => {
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

/** Get a cookie by its name */
const getCookie = (name: string) => {
	const cookies = document.cookie.split(";");

	for (let cookie of cookies) {
		const [key, value] = cookie.trim().split("=");
		if (key === name) {
			return decodeURIComponent(value);
		}
	}

	return null;
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
			createdAt: new Date().toISOString(),
			shopifyClientId: getCookie("_shopify_y") || "",
			device: {
				type: getDeviceType(),
				viewport: {
					width: window.innerWidth,
					height: window.innerHeight,
				},
			},
			utmParams: getUTMParameters(),
			referrer: document.referrer || "",
			referringDomain: getReferringDomain(document.referrer),
			localization: {
				currency: window.Shopify?.currency.active,
			},
			assignments: [],
		};
	}

	log(`${foundVisitor ? "Loaded" : "Created"} visitor.`, visitor);

	return visitor;
};

/** Save/Update the visitor */
const saveVisitor = (visitor: Visitor): void => {
	localStorage.setItem(config.localStorageKey, JSON.stringify(visitor));
	log("Saved visitor.", visitor);
};

/** Checks if a user fullfils conditions of a test. */
const validateConditions = (conditions: Condition[], visitor: Visitor) => {
	conditions.every((condition) => {});
};

/** Process all tests. */
const getRelevantTests = (
	tests: Test[],
	templateName: TemplateCategory,
	visitor: Visitor
): Test[] | [] => {
	if (!tests.length) return [];

	const relevantTests: Test[] = tests.filter((test) => {
		if (test.deviceType !== visitor.device.type && test.deviceType !== "all")
			return false;
		if (test.category !== templateName) return false;

		return true;
	});

	return relevantTests;
};

/** Apply relevant tests. */
const applyTests = (relevantTests: Test[], visitor: Visitor) => {
	if (!relevantTests.length) return log("No relevant tests found.");

	for (let i = 0; i < relevantTests.length; i++) {
		const test = relevantTests[i];

		let variantSuffix: string | null = null;

		const assignment: Assignment | undefined = visitor.assignments.find(
			(a) => a.testId === test.id
		);

		if (assignment) {
			// Visitor is already assigned to a variant of the current test
			variantSuffix = assignment.variantSuffix;

			log("Already assigned", variantSuffix);
		} else {
			// Assign a new variant to the visitor for the current test
			variantSuffix =
				test.variants[Math.floor(Math.random() * test.variants.length)].suffix; //! change this to a weight based selection instead of random

			visitor.assignments.push({
				testId: test.id,
				variantSuffix,
				assignedAt: new Date().toISOString(),
			});

			saveVisitor(visitor);
			log("Assigned variant", variantSuffix);
			emit("variant_assigned", { variantSuffix });
		}

		applyVariant(test, variantSuffix);
	}
};

/** Apply a variant. */
const applyVariant = (test: Test, variantSuffix: string) => {
	const url = new URL(window.location.href);
	const view = url.searchParams.get("view");

	if (!view && !variantSuffix) return;

	if (!view && variantSuffix) {
		url.searchParams.set("view", variantSuffix);
		window.location.replace(url.toString());
		return;
	}

	if (view && !variantSuffix) {
		url.searchParams.delete("view");
		window.location.replace(url.toString());
		return;
	}

	if (view !== variantSuffix) {
		url.searchParams.set("view", variantSuffix);
		window.location.replace(url.toString());
		return;
	}
};

//
// Main script
//

const abone = {
	init(
		tests: Test[],
		templateName: TemplateCategory,
		shopId: number,
		localization: any
	) {
		if (window.Shopify?.designMode)
			return log("Design mode detected. Abandoning script execution.");

		const visitor = loadVisitor();
		const test = getRelevantTests(tests, templateName, visitor);
		const relevantTests = getRelevantTests(tests, templateName, visitor);

		applyTests(relevantTests, visitor);

		log({ relevantTests, tests, templateName, shopId, localization });
	},
	reset() {
		localStorage.removeItem(config.localStorageKey);

		log("Resetting tracking script.");
	},
};
