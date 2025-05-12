const abone = (tests: any) => {
	try {
		if (Shopify) {
			console.log("abone", Shopify);
		} else {
			throw new Error("Shopify is not defined");
		}
	} catch (err) {
		console.log("abone", err);
	}
};
