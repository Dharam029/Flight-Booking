/** Prices in the database are stored in USD. */
export const CURRENCIES = {
    USD: { code: "USD", symbol: "$", label: "US Dollar", rate: 1 },
    INR: { code: "INR", symbol: "₹", label: "Indian Rupee", rate: 83.5 },
    CNY: { code: "CNY", symbol: "¥", label: "Chinese Yuan", rate: 7.24 },
};

export const convertFromUsd = (amountUsd, currencyCode) => {
    const currency = CURRENCIES[currencyCode] || CURRENCIES.USD;
    return amountUsd * currency.rate;
};

export const formatPrice = (amountUsd, currencyCode) => {
    const currency = CURRENCIES[currencyCode] || CURRENCIES.USD;
    const value = convertFromUsd(amountUsd, currencyCode);
    const decimals = currencyCode === "INR" ? 0 : 2;
    return `${currency.symbol}${value.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    })}`;
};
