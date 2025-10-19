export type PriceQuote = {
  source: "goodrx" | "costplus" | "amazon";
  drug: string;
  strength: string;
  quantity: number;
  priceCents: number;
  url?: string;
  pharmacy?: string;
  updatedAt: string;
};
