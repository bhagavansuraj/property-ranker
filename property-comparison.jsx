import { useState } from "react";

// ── Weights (must sum to 100) ─────────────────────────────────────────────────
const DEFAULT_WEIGHTS = { thirdSpace: 35, transport: 30, bedrooms: 20, rent: 15 };

// ── Raw property data ─────────────────────────────────────────────────────────
// thirdSpaceQuality: 1–10 (size, prestige of that specific club)
// thirdSpaceWalkMins: walk in minutes
// tubeWalkMins: walk to nearest tube in minutes
// ogWalkMins: walk to overground/DLR (null = none)
// beds: 1 or 2
// rent: monthly £

const properties = [
  {
    name: "SW Flat",
    area: "South Wimbledon, SW19",
    link: "https://www.rightmove.co.uk/properties/170971703",
    beds: 2, rent: 2300,
    thirdSpaceClub: "Wimbledon",
    thirdSpaceQuality: 7,   // good club, pool, reasonable size
    thirdSpaceWalkMins: 16, // ~0.8 mi
    tubeStation: "South Wimbledon", tubeLine: "Northern", tubeWalkMins: 3,
    overground: "Wimbledon", ogType: "OG", ogWalkMins: 12,
  },
  {
    name: "SW Home",
    area: "South Wimbledon, SW19",
    link: "https://www.rightmove.co.uk/properties/171121424",
    beds: 2, rent: 2300,
    thirdSpaceClub: "Wimbledon",
    thirdSpaceQuality: 7,
    thirdSpaceWalkMins: 16,
    tubeStation: "South Wimbledon", tubeLine: "Northern", tubeWalkMins: 3,
    overground: "Wimbledon", ogType: "OG", ogWalkMins: 12,
  },
  {
    name: "KW Province Square",
    area: "Canary Wharf, E14",
    link: "https://www.rightmove.co.uk/properties/171960056",
    beds: 2, rent: 2200,
    thirdSpaceClub: "Canary Wharf",
    thirdSpaceQuality: 10,  // Europe's largest luxury health club
    thirdSpaceWalkMins: 8,  // ~0.4 mi
    tubeStation: "Canary Wharf", tubeLine: "Jubilee / Elizabeth", tubeWalkMins: 5,
    overground: null, ogType: null, ogWalkMins: null,
  },
  {
    name: "Vantage Mews",
    area: "Blackwall, E14",
    link: "https://www.rightmove.co.uk/properties/171155885",
    beds: 2, rent: 2500,
    thirdSpaceClub: "Canary Wharf",
    thirdSpaceQuality: 10,
    thirdSpaceWalkMins: 18, // ~0.9 mi
    tubeStation: "Canary Wharf", tubeLine: "Jubilee / Elizabeth", tubeWalkMins: 12,
    overground: "Blackwall", ogType: "DLR", ogWalkMins: 4,
  },
  {
    name: "Royal Captain Court",
    area: "Blackwall Reach, E14",
    link: "https://www.rightmove.co.uk/properties/87648369",
    beds: 1, rent: 2200,
    thirdSpaceClub: "Canary Wharf",
    thirdSpaceQuality: 10,
    thirdSpaceWalkMins: 20, // ~1.0 mi
    tubeStation: "Canary Wharf", tubeLine: "Jubilee / Elizabeth", tubeWalkMins: 18,
    overground: "Blackwall", ogType: "DLR", ogWalkMins: 6,
  },
  {
    name: "Roosevelt Tower",
    area: "Canary Wharf, E14",
    link: "https://www.rightmove.co.uk/properties/172363469",
    beds: 1, rent: 2400,
    thirdSpaceClub: "Canary Wharf",
    thirdSpaceQuality: 10,
    thirdSpaceWalkMins: 12, // ~0.6 mi
    tubeStation: "Canary Wharf", tubeLine: "Jubilee / Elizabeth", tubeWalkMins: 7,
    overground: null, ogType: null, ogWalkMins: null,
  },
  {
    name: "Maine Tower",
    area: "Harbour Central, E14",
    link: "https://www.rightmove.co.uk/properties/172336949",
    beds: 1, rent: 2350,
    thirdSpaceClub: "Canary Wharf",
    thirdSpaceQuality: 10,
    thirdSpaceWalkMins: 14, // ~0.7 mi
    tubeStation: "Canary Wharf", tubeLine: "Jubilee / Elizabeth", tubeWalkMins: 10,
    overground: "South Quay", ogType: "DLR", ogWalkMins: 3,
  },
  {
    name: "Spa Road",
    area: "Bermondsey, SE1",
    link: "https://www.rightmove.co.uk/properties/172442372",
    beds: 1, rent: 2200,
    thirdSpaceClub: "Tower Bridge",
    thirdSpaceQuality: 8,   // solid club, 28k sqft, good wet spa
    thirdSpaceWalkMins: 16, // ~0.8 mi
    tubeStation: "Borough", tubeLine: "Northern", tubeWalkMins: 12,
    overground: "London Bridge", ogType: "OG", ogWalkMins: 10,
  },
  {
    name: "Battersea",
    area: "Battersea, SW11",
    link: "https://www.rightmove.co.uk/properties/93306029",
    beds: 1, rent: 2100,
    thirdSpaceClub: "Battersea PS",
    thirdSpaceQuality: 9,   // 28k sqft, pool, great fit-out in Power Station
    thirdSpaceWalkMins: 10, // ~0.5 mi
    tubeStation: "Battersea Power Station", tubeLine: "Northern", tubeWalkMins: 8,
    overground: "Battersea Park", ogType: "OG", ogWalkMins: 10,
  },
];

