"use client";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Activity, AlertTriangle, Calendar, FileText, Image as ImageIcon, MapPin, Search, Video } from "lucide-react";

type Report = {
  id: number;
  loc_id: number;
  issues: string[] | null;
  description: string | null;
  image_url: string | null;
  video_url: string | null;
  created_at: string;
};

type LocationRow = { id: number; road_name: string; area: string };

export default function GovernmentDashboardPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [locations, setLocations] = useState<LocationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      const [{ data: rep, error: repErr }, { data: locs, error: locErr }] = await Promise.all([
        supabase.from("road_reports").select("id, loc_id, issues, description, image_url, video_url, created_at").order("created_at", { ascending: false }),
        supabase.from("locations").select("id, road_name, area"),
      ]);
      if (!mounted) return;
      if (repErr) {
        console.error(repErr);
      }
      if (locErr) {
        console.error(locErr);
      }
      setReports((rep || []) as Report[]);
      setLocations((locs || []) as LocationRow[]);
      setLoading(false);
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const byId = useMemo(() => {
    const m = new Map<number, LocationRow>();
    locations.forEach((l) => m.set(l.id, l));
    return m;
  }, [locations]);

  const filtered = useMemo(() => {
    const nf = from ? new Date(from) : null;
    const nt = to ? new Date(to) : null;
    const query = q.trim().toLowerCase();
    return reports.filter((r) => {
      const d = new Date(r.created_at);
      if (nf && d < nf) return false;
      if (nt && d > nt) return false;
      if (!query) return true;
      const loc = byId.get(r.loc_id);
      const hay = [
        r.description || "",
        (r.issues || []).join(" "),
        loc?.road_name || "",
        loc?.area || "",
      ].join(" ").toLowerCase();
      return hay.includes(query);
    });
  }, [reports, byId, from, to, q]);

  const stats = useMemo(() => {
    const total = filtered.length;
    const withMedia = filtered.filter((r) => r.image_url || r.video_url).length;
    const uniqueLocs = new Set(filtered.map((r) => r.loc_id)).size;
    return { total, withMedia, withoutMedia: total - withMedia, uniqueLocs };
  }, [filtered]);

  const byLocation = useMemo(() => {
    const m = new Map<number, number>();
    filtered.forEach((r) => m.set(r.loc_id, (m.get(r.loc_id) || 0) + 1));
    const arr = Array.from(m.entries())
      .map(([locId, count]) => ({ locId, count, loc: byId.get(locId) }))
      .sort((a, b) => b.count - a.count);
    return arr;
  }, [filtered, byId]);

  const topLocations = byLocation.slice(0, 5);
  const maxCount = topLocations[0]?.count || 1;

  return (
    <div className="min-h-screen bg-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-xl shadow p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-bold text-blue-700">Government Authority Dashboard</h1>
              <p className="text-gray-600">Review, prioritize, and act on reported road issues.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-gray-50 border rounded-lg px-3 py-2">
                <Search className="w-4 h-4 text-gray-500" />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search description, road, area, issue" className="bg-transparent outline-none text-sm text-gray-800" />
              </div>
              <div className="flex items-center gap-2 bg-gray-50 border rounded-lg px-3 py-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="bg-transparent outline-none text-sm text-gray-800" />
              </div>
              <div className="flex items-center gap-2 bg-gray-50 border rounded-lg px-3 py-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="bg-transparent outline-none text-sm text-gray-800" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
              <FileText className="w-5 h-5 text-blue-700" />
              <div>
                <div className="text-sm text-gray-600">Total Reports</div>
                <div className="text-xl font-semibold text-gray-900">{stats.total}</div>
              </div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
              <ImageIcon className="w-5 h-5 text-green-700" />
              <div>
                <div className="text-sm text-gray-600">With Media</div>
                <div className="text-xl font-semibold text-gray-900">{stats.withMedia}</div>
              </div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
              <Video className="w-5 h-5 text-amber-700" />
              <div>
                <div className="text-sm text-gray-600">Without Media</div>
                <div className="text-xl font-semibold text-gray-900">{stats.withoutMedia}</div>
              </div>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 flex items-center gap-3">
              <MapPin className="w-5 h-5 text-purple-700" />
              <div>
                <div className="text-sm text-gray-600">Locations</div>
                <div className="text-xl font-semibold text-gray-900">{stats.uniqueLocs}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Reports</h2>
              {byLocation[0] && (
                <div className="flex items-center gap-2 text-red-700">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm">Red alert: Highest from {byLocation[0].loc?.area || byLocation[0].loc?.road_name} ({byLocation[0].count})</span>
                </div>
              )}
            </div>

            <div className="divide-y">
              {loading ? (
                <div className="py-8 text-center text-gray-600">Loading...</div>
              ) : filtered.length === 0 ? (
                <div className="py-8 text-center text-gray-600">No reports found</div>
              ) : (
                filtered.slice(0, 10).map((r) => {
                  const loc = byId.get(r.loc_id);
                  return (
                    <div key={r.id} className="py-4 flex items-start gap-4">
                      <div className="w-28 h-20 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
                        {r.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={r.image_url} alt="evidence" className="w-full h-full object-cover" />
                        ) : r.video_url ? (
                          <video src={r.video_url} controls className="w-full h-full object-cover" />
                        ) : (
                          <Activity className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="font-medium text-gray-900">{loc?.road_name} • {loc?.area}</div>
                          <div className="text-xs text-gray-500">{new Date(r.created_at).toLocaleString()}</div>
                        </div>
                        <div className="text-sm text-gray-700 mt-1 line-clamp-2">{r.description || "No description"}</div>
                        {!!(r.issues && r.issues.length) && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {r.issues.map((iss, i) => (
                              <span key={i} className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">{iss}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Locations</h2>
            <div className="space-y-3">
              {topLocations.length === 0 && <div className="text-gray-600">No data</div>}
              {topLocations.map((t) => (
                <div key={t.locId} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-800">{t.loc?.area || t.loc?.road_name}</span>
                      <span className="text-gray-900 font-medium">{t.count}</span>
                    </div>
                    <div className="h-2 bg-red-100 rounded mt-1">
                      <div className="h-2 bg-red-500 rounded" style={{ width: `${Math.max(8, (t.count / maxCount) * 100)}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
