"use client";

import { useState, useEffect } from "react";

interface Drug {
  name: string;
  generic: string;
  typicalDosages?: string[];
  rxCui?: string;
}

interface Offer {
  pharmacyName: string | null;
  price: number;
  rawPriceText?: string | null;
  source?: string;
}

export default function HomePage() {
  const [drugInput, setDrugInput] = useState("");
  const [rxCui, setRxCui] = useState("");
  const [autocomplete, setAutocomplete] = useState<Drug[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [hasTypedAfterSelect, setHasTypedAfterSelect] = useState(false);

  const [typicalDosages, setTypicalDosages] = useState<string[]>([]);
  const [strength, setStrength] = useState("");
  const [quantity, setQuantity] = useState(30);
  const [zip, setZip] = useState("");
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sortMethod, setSortMethod] = useState<"price" | "distance">("price");

  useEffect(() => {
    if (drugInput.length < 2) {
      setAutocomplete([]);
      setShowDropdown(false);
      setHasTypedAfterSelect(false);
      setTypicalDosages([]);
      return;
    }
    const timeout = setTimeout(async () => {
      const res = await fetch(`/api/autocomplete?q=${encodeURIComponent(drugInput)}`);
      if (res.ok) {
        const data = await res.json();
        setAutocomplete(data);
        if (hasTypedAfterSelect) setShowDropdown(true);
      } else {
        setAutocomplete([]);
        setShowDropdown(false);
        setTypicalDosages([]);
      }
    }, 200);
    return () => clearTimeout(timeout);
  }, [drugInput, hasTypedAfterSelect]);

  const onInputChange = (val: string) => {
    setDrugInput(val);
    setRxCui("");
    setHasTypedAfterSelect(true);
    setTypicalDosages([]);
    setStrength("");
  };

  const selectDrug = (drug: Drug) => {
    setDrugInput(drug.name);
    setRxCui(drug.rxCui || "");
    setTypicalDosages(drug.typicalDosages || []);
    if (drug.typicalDosages && drug.typicalDosages.length > 0) {
      setStrength(drug.typicalDosages[0]);
    } else {
      setStrength("");
    }
    setAutocomplete([]);
    setShowDropdown(false);
    setHasTypedAfterSelect(false);
  };

  const isFormValid =
    drugInput.trim() !== "" && strength.trim() !== "" && zip.trim().match(/^\d{5}$/);

  async function fetchGoodRxOffers(drugName: string, dosage: string, zip: string) {
    try {
      const res = await fetch('/api/goodrx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ drugName, dosage, zip }),
      });
      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }
      const data = await res.json();
      return data.offers || [];
    } catch (e) {
      console.error("Failed to fetch GoodRx offers", e);
      return [];
    }
  }

  const onSearch = () => {
    if (!isFormValid) {
      setError("Please select a drug, enter strength, and a valid 5-digit ZIP");
      setOffers([]);
      return;
    }
    fetchOffers();
  };

  async function fetchOffers() {
    setLoading(true);
    setError("");
    setOffers([]);

    try {
      const goodRxOffers = await fetchGoodRxOffers(drugInput, strength, zip);
      setOffers(goodRxOffers);
    } catch (error) {
      setError("Failed to fetch offers");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!offers.length) return;
    const sorted = [...offers].sort((a, b) => {
      if (sortMethod === "price") {
        return a.price - b.price;
      }
      return 0;
    });
    setOffers(sorted);
  }, [sortMethod]);

  const clearForm = () => {
    setDrugInput("");
    setRxCui("");
    setTypicalDosages([]);
    setStrength("");
    setQuantity(30);
    setZip("");
    setOffers([]);
    setError("");
    setShowDropdown(false);
    setHasTypedAfterSelect(false);
  };

  return (
    <main className="max-w-xl mx-auto p-4 relative">
      <h1 className="text-2xl font-bold mb-4">Medication Price Search</h1>
      <div className="relative mb-3">
        <input
          type="text"
          placeholder="Drug Name"
          value={drugInput}
          onChange={(e) => onInputChange(e.target.value)}
          onFocus={() => {
            if (autocomplete.length > 0 && hasTypedAfterSelect) setShowDropdown(true);
          }}
          className="border border-gray-300 rounded px-3 py-2 w-full"
          autoComplete="off"
          disabled={loading}
        />
        {showDropdown && autocomplete.length > 0 && (
          <ul className="absolute z-10 bg-white border border-gray-300 w-full max-h-48 overflow-y-auto rounded shadow-md mt-1 text-black">
            {autocomplete.map((drug) => (
              <li
                key={(drug.rxCui || "") + "-" + drug.name}
                className="cursor-pointer px-3 py-2 hover:bg-blue-100 text-black"
                onMouseDown={(e) => {
                  e.preventDefault();
                  selectDrug(drug);
                }}
              >
                {drug.name} <span className="text-xs text-gray-400">({drug.generic})</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mb-3 w-full">
        {typicalDosages && typicalDosages.length > 0 ? (
          <select
            value={strength}
            onChange={(e) => setStrength(e.target.value)}
            disabled={loading}
            className={`border rounded px-3 py-2 w-full ${
              !strength && error ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="" disabled>
              Select Strength
            </option>
            {typicalDosages.map((dose) => (
              <option key={dose} value={dose}>
                {dose}
              </option>
            ))}
          </select>
        ) : (
          <input
            type="text"
            placeholder="Strength (e.g., 250 mg)"
            value={strength}
            onChange={(e) => setStrength(e.target.value)}
            disabled={loading}
            className={`border rounded px-3 py-2 w-full ${
              !strength && error ? "border-red-500" : "border-gray-300"
            }`}
          />
        )}
      </div>

      <input
        type="number"
        min={1}
        placeholder="Quantity"
        value={quantity}
        onChange={(e) => setQuantity(Number(e.target.value))}
        disabled={loading}
        className="border border-gray-300 rounded px-3 py-2 mb-3 w-full"
      />
      <input
        type="text"
        placeholder="ZIP Code"
        value={zip}
        onChange={(e) => setZip(e.target.value)}
        disabled={loading}
        className={`border rounded px-3 py-2 mb-3 w-full ${
          !zip.match(/^\d{5}$/) && error ? "border-red-500" : "border-gray-300"
        }`}
      />

      <div className="flex gap-3 mb-4">
        <button
          onClick={onSearch}
          disabled={!isFormValid || loading}
          className="bg-blue-600 text-white px-4 py-2 rounded flex-grow disabled:opacity-50"
        >
          {loading ? "Searching..." : "Search"}
        </button>
        <button
          onClick={clearForm}
          className="border border-gray-500 px-4 py-2 rounded flex-grow"
          disabled={loading}
        >
          Clear
        </button>
      </div>

      <div className="mb-4 flex gap-4">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="sort"
            checked={sortMethod === "price"}
            onChange={() => setSortMethod("price")}
          />
          Sort by Price
        </label>
      </div>

      {error && <p className="mb-4 text-red-600">{error}</p>}

      <ul className="space-y-4">
        {offers.length === 0 && !loading && !error && (
          <li className="text-gray-500">No offers found</li>
        )}

        {offers.map((offer, idx) => (
          <li
            key={idx}
            className="p-4 border border-gray-200 rounded hover:shadow-md transition"
          >
            <div className="flex justify-between items-center">
              <span className="font-semibold capitalize">{offer.pharmacyName || offer.source || "Unknown"}</span>
              <span className="font-mono">${offer.price.toFixed(2)}</span>
            </div>
            <div className="text-xs text-gray-400 italic">{offer.rawPriceText || ""}</div>
          </li>
        ))}
      </ul>
    </main>
  );
}
