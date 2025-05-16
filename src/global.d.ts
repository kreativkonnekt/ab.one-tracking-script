type Device = "all" | "mobile" | "desktop";

type UtmParameter =
	| "utm_source"
	| "utm_medium"
	| "utm_campaign"
	| "utm_term"
	| "utm_content";

type PrimaryGoalMetrics = "aov" | "cvr" | "rpv" | "ctr" | "atc";

type TemplateCategory =
	| "index"
	| "collection"
	| "product"
	| "blog"
	| "page"
	| "cart"
	| "list-collections"
	| "search"
	| "article";

interface Condition {
	key: string;
	operator: "=" | "!=" | ">" | "<" | ">=" | "<=" | "contains" | "not_contains";
	values: string[];
}

interface Variant {
	id: number;
	suffix: string;
}

interface Visitor {
	id: string;
	createdAt: string;
	shopifyClientId: string;
	device: {
		type: Device;
		viewport: {
			width: number;
			height: number;
		};
	};
	utmParams: Record<UtmParameter, string>;
	referrer: Document["referrer"];
	referringDomain: string;
	localization: any;
	assignments: Assignment[];
}

interface Assignment {
	testId: number;
	variantSuffix: string;
	assignedAt: string;
}

interface Test {
	id: number;
	category: TemplateCategory;
	primaryGoalMetric: PrimaryGoalMetrics;
	deviceType: Device;
	visitorType: "all" | "new" | "returning";
	traffic: number;
	variants: Variant[];
	conditions: Condition[];
}

declare var Shopify: any;
