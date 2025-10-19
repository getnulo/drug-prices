import type { Offer } from "./types";

export async function costplusMock(args: {
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
      source: "costplus",
      drugRxCui,
      drugName,
      form,
      strength,
      quantity,
      priceSubtotal: 5.00,
      priceFees: 5.00,
      shipping: 5.00,
      totalPrice: 15.00,
      pickupOrMail: "mail",
      pharmacyName: null,
      pharmacyAddr: null,
      pharmacyLat: null,
      pharmacyLng: null,
      terms: "Membership optional",
    },
  ];
}
