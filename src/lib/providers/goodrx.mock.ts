import type { Offer } from "./types";

export async function goodrxMock(args: {
  drugRxCui: string;
  drugName: string;
  form: string;
  strength: string;
  quantity: number;
  zip?: string;
}): Promise<Offer[]> {
  const { drugRxCui, drugName, form, strength, quantity, zip } = args;
  // Example with a mock pharmacy
  return [
    {
      source: "goodrx",
      drugRxCui,
      drugName,
      form,
      strength,
      quantity,
      priceSubtotal: 7.99,
      priceFees: 0,
      shipping: null,
      totalPrice: 7.99,
      pickupOrMail: "pickup",
      pharmacyName: "CVS Pharmacy",
      pharmacyAddr: "123 Main St",
      pharmacyLat: zip ? 40.01 : null,  // Example coordinate; replace or add logic from your DB if needed
      pharmacyLng: zip ? -73.99 : null,
      terms: "Coupon at checkout",
    },
  ];
}
