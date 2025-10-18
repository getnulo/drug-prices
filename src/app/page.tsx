"use client";

import { useState } from "react";

type Offer = {
  source: string;
  totalPrice: number;
  pickupOrMail?: string;
  pharmacyName?: string | null;
  distanceMiles?: number | null;
  priceSubtotal?: number;
  priceFees?: number;
  shipping?: number | null;
  terms?: string | null;
};

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [rxCui, setRxCui] = useState<string | null>(null);
  const [strength, setStrength] = useState("");
  const [quantity, setQuantity] = useState<number>(30);   // ← number
  const [zip, setZip] = useState("");
  const [results, setResults] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleAutocomplete(q: string) {
    setQuery(q);
    setErrorMsg(null);
    if (q.length < 2) return setSuggestions([]);
    const res = await fetch(`/api/autocomplete?q=${encodeURIComponent(q)}`);
    const data = await res.json();
    setSuggestions(data);
  }

  async function handleSearch() {
    setErrorMsg(null);
    if (!rxCui) return alert("Pick a drug from the list");
    if (!strength) return alert("Enter or select a strength");
    if (zip.length !== 5) return alert("Enter a 5-digit ZIP");

    setLoading(true);
    setResults([]);

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rxCui,
          strength,
          quantity,           // ← already a number
          zip
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data?.error || "Search failed");
      } else {
        setResults(data.offers || []);
        if ((data.offers || []).length === 0) {
          setErrorMsg("No offers found. Try ZIPs: 78701, 10001, 94103.");
        }
      }
    } catch (e: any) {
      setErrorMsg(e?.message || "Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Drug Price Finder</h1>

      {/* Autocomplete */}
      <input
        type="text"
        placeholder="Enter drug name..."
        value={query}
        onChange={(e) => handleAutocomplete(e.target.value)}
        className="border p-2 w-full rounded mb-2"
      />
      {suggestions.length > 0 && (
        <div className="border rounded bg-white mb-4">
          {suggestions.map((s) => (
            <div
              key={s.rxCui}
              onClick={() => {
                setRxCui(s.rxCui);
                setQuery(s.name);
                setStrength(s.strengths?.[0] || "");
                setSuggestions([]);
              }}
              className="p-2 hover:bg-gray-100 cursor-pointer"
            >
              {s.name}
            </div>
          ))}
        </div>
      )}

      {/* Strength & Quantity */}
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          placeholder="Strength (e.g. 500 mg)"
          value={strength}
          onChange={(e) => setStrength(e.target.value)}
          className="border p-2 flex-1 rounded"
        />
        <input
          type="number"
          placeholder="Qty"
          value={quantity}
          min={1}
          onChange={(e) => setQuantity(parseInt(e.target.value || "0"))}  // ← number
          className="border p-2 w-24 rounded"
        />
      </div>

      {/* Zip Code */}
      <input
        type="text"
        placeholder="ZIP Code"
        value={zip}
        onChange={(e) => setZip(e.target.value.replace(/\D/g, "").slice(0, 5))}
        className="border p-2 w-full rounded mb-4"
      />

      <button
        onClick={handleSearch}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-60"
        disabled={loading}
      >
        {loading ? "Searching..." : "Search"}
      </button>

      {/* Errors / Empty */}
      {errorMsg && <div className="mt-4 text-sm text-red-600">{errorMsg}</div>}

      {/* Results */}
      {results.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Results</h2>
          {results.map((r, i) => (
            <div key={i} className="border p-3 rounded mb-2">
              <div className="font-bold">{r.source.toUpperCase()}</div>
              <div>${r.totalPrice.toFixed(2)}</div>
              {r.pharmacyName && (
                <div className="text-sm text-gray-600">
                  {r.pharmacyName} {r.distanceMiles != null ? `(${r.distanceMiles.toFixed(1)} mi)` : ""}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
