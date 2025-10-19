import type { Offer } from "./types";

export async function amazonMock(args: {
  drugRxCui: string;
  drugName: string;
  form: string;
  strength: string;
  quantity: number;
  zip?: string;
}): Promise<Offer[]> {
  const { drugRxCui, drugName, form, strength, quantity } = args;
  return [
    {
      source: "amazon",
      drugRxCui,
      drugName,
      form,
      strength,
      quantity,
      priceSubtotal: 9.49,
      priceFees: 0,
      shipping: 0,
      totalPrice: 9.49,
      pickupOrMail: "mail",
      pharmacyName: null,
      pharmacyAddr: null,
      pharmacyLat: null,
      pharmacyLng: null,
      terms: "Prime Rx estimate",
    },
  ];
}
