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

//
// Main script
//

const abone = (tests: any) => {
	if (!Shopify) {
		log("Shopify is not defined");
		return;
	}
	console.log(123);
	log("Script loaded successfully.");
};