// ── Scoring functions (each returns 0–100) ────────────────────────────────────

function scoreThirdSpace(quality, walkMins) {
  // Quality 1–10 → 0–100, then penalise for walk time
  const qualScore = (quality / 10) * 100;
  // Walk penalty: 0 mins = no penalty, 20+ mins = -40 points
  const walkPenalty = Math.min(walkMins / 20, 1) * 40;
  return Math.max(0, qualScore - walkPenalty);
}

function scoreTransport(tubeWalk, ogWalk) {
  // Tube: 0–5 min = 100, 20+ min = 0
  const tubeScore = Math.max(0, 100 - (tubeWalk / 20) * 100);
  // OG/DLR bonus: having one adds up to 20 pts (closer = more)
  const ogBonus = ogWalk != null ? Math.max(0, 20 - ogWalk) : 0;
  return Math.min(100, tubeScore + ogBonus);
}

function scoreBedrooms(beds) {
  return beds === 2 ? 100 : 40;
}

function scoreRent(rent, minRent, maxRent) {
  // Linear: lowest rent = 100, highest rent = 0
  return ((maxRent - rent) / (maxRent - minRent)) * 100;
}

function computeScores(props, weights) {
  const minRent = Math.min(...props.map(p => p.rent));
  const maxRent = Math.max(...props.map(p => p.rent));

  return props.map(p => {
    const ts  = scoreThirdSpace(p.thirdSpaceQuality, p.thirdSpaceWalkMins);
    const tr  = scoreTransport(p.tubeWalkMins, p.ogWalkMins);
    const bed = scoreBedrooms(p.beds);
    const ren = scoreRent(p.rent, minRent, maxRent);
    const total = (
      (ts  * weights.thirdSpace +
       tr  * weights.transport  +
       bed * weights.bedrooms   +
       ren * weights.rent) / 100
    );
    return { ...p, scores: { ts, tr, bed, ren }, total: Math.round(total * 10) / 10 };
  }).sort((a, b) => b.total - a.total);
}

// ── UI helpers ────────────────────────────────────────────────────────────────
const bar = (val, colour) => (
  <div className="flex items-center gap-2">
    <div className="flex-1 bg-gray-100 rounded-full h-1.5">
      <div className={`h-1.5 rounded-full ${colour}`} style={{ width: `${val}%` }} />
    </div>
    <span className="text-xs text-gray-500 w-8 text-right">{Math.round(val)}</span>
  </div>
);

const medal = (rank) => {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return null;
};

const ogColours = { "DLR": "bg-teal-600 text-white", "OG": "bg-orange-500 text-white" };
const lineColours = { "Northern": "bg-gray-700 text-white", "Jubilee / Elizabeth": "bg-purple-600 text-white" };

