import React, { useEffect, useState } from "react";
import { api } from "~/trpc/react";

interface CountryData {
  country: string;
  cities: string[];
}

interface Props {
  selected: string;
  setSelected: (val: string) => void;
}

export default function LocationSearch({ selected, setSelected }: Props) {
  const { data, isLoading } = api.locatiosns.locations.useQuery();
  const countryData: CountryData[] = data ?? [];

  const [query, setQuery] = useState("");
  const [filtered, setFiltered] = useState<CountryData[]>([]);

  useEffect(() => {
    if (!countryData.length) return;

    if (!query) {
      setFiltered(countryData);
      return;
    }

    const lower = query.toLowerCase();
    const filteredData = countryData
      .map((c) => ({
        ...c,
        cities: c.cities.filter((city) => city.toLowerCase().includes(lower)),
      }))
      .filter(
        (c) => c.country.toLowerCase().includes(lower) || c.cities.length > 0,
      );

    setFiltered(filteredData);
  }, [query, countryData]);

  if (isLoading) {
    return <p className="p-4 text-gray-500">Loading...</p>;
  }

  if (!countryData) {
    return <div>No Data Found</div>;
  }
  return (
    <div className="mx-auto w-full max-w-lg p-4">
      <input
        type="text"
        placeholder="Search country or city..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full rounded-lg border px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
      />

      {query && (
        <div className="mt-4 max-h-80 overflow-y-auto rounded-lg border p-2">
          {filtered.length === 0 ? (
            <p className="text-gray-500">No results</p>
          ) : (
            filtered.map((c) => (
              <div key={c.country} className="mb-3">
                <p
                  className={`cursor-pointer font-semibold ${
                    selected === c.country ? "text-blue-600" : ""
                  }`}
                  onClick={() => setSelected(c.country)}
                >
                  {c.country}
                </p>
                <ul className="ml-4 text-sm text-gray-700">
                  {c.cities.slice(0, 5).map((city, index) => (
                    <li
                      key={city + index}
                      className={`cursor-pointer ${
                        selected === city ? "text-blue-600" : ""
                      }`}
                      onClick={() => setSelected(city)}
                    >
                      {city}
                    </li>
                  ))}
                  {c.cities.length > 5 && (
                    <li className="text-gray-400">
                      + {c.cities.length - 5} more
                    </li>
                  )}
                </ul>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
