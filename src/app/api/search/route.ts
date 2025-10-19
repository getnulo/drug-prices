export const runtime = 'nodejs';

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { handleApiError } from "@/lib/api/errorHandler";
import { z } from "zod";

// Define your input shape and requirements
const searchSchema = z.object({
  rxCui: z.string().min(1, "Missing rxCui"),
  strength: z.string().min(1, "Missing strength"),
  quantity: z.number().positive("Quantity must be positive"),
  zip: z.string().regex(/^\d{5}$/, "ZIP must be 5 digits"),
});

// Helper for miles between two coordinates
function milesBetween(a: { lat: number, lng: number }, b: { lat: number, lng: number }) {
  const toRad = (x: number) => x * Math.PI / 180;
  const R = 3958.8;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Use Zod to parse and validate input
    const parsed = searchSchema.safeParse({
      rxCui: String(body.rxCui || "").trim(),
      strength: String(body.strength || "").trim(),
      quantity: Number(body.quantity),
      zip: String(body.zip || "").trim(),
    });

    if (!parsed.success) {
      const errorList = parsed.error?.errors?.map(e => e.message) ?? ["Unknown validation error"];
      return NextResponse.json({
        error: "Invalid input",
        details: errorList,
      }, { status: 400 });
    }

    const { rxCui, strength, quantity, zip } = parsed.data;

    await prisma.searchQuery.create({ data: { rxCui, strength, quantity, zip } });
    const z = await prisma.zip.findUnique({ where: { zip } });

    // Simulated mock offers
    const mockOffers = [
      {
        source: "goodrx",
        drugRxCui: rxCui,
        drugName: "Amoxicillin",
        form: "capsule",
        strength, quantity,
        priceSubtotal: 7.99, priceFees: 0, shipping: null,
        totalPrice: 7.99, pickupOrMail: "pickup",
        pharmacyName: "CVS Pharmacy", pharmacyAddr: "123 Main St",
        pharmacyLat: z ? z.lat + 0.02 : null, pharmacyLng: z ? z.lng + 0.01 : null,
        terms: "Coupon at checkout",
      },
      {
        source: "costplus",
        drugRxCui: rxCui,
        drugName: "Amoxicillin",
        form: "capsule",
        strength, quantity,
        priceSubtotal: 5.00, priceFees: 5.00, shipping: 5.00,
        totalPrice: 15.00, pickupOrMail: "mail",
        pharmacyName: null, pharmacyAddr: null, pharmacyLat: null, pharmacyLng: null,
        terms: "Membership optional",
      },
      {
        source: "amazon",
        drugRxCui: rxCui,
        drugName: "Amoxicillin",
        form: "capsule",
        strength, quantity,
        priceSubtotal: 9.49, priceFees: 0, shipping: 0,
        totalPrice: 9.49, pickupOrMail: "mail",
        pharmacyName: null, pharmacyAddr: null, pharmacyLat: null, pharmacyLng: null,
        terms: "Prime Rx estimate",
      },
    ];

    const offers = (() => {
      if (!z) return [...mockOffers].sort((a, b) => a.totalPrice - b.totalPrice);
      const userPt = { lat: z.lat, lng: z.lng };
      const withDistance = mockOffers.map(o => {
        if (o.pharmacyLat && o.pharmacyLng) {
          const miles = milesBetween(userPt, { lat: o.pharmacyLat, lng: o.pharmacyLng });
          return { ...o, distanceMiles: miles };
        }
        return { ...o, distanceMiles: null };
      });
      withDistance.sort((a, b) => {
        if (a.totalPrice !== b.totalPrice) return a.totalPrice - b.totalPrice;
        return (a.distanceMiles ?? 999) - (b.distanceMiles ?? 999);
      });
      return withDistance;
    })();

    return NextResponse.json({ offers });
  } catch (error) {
    const { status, message } = handleApiError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