// ── Main component ────────────────────────────────────────────────────────────
export default function PropertyRanker() {
  const [weights, setWeights] = useState(DEFAULT_WEIGHTS);
  const [showWeights, setShowWeights] = useState(false);

  const scored = computeScores(properties, weights);
  const total = Object.values(weights).reduce((a, b) => a + b, 0);

  const setWeight = (key, val) => {
    setWeights(w => ({ ...w, [key]: Number(val) }));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Property Ranker</h1>
            <p className="text-sm text-gray-500 mt-1">Weighted scoring across Third Space, transport, bedrooms & rent</p>
          </div>
          <button
            onClick={() => setShowWeights(w => !w)}
            className="px-3 py-1.5 text-sm font-medium bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 shadow-sm">
            {showWeights ? "Hide weights" : "⚙ Adjust weights"}
          </button>
        </div>

        {/* Weight sliders */}
        {showWeights && (
          <div className="bg-white border border-gray-200 rounded-xl p-5 mb-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-800">Scoring Weights</h2>
              <span className={`text-sm font-medium ${total === 100 ? "text-green-600" : "text-red-500"}`}>
                Total: {total}/100 {total !== 100 && "⚠ must sum to 100"}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              {[
                { key: "thirdSpace", label: "Third Space quality & proximity", colour: "text-blue-600" },
                { key: "transport",  label: "Tube / transport links",           colour: "text-purple-600" },
                { key: "bedrooms",   label: "Number of bedrooms",               colour: "text-green-600" },
                { key: "rent",       label: "Rent (lower = better)",            colour: "text-orange-600" },
              ].map(({ key, label, colour }) => (
                <div key={key}>
                  <div className="flex justify-between mb-1">
                    <span className={`text-sm font-medium ${colour}`}>{label}</span>
                    <span className="text-sm font-bold text-gray-700">{weights[key]}</span>
                  </div>
                  <input type="range" min="0" max="100" value={weights[key]}
                    onChange={e => setWeight(key, e.target.value)}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gray-200" />
                </div>
              ))}
            </div>
            <button onClick={() => setWeights(DEFAULT_WEIGHTS)}
              className="mt-4 text-xs text-gray-500 hover:text-gray-700 underline">
              Reset to defaults
            </button>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">#</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Property</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Beds</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Rent</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-32">Third Space <span className="text-blue-400">(×{weights.thirdSpace}%)</span></th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-32">Transport <span className="text-purple-400">(×{weights.transport}%)</span></th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-32">Bedrooms <span className="text-green-400">(×{weights.bedrooms}%)</span></th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-32">Rent score <span className="text-orange-400">(×{weights.rent}%)</span></th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {scored.map((p, i) => (
                  <tr key={p.name} className={`hover:bg-gray-50 transition-colors ${i === 0 ? "bg-amber-50" : ""}`}>
                    <td className="px-3 py-3 text-center">
                      <span className="text-lg">{medal(i + 1) || <span className="text-gray-400 text-sm font-medium">{i + 1}</span>}</span>
                    </td>
                    <td className="px-3 py-3">
                      <a href={p.link} target="_blank" rel="noopener noreferrer"
                        className="font-semibold text-blue-600 hover:underline block whitespace-nowrap">{p.name}</a>
                      <span className="text-xs text-gray-400">{p.area}</span>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${p.beds === 2 ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}`}>
                        {p.beds}
                      </span>
                    </td>
                    <td className="px-3 py-3 font-medium text-gray-900 whitespace-nowrap">£{p.rent.toLocaleString()}</td>
                    <td className="px-3 py-3 min-w-32">
                      <div className="text-xs text-gray-500 mb-1">{p.thirdSpaceClub} · {p.thirdSpaceWalkMins} min walk</div>
                      {bar(p.scores.ts, "bg-blue-400")}
                    </td>
                    <td className="px-3 py-3 min-w-32">
                      <div className="text-xs text-gray-500 mb-1 flex gap-1 flex-wrap">
                        <span className={`inline-block px-1 py-0.5 rounded text-xs font-medium ${lineColours[p.tubeLine]}`}>{p.tubeStation}</span>
                        {p.overground && <span className={`inline-block px-1 py-0.5 rounded text-xs font-medium ${ogColours[p.ogType]}`}>{p.ogType}</span>}
                      </div>
                      {bar(p.scores.tr, "bg-purple-400")}
                    </td>
                    <td className="px-3 py-3 min-w-24">
                      {bar(p.scores.bed, "bg-green-400")}
                    </td>
                    <td className="px-3 py-3 min-w-24">
                      {bar(p.scores.ren, "bg-orange-400")}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm"
                          style={{
                            background: `conic-gradient(#3b82f6 ${p.total}%, #e5e7eb ${p.total}%)`,
                          }}>
                          <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center text-xs font-bold text-gray-800">
                            {Math.round(p.total)}
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <p className="mt-3 text-xs text-gray-400">Third Space quality ratings: Canary Wharf 10/10 (Europe's largest), Battersea 9/10, Tower Bridge 8/10, Wimbledon 7/10. Scores update live when you adjust weights.</p>
      </div>
    </div>
  );
}
