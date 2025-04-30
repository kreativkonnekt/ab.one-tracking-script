declare var Shopify: {
	theme: {
		name: string;
		id: number;
		schema_name: string;
		schema_version: string;
		theme_store_id: number | null;
		role: string;
		handle: string | null;
		style: {
			id: number | null;
			handle: string | null;
		};
	};
	shop: string;
	locale: string;
	currency: {
		active: string;
		rate: string;
	};
	country: string;
	cdnHost: string;
	routes: {
		root: string;
	};
	ce_forms: {
		q: any[];
	};
	captcha: Record<string, unknown>;
	PaymentButton: {
		isStorefrontPortableWallets: boolean;
	};
	analytics: {
		replayQueue: any[];
		initialized: boolean;
	};
	modules: boolean;
	featureAssets: {
		"shop-js": Record<string, unknown>;
	};
	trackingConsent: {
		unstable: Record<string, unknown>;
		__metadata__: {
			name: string;
			version: string;
			description: string;
		};
	};
	customerPrivacy: {
		unstable: Record<string, unknown>;
		__metadata__: {
			name: string;
			version: string;
			description: string;
		};
	};
};
