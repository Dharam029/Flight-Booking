import { useCurrency } from "../context/CurrencyContext";

export default function CurrencySelector() {
    const { currency, setCurrency, currencies } = useCurrency();

    return (
        <select
            className="currency-select"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            aria-label="Display currency"
        >
            {Object.values(currencies).map((c) => (
                <option key={c.code} value={c.code}>
                    {c.code} ({c.symbol})
                </option>
            ))}
        </select>
    );
}
