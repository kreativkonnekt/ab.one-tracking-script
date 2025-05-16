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
const log = (...args) => {
    if (!config.debug)
        return;
    console.log(`[${config.prefix}]`, ...args);
};
/** Custom error log prefix, used to make debugging easier. */
const error = (...args) => {
    if (!config.debug)
        return;
    console.error(`[${config.prefix}]`, ...args);
};
/** Returns the device type of the visitor. */
const getDeviceType = () => {
    const ua = navigator.userAgent;
    if (/Tablet|iPad/i.test(ua))
        return "mobile"; // normally this is a tablet
    if (/Mobile|Android|iPhone|iPod|IEMobile|BlackBerry/i.test(ua))
        return "mobile";
    return "desktop";
};
/** Returns the referring domain. */
const getReferringDomain = (referrer) => {
    if (!referrer)
        return "";
    return new URL(referrer).hostname;
};
/** Returns the visitors UTM parameters. */
const getUTMParameters = () => {
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
        if (value)
            acc[key] = value;
        return acc;
    }, {});
};
/** Generates a UUID */
const generateUUID = () => {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        var r = (Math.random() * 16) | 0, v = c == "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
};
/** Get a cookie by its name */
const getCookie = (name) => {
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
const emit = (eventType, eventData = null) => {
    try {
        Shopify.analytics.publish(`abone_${eventType}`, eventData !== null && eventData !== void 0 ? eventData : undefined);
        log({ eventType, eventData });
    }
    catch (e) {
        error("Could not send event:", e);
    }
};
/** Load or create the visitor. */
const loadVisitor = () => {
    let foundVisitor = true;
    let visitor = JSON.parse(localStorage.getItem(config.localStorageKey) || "{}");
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
                currency: Shopify.currency.active,
            },
            assignments: [],
        };
    }
    log(`${foundVisitor ? "Loaded" : "Created"} visitor.`, visitor);
    return visitor;
};
/** Save/Update the visitor */
const saveVisitor = (visitor) => {
    localStorage.setItem(config.localStorageKey, JSON.stringify(visitor));
    log("Saved visitor.", visitor);
};
/** Checks if a user fullfils conditions of a test. */
const validateConditions = (conditions, visitor) => {
    conditions.every((condition) => { });
};
/** Process all tests. */
const getRelevantTests = (tests, templateName, visitor) => {
    if (!tests.length)
        return [];
    const relevantTests = tests.filter((test) => {
        if (test.deviceType !== visitor.device.type && test.deviceType !== "all")
            return false;
        if (test.category !== templateName)
            return false;
        return true;
    });
    return relevantTests;
};
/** Apply relevant tests. */
const applyTests = (relevantTests, visitor) => {
    if (!relevantTests.length)
        return log("No relevant tests found.");
    for (let i = 0; i < relevantTests.length; i++) {
        const test = relevantTests[i];
        let variantSuffix = null;
        const assignment = visitor.assignments.find((a) => a.testId === test.id);
        if (assignment) {
            // Visitor is already assigned to a variant of the current test
            variantSuffix = assignment.variantSuffix;
            log("Already assigned", variantSuffix);
        }
        else {
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
const applyVariant = (test, variantSuffix) => {
    const url = new URL(window.location.href);
    const view = url.searchParams.get("view");
    if (!view && !variantSuffix)
        return;
    if (!view && variantSuffix) {
        url.searchParams.set("view", variantSuffix);
        window.location.replace(url.toString());
        return;
    }
    if (view && !variantSuffix) {
        // If the view is set but the variant suffix is not, remove the view parameter
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
    init(tests, templateName, shopId, localization) {
        if (Shopify.designMode)
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
