const abone = (tests: any) => {
	if (Shopify) {
		console.log("abone", Shopify);
	} else {
		console.log("abone", "Shopify is not defined");
	}
};
