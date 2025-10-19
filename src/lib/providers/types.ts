// src/lib/providers/types.ts

export type OfferSource = "goodrx" | "costplus" | "amazon";

export interface Offer {
  source: OfferSource;
  drugRxCui: string;
  drugName: string;
  form: string;
  strength: string;
  quantity: number;
  priceSubtotal: number;
  priceFees: number;
  shipping: number | null;
  totalPrice: number;
  pickupOrMail: "pickup" | "mail";
  pharmacyName: string | null;
  pharmacyAddr: string | null;
  pharmacyLat: number | null;
  pharmacyLng: number | null;
  terms: string;
  distanceMiles?: number | null;
}

// The full shape returned by /api/search
export interface SearchResponse {
  offers: Offer[];
}
