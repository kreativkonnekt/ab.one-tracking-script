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
        return "tablet";
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
//
// Main script
//
const abone = (tests, templateName, shopId, localization) => {
    console.log({ tests, templateName, shopId, localization });
    if (Shopify.designMode)
        return log("Design mode detected. Abandoning script execution.");
    emit("pageview", {
        device: getDeviceType(),
        utmParams: getUTMParameters(),
        referrer: getReferringDomain(document.referrer),
    });
    log("Script loaded successfully.");
};
