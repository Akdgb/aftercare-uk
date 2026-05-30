"use client";
import { useState, useMemo } from "react";
import {
  Building2,
  ExternalLink,
  Flame,
  Heart,
  MapPin,
  Phone,
  Search,
  Trees,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

const SAMPLE_RESOURCES: LocalResource[] = [
  {
    id: "1",
    type: "registry-office",
    name: "Havering Register Office",
    address: "Mercury House, Mercury Gardens, Romford, RM1 3DX",
    phone: "01708 432423",
    website: "https://www.havering.gov.uk/registrars",
    distance: "0.8 miles",
  },
  {
    id: "2",
    type: "registry-office",
    name: "Redbridge Register Office",
    address: "Town Hall, 128-142 High Road, Ilford, IG1 1DD",
    phone: "020 8708 3080",
    website: "https://www.redbridge.gov.uk",
    distance: "3.2 miles",
  },
  {
    id: "3",
    type: "funeral-director",
    name: "Coop Funeralcare – Romford",
    address: "12 North Street, Romford, RM1 1BA",
    phone: "01708 740209",
    website: "https://www.coop.co.uk/funeralcare",
    distance: "0.5 miles",
  },
  {
    id: "4",
    type: "funeral-director",
    name: "Lodge Brothers – Harold Wood",
    address: "34 Station Road, Harold Wood, Romford, RM3 0DA",
    phone: "01708 373232",
    website: "https://www.lodgebrothers.co.uk",
    distance: "2.1 miles",
  },
  {
    id: "5",
    type: "funeral-director",
    name: "A. & R. Havering Funeral Services",
    address: "89 Main Road, Gidea Park, Romford, RM2 5EL",
    phone: "01708 740101",
    distance: "1.4 miles",
  },
  {
    id: "6",
    type: "cemetery",
    name: "Romford Cemetery",
    address: "Crow Lane, Romford, RM7 0ES",
    phone: "01708 432423",
    distance: "1.1 miles",
  },
  {
    id: "7",
    type: "cemetery",
    name: "Corbets Tey Cemetery",
    address: "Corbets Tey Road, Upminster, RM14 2BB",
    distance: "3.9 miles",
  },
  {
    id: "8",
    type: "crematorium",
    name: "Havering Crematorium",
    address: "Crow Lane, Romford, RM7 0ES",
    phone: "01708 432140",
    website: "https://www.havering.gov.uk/crematorium",
    distance: "1.1 miles",
  },
  {
    id: "9",
    type: "crematorium",
    name: "Forest Lawn Crematorium",
    address: "Forest Lane, Chigwell Road, Woodford Bridge, IG8 8NX",
    phone: "020 8506 0530",
    distance: "4.2 miles",
  },
  {
    id: "10",
    type: "council",
    name: "Havering Council – Bereavement Services",
    address: "Town Hall, Main Road, Romford, RM1 3BB",
    phone: "01708 432190",
    website: "https://www.havering.gov.uk/bereavement",
    distance: "0.9 miles",
  },
  {
    id: "11",
    type: "faith-organisation",
    name: "St Edward the Confessor Church",
    address: "Market Place, Romford, RM1 3AB",
    phone: "01708 740975",
    distance: "0.6 miles",
  },
  {
    id: "12",
    type: "faith-organisation",
    name: "Romford Islamic Centre",
    address: "49 Victoria Road, Romford, RM1 2JT",
    phone: "01708 730422",
    distance: "0.7 miles",
  },
];

const TYPES: (LocalResource["type"] | "all")[] = [
  "all",
  "registry-office",
  "funeral-director",
  "cemetery",
  "crematorium",
  "council",
  "faith-organisation",
];

export default function ResourcesPage() {
  const [search, setSearch] = useState("");
  const [postcode, setPostcode] = useState("");
  const [activeType, setActiveType] = useState<LocalResource["type"] | "all">("all");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return SAMPLE_RESOURCES.filter((r) => {
      const matchType = activeType === "all" || r.type === activeType;
      const matchSearch =
        !q ||
        r.name.toLowerCase().includes(q) ||
        r.address.toLowerCase().includes(q);
      return matchType && matchSearch;
    });
  }, [search, activeType]);

  return (
    <div className="bg-stone-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Local Resources</h1>
            <p className="text-slate-500">
              Find registry offices, funeral directors, cemeteries, crematoriums, and support services near you.
            </p>
          </div>

          {/* Postcode search */}
          <div className="mt-6 flex gap-3 max-w-lg">
            <div className="flex-1">
              <Input
                placeholder="Enter your postcode (e.g. RM1 3BB)"
                value={postcode}
                onChange={(e) => setPostcode(e.target.value.toUpperCase())}
              />
            </div>
            <button className="bg-slate-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Search
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Showing results for the Havering area. Enter your postcode to see results near you.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name or address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-stone-300 bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {TYPES.map((type) => {
              const label =
                type === "all"
                  ? "All"
                  : RESOURCE_META[type]?.label ?? type;
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
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <p className="text-sm text-slate-500 mb-5">
          Showing <strong className="text-slate-700">{filtered.length}</strong> results
        </p>

        {/* Resource grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((resource) => {
            const meta = RESOURCE_META[resource.type];
            const Icon = meta.icon;
            return (
              <Card key={resource.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0", meta.bg)}>
                      <Icon className={cn("h-4 w-4", meta.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 leading-snug">{resource.name}</p>
                      <Badge
                        variant="default"
                        className={cn("mt-1 text-xs", meta.bg, meta.color, "border-0")}
                      >
                        {meta.label}
                      </Badge>
                    </div>
                    {resource.distance && (
                      <span className="text-xs text-slate-400 flex-shrink-0">{resource.distance}</span>
                    )}
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
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(resource.address)}`}
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
          <div className="text-center py-16 text-slate-500">
            <MapPin className="h-8 w-8 mx-auto mb-3 text-slate-300" />
            <p>No results found. Try adjusting your search or filters.</p>
          </div>
        )}

        {/* Data notice */}
        <div className="mt-10 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-sm text-amber-800">
            <strong>Please note:</strong> Contact details and availability may change. We recommend calling ahead to confirm opening hours, especially for appointments such as registering a death.
          </p>
        </div>
      </div>
    </div>
  );
}
