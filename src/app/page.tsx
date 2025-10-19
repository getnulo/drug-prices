"use client";

import { useEffect, useRef, useState } from "react";

type Suggestion = {
  rxCui: string;
  name: string;
  forms: string[];
  strengths: string[];
};

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
  // ===== form state =====
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [rxCui, setRxCui] = useState<string | null>(null);
  const [strength, setStrength] = useState("");
  const [quantity, setQuantity] = useState<number>(30);
  const [zip, setZip] = useState("");
  const [results, setResults] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // ===== autocomplete helpers =====
  const [open, setOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState<number>(-1);
  const lastFetchId = useRef(0);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // ---- Debounced autocomplete fetch (runs 200ms after you stop typing) ----
  useEffect(() => {
    // clear any previous timer
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    // guard: don’t fetch for very short strings
    if (query.trim().length < 2) {
      setSuggestions([]);
      setOpen(false);
      setHighlightIndex(-1);
      return;
    }

    debounceTimer.current = setTimeout(async () => {
      try {
        setErrorMsg(null);
        const fetchId = ++lastFetchId.current;

        const res = await fetch(`/api/autocomplete?q=${encodeURIComponent(query)}`, {
          cache: "no-store",
        });
        if (!res.ok) return; // silent fail is fine for autocomplete UX

        const data: Suggestion[] = await res.json();

        // Only set results if this is the latest request (prevents “race” bugs)
        if (fetchId === lastFetchId.current) {
          setSuggestions(data);
          setOpen(data.length > 0);
          setHighlightIndex(data.length > 0 ? 0 : -1);
        }
      } catch {
        // ignore network flakiness for autocomplete; you still can type/search
      }
    }, 200);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [query]);

  // ---- Choose a suggestion (click or keyboard) ----
  function chooseSuggestion(s: Suggestion) {
    setRxCui(s.rxCui);
    setQuery(s.name);
    setStrength(s.strengths?.[0] || "");
    setSuggestions([]);
    setOpen(false);
    setHighlightIndex(-1);
  }

  // ---- Keyboard navigation on the input ----
  function onInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((i) => (i - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === "Enter") {
      if (highlightIndex >= 0 && highlightIndex < suggestions.length) {
        e.preventDefault();
        chooseSuggestion(suggestions[highlightIndex]);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      setHighlightIndex(-1);
    }
  }

  // ---- Slight delay on blur so clicks on the menu still register ----
  function onInputBlur() {
    setTimeout(() => setOpen(false), 120);
  }

  // ---- Your existing search handler (unchanged except minor cleanup) ----
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
        body: JSON.stringify({ rxCui, strength, quantity, zip }),
      });

      const data: { offers?: Offer[]; error?: string } = await res.json();

      if (!res.ok) {
        setErrorMsg(data?.error || "Search failed");
      } else {
        const offers = data.offers || [];
        setResults(offers);
        if (offers.length === 0) {
          setErrorMsg("No offers found. Try ZIPs: 78701, 10001, 94103.");
        }
      }
    } catch {
      setErrorMsg("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Drug Price Finder</h1>

      {/* Autocomplete input */}
      <div className="relative mb-2">
        <input
          ref={inputRef}
          type="text"
          placeholder="Enter drug name…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true); // open as soon as they type
          }}
          onKeyDown={onInputKeyDown}
          onBlur={onInputBlur}
          className="border p-2 w-full rounded"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls="drug-suggestions"
          aria-activedescendant={
            highlightIndex >= 0 ? `suggestion-${highlightIndex}` : undefined
          }
        />

        {open && suggestions.length > 0 && (
          <ul
            id="drug-suggestions"
            role="listbox"
            className="absolute z-10 w-full bg-white border rounded mt-1 shadow max-h-64 overflow-auto"
          >
            {suggestions.map((s, idx) => {
              const highlighted = idx === highlightIndex;
              return (
                <li
                  id={`suggestion-${idx}`}
                  role="option"
                  aria-selected={highlighted}
                  key={s.rxCui}
                  onMouseDown={(e) => e.preventDefault()} // keep focus so click works cleanly
                  onClick={() => chooseSuggestion(s)}
                  className={`p-2 cursor-pointer ${
                    highlighted ? "bg-gray-100" : "hover:bg-gray-50"
                  }`}
                >
                  {s.name}
                </li>
              );
            })}
          </ul>
        )}
      </div>

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
          onChange={(e) => setQuantity(parseInt(e.target.value || "0"))}
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

      {errorMsg && <div className="mt-4 text-sm text-red-600">{errorMsg}</div>}

      {results.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Results</h2>
          {results.map((r, i) => (
            <div key={i} className="border p-3 rounded mb-2">
              <div className="font-bold">{r.source.toUpperCase()}</div>
              <div>${r.totalPrice.toFixed(2)}</div>
              {r.pharmacyName && (
                <div className="text-sm text-gray-600">
                  {r.pharmacyName}{" "}
                  {r.distanceMiles != null ? `(${r.distanceMiles.toFixed(1)} mi)` : ""}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
