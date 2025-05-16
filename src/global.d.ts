type Device = "mobile" | "tablet" | "desktop";
type UtmParameter =
	| "utm_source"
	| "utm_medium"
	| "utm_campaign"
	| "utm_term"
	| "utm_content";

interface Visitor {
	id: string;
	createdAt: string;
	shopifyClientId: string;
	device: {
		type: "mobile" | "tablet" | "desktop";
		viewport: {
			width: number;
			height: number;
		};
	};
	utmParams: Record<UtmParameter, string>;
	referrer: Document["referrer"];
	referringDomain: string;
	localization: any;
	tests: [];
}

declare var Shopify: any;
