import { createContext, useContext, useState, useEffect } from "react";
import { CURRENCIES, formatPrice, convertFromUsd } from "../utils/currency";

const CurrencyContext = createContext(null);

export const CurrencyProvider = ({ children }) => {
    const [currency, setCurrency] = useState(
        () => localStorage.getItem("currency") || "USD"
    );

    useEffect(() => {
        localStorage.setItem("currency", currency);
    }, [currency]);

    const format = (amountUsd) => formatPrice(amountUsd, currency);
    const convert = (amountUsd) => convertFromUsd(amountUsd, currency);

    return (
        <CurrencyContext.Provider
            value={{ currency, setCurrency, format, convert, currencies: CURRENCIES }}
        >
            {children}
        </CurrencyContext.Provider>
    );
};

export const useCurrency = () => useContext(CurrencyContext);
