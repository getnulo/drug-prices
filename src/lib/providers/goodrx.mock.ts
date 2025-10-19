import { PriceQuote } from "./types";

export async function goodRxMock(args: {
  drug: string;
  strength: string;
  quantity: number;
  zip?: string;
}): Promise<PriceQuote[]> {
  const { drug, strength, quantity } = args;
  return [
    {
      source: "goodrx",
      drug,
      strength,
      quantity,
      priceCents: 1599,
      url: "https://www.goodrx.com/",
      updatedAt: new Date().toISOString()
    }
  ];
}
