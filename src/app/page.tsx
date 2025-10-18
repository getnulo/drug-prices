export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-2xl">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold">Find the Cheapest Prescription Prices</h1>
          <p className="text-gray-600 mt-2">
            Compare prices across major pharmacies in seconds.
          </p>
        </div>

        {/* Search Card */}
        <div className="bg-white rounded-2xl shadow p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Drug</label>
              <input
                placeholder="e.g., Amoxicillin"
                className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black/10"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Strength</label>
              <input
                placeholder="e.g., 500 mg"
                className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black/10"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Quantity</label>
              <input
                type="number"
                min={1}
                defaultValue={30}
                className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black/10"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">ZIP code</label>
              <input
                placeholder="e.g., 78701"
                maxLength={5}
                className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black/10"
              />
            </div>
          </div>

          <button
            disabled
            className="w-full rounded-xl px-4 py-3 bg-black text-white disabled:opacity-70"
            title="We’ll enable this after we add the API."
          >
            Search (coming soon)
          </button>
        </div>

        {/* Tiny disclaimer */}
        <p className="text-xs text-gray-500 text-center mt-4">
          Prices are estimates from publicly visible information. Always verify on the source site.
        </p>
      </div>
    </main>
  );
}
