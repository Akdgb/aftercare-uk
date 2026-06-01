"use client";
import { useState, useMemo } from "react";
import {
  Building2,
  ExternalLink,
  Flame,
  Heart,
  Loader2,
  MapPin,
  Phone,
  Search,
  Trees,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LocalResource } from "@/types";

const RESOURCE_META: Record<
  LocalResource["type"],
  { label: string; icon: React.ElementType; color: string; bg: string }
> = {
  "registry-office": { label: "Registry Office", icon: Building2, color: "text-blue-600", bg: "bg-blue-50" },
  council: { label: "Council", icon: Building2, color: "text-slate-600", bg: "bg-slate-100" },
  cemetery: { label: "Cemetery", icon: Trees, color: "text-emerald-600", bg: "bg-emerald-50" },
  crematorium: { label: "Crematorium", icon: Flame, color: "text-amber-600", bg: "bg-amber-50" },
  "funeral-director": { label: "Funeral Director", icon: Heart, color: "text-rose-600", bg: "bg-rose-50" },
  "faith-organisation": { label: "Faith Organisation", icon: Heart, color: "text-purple-600", bg: "bg-purple-50" },
};

const TYPES: (LocalResource["type"] | "all")[] = [
  "all",
  "registry-office",
  "funeral-director",
  "cemetery",
  "crematorium",
  "faith-organisation",
  "council",
];

type SearchResult = {
  id: string;
  type: LocalResource["type"];
  name: string;
  address: string;
  phone?: string;
  website?: string;
  distance: string;
  lat: number;
  lng: number;
};

export default function ResourcesPage() {
  const [postcode, setPostcode] = useState("");
  const [search, setSearch] = useState("");
  const [activeType, setActiveType] = useState<LocalResource["type"] | "all">("all");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [district, setDistrict] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const doSearch = async () => {
    if (!postcode.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/local-resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postcode: postcode.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Search failed");
      setResults(data.resources ?? []);
      setDistrict(data.centre?.district ?? "");
      setSearched(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return results.filter((r) => {
      const matchType = activeType === "all" || r.type === activeType;
      const matchSearch = !q || r.name.toLowerCase().includes(q) || r.address.toLowerCase().includes(q);
      return matchType && matchSearch;
    });
  }, [results, search, activeType]);

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = { all: results.length };
    results.forEach((r) => { counts[r.type] = (counts[r.type] ?? 0) + 1; });
    return counts;
  }, [results]);

  return (
    <div className="bg-stone-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Local Resources</h1>
            <p className="text-slate-500">
              Find registry offices, funeral directors, cemeteries, crematoriums, and faith organisations near you.
            </p>
          </div>

          {/* Postcode search */}
          <div className="mt-6 flex gap-3 max-w-lg">
            <input
              type="text"
              placeholder="Enter your postcode (e.g. RM1 3BB)"
              value={postcode}
              onChange={(e) => setPostcode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && doSearch()}
              className="flex-1 rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
            <button
              onClick={doSearch}
              disabled={loading || !postcode.trim()}
              className="bg-slate-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 disabled:opacity-50 disabled:pointer-events-none transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
              {loading ? "Searching..." : "Find Services"}
            </button>
          </div>
          {error && (
            <div className="mt-3 flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}
          {searched && !loading && district && (
            <p className="text-xs text-slate-400 mt-2">
              Showing real-time results near <strong className="text-slate-600">{district}</strong> from OpenStreetMap.
            </p>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Before search */}
        {!searched && !loading && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <MapPin className="h-8 w-8 text-slate-400" />
            </div>
            <h2 className="text-lg font-semibold text-slate-700 mb-2">Enter your postcode above</h2>
            <p className="text-slate-400 text-sm max-w-sm mx-auto">
              We search live data to find the nearest funeral directors, cemeteries, crematoriums, and faith organisations to you.
            </p>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center py-16 gap-3 text-slate-500">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            <p className="text-sm">Searching local services near {postcode}...</p>
          </div>
        )}

        {searched && !loading && (
          <>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Filter by name or address..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-stone-300 bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {TYPES.map((type) => {
                  const count = typeCounts[type] ?? 0;
                  if (type !== "all" && count === 0) return null;
                  return (
                    <button
                      key={type}
                      onClick={() => setActiveType(type)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border",
                        activeType === type
                          ? "bg-slate-700 text-white border-slate-700"
                          : "bg-white text-slate-600 border-stone-200 hover:bg-stone-50"
                      )}
                    >
                      {type === "all" ? "All" : RESOURCE_META[type]?.label}
                      <span className={cn("ml-1.5 text-xs", activeType === type ? "text-slate-300" : "text-slate-400")}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <p className="text-sm text-slate-500 mb-5">
              <strong className="text-slate-700">{filtered.length}</strong> result{filtered.length !== 1 ? "s" : ""} found
              {search && ` matching "${search}"`}
            </p>

            {/* Results grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((resource) => {
                const meta = RESOURCE_META[resource.type];
                const Icon = meta?.icon ?? MapPin;
                return (
                  <Card key={resource.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-3 mb-3">
                        <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0", meta?.bg ?? "bg-slate-100")}>
                          <Icon className={cn("h-4 w-4", meta?.color ?? "text-slate-500")} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800 leading-snug">{resource.name}</p>
                          <span className={cn(
                            "inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full",
                            meta?.bg, meta?.color
                          )}>
                            {meta?.label ?? resource.type}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400 flex-shrink-0">{resource.distance}</span>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-start gap-2">
                          <MapPin className="h-3.5 w-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-slate-600 leading-snug">{resource.address}</p>
                        </div>
                        {resource.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                            <a href={`tel:${resource.phone}`} className="text-xs text-slate-600 hover:text-slate-800">
                              {resource.phone}
                            </a>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-3 mt-4 pt-3 border-t border-stone-100">
                        {resource.website && (
                          <a
                            href={resource.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-800 font-medium"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            Website
                          </a>
                        )}
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(resource.name + " " + resource.address)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-800 font-medium"
                        >
                          <MapPin className="h-3.5 w-3.5" />
                          Directions
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                <MapPin className="h-8 w-8 mx-auto mb-3 text-slate-300" />
                <p>No results found. Try adjusting your filters or searching a different postcode.</p>
              </div>
            )}

            <div className="mt-8 bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-sm text-amber-800">
                <strong>Data source:</strong> Results are sourced from OpenStreetMap and may not be exhaustive.
                Always call ahead to confirm availability and opening hours, especially for registering a death.
                Registry office appointments must usually be booked in advance.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
