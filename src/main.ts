interface Visitor {
	id: string;
	// shopifyClientId: string;
	// device: {
	// 	type: "mobile" | "tablet" | "desktop";
	// 	viewport: {
	// 		width: number;
	// 		height: number;
	// 	};
	// };
	// utmParams:
	// 	| "utm_source"
	// 	| "utm_medium"
	// 	| "utm_campaign"
	// 	| "utm_term"
	// 	| "utm_content";

	// createdAt: string;
	// updatedAt: string;
}

const CONFIG = {
	/** The key for the localstorage. */
	LS_KEY: "abone_visitor",
};

const abone = (tests: any) => {
	if (!Shopify) {
		console.error("Shopify is not defined");
		return;
	}

	console.log(getVisitor());
};

const getVisitor = () => {
	const visitor = localStorage.getItem(CONFIG.LS_KEY);

	const createVisitor = () => {
		const visitor: Visitor = {
			id: crypto.randomUUID(),
		};

		localStorage.setItem(CONFIG.LS_KEY, JSON.stringify(visitor));
		return visitor;
	};

	if (!visitor) {
		console.log("No visitor found, creating a new one");
		return createVisitor();
	}

	return JSON.parse(visitor);
};

const generateUUID = (): string => {
	return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
		const r = (Math.random() * 16) | 0;
		const v = c === "x" ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
};
