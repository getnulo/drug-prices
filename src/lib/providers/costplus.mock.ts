import { PriceQuote } from "./types";

export async function costPlusMock(args: {
  drug: string;
  strength: string;
  quantity: number;
  zip?: string;
}): Promise<PriceQuote[]> {
  const { drug, strength, quantity } = args;
  return [
    {
      source: "costplus",
      drug,
      strength,
      quantity,
      priceCents: 1299,
      url: "https://costplusdrugs.com/",
      updatedAt: new Date().toISOString()
    }
  ];
}
