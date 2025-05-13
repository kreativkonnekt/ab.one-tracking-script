type Device = "mobile" | "tablet" | "desktop";

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

declare var Shopify: any;
