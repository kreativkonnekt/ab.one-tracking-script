const abone = (tests: any) => {
	log("Hello World");

	log(window.Shopify);
};

const log = (message: string) => {
	const prefix = "[AB.ONE] ";

	console.log(prefix + message);
};
