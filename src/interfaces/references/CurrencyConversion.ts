export interface CurrencyConversion {
  fromCurrency: string;
  toCurrency: string;
  value: number;
  // Joined in by the backend from the Currency master for display only (e.g.
  // "USD - US Dollar") - not sent back on create/update.
  fromCurrencyName?: string;
  toCurrencyName?: string;
}
