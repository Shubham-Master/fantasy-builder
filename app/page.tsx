"use client";

import { useState, useEffect, useMemo } from "react";

// ============ TYPES ============
type Role = "WK" | "BAT" | "AR" | "BWL";

type Player = {
  name: string;
  team: string;
  role: Role;
};

type SavedTeam = {
  id: string;
  players: string[];
  captain: string | null;
  viceCaptain: string | null;
  createdAt: number;
};

type Tab = "builder" | "saved" | "analytics" | "players";

const ROLES: Role[] = ["WK", "BAT", "AR", "BWL"];
const ROLE_LABELS: Record<Role, string> = {
  WK: "WICKET-KEEPERS",
  BAT: "BATTERS",
  AR: "ALL-ROUNDERS",
  BWL: "BOWLERS",
};
const ROLE_BG: Record<Role, string> = {
  WK: "bg-yellow-500 text-black",
  BAT: "bg-sky-500 text-black",
  AR: "bg-orange-500 text-black",
  BWL: "bg-rose-500 text-white",
};

const TEAM_COLORS = [
  { bg: "bg-rose-600", text: "text-rose-300" },
  { bg: "bg-emerald-600", text: "text-emerald-300" },
  { bg: "bg-blue-600", text: "text-blue-300" },
  { bg: "bg-purple-600", text: "text-purple-300" },
];

export default function FantasyTeamBuilderApp() {
  const [matchText, setMatchText] = useState("");
  const [players, setPlayers] = useState<Player[]>([]);
  const [teamNames, setTeamNames] = useState<string[]>([]);
  const [parseInfo, setParseInfo] = useState<{ msg: string; ok: boolean }>({
    msg: "",
    ok: true,
  });

  const [selection, setSelection] = useState<string[]>([]);
  const [captain, setCaptain] = useState<string | null>(null);
  const [viceCaptain, setViceCaptain] = useState<string | null>(null);

  const [savedTeams, setSavedTeams] = useState<SavedTeam[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("builder");
  const [previewId, setPreviewId] = useState<string | null>(null);

  // ===== STORAGE =====
  useEffect(() => {
    try {
      const s = localStorage.getItem("ftb_saved_v1");
      if (s) setSavedTeams(JSON.parse(s));
      const p = localStorage.getItem("ftb_players_v1");
      if (p) {
        const parsed = JSON.parse(p);
        const migrated: Player[] = parsed.map((pl: any) => ({
          name: pl.name,
          team: pl.team,
          role: (pl.role as Role) || (pl.isWk ? "WK" : "BAT"),
        }));
        setPlayers(migrated);
      }
      const t = localStorage.getItem("ftb_teams_v1");
      if (t) setTeamNames(JSON.parse(t));
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem("ftb_saved_v1", JSON.stringify(savedTeams));
  }, [savedTeams]);
  useEffect(() => {
    localStorage.setItem("ftb_players_v1", JSON.stringify(players));
  }, [players]);
  useEffect(() => {
    localStorage.setItem("ftb_teams_v1", JSON.stringify(teamNames));
  }, [teamNames]);

  // ===== PARSER =====
  const parsePlayerList = (raw: string, team: string, limit: number): Player[] =>
    raw
      .split(",")
      .map((p) => {
        const isWk = /\(w\)/i.test(p);
        const clean = p.replace(/\([^)]*\)/g, "").trim();
        return clean
          ? { name: clean, team, role: (isWk ? "WK" : "BAT") as Role }
          : null;
      })
      .filter((p): p is Player => p !== null)
      .slice(0, limit);

  const extractPlayingXI = () => {
    if (!matchText.trim()) {
      setParseInfo({ msg: "Paste match context first.", ok: false });
      return;
    }
    const squadRegex = /([A-Z][A-Za-z' ]+?) Squad:\s*([^\n]+)/g;
    const teamData: { name: string; squadList: string }[] = [];
    let m: RegExpExecArray | null;
    while ((m = squadRegex.exec(matchText)) !== null) {
      teamData.push({ name: m[1].trim(), squadList: m[2].trim() });
    }
    if (teamData.length < 2) {
      setParseInfo({
        msg: "Couldn't find 2 teams. Text must have '<TeamName> Squad:' lines.",
        ok: false,
      });
      return;
    }
    const probableRegex = /Probable\s+X(?:II|I):\s*([^\n]+)/gi;
    const probables: string[] = [];
    while ((m = probableRegex.exec(matchText)) !== null) {
      probables.push(m[1].trim());
    }
    const useProbable = probables.length >= teamData.length;
    const extracted: Player[] = [];
    teamData.forEach((td, idx) => {
      const list = useProbable ? probables[idx] : td.squadList;
      const limit = useProbable ? 12 : 11;
      extracted.push(...parsePlayerList(list, td.name, limit));
    });
    if (extracted.length === 0) {
      setParseInfo({ msg: "No players parsed.", ok: false });
      return;
    }
    setPlayers(extracted);
    setTeamNames(teamData.map((t) => t.name));
    setSelection([]);
    setCaptain(null);
    setViceCaptain(null);
    setParseInfo({
      msg: `Extracted ${extracted.length} players from ${teamData.length} teams ${
        useProbable ? "(Probable XII)" : "(Squad first 11)"
      }. Tap role badges to set WK/BAT/AR/BWL.`,
      ok: true,
    });
  };

  // ===== ROLE CYCLE =====
  const cycleRole = (name: string) => {
    setPlayers((prev) =>
      prev.map((p) =>
        p.name === name
          ? { ...p, role: ROLES[(ROLES.indexOf(p.role) + 1) % ROLES.length] }
          : p
      )
    );
  };

  // ===== TEAM BUILDING =====
  const togglePlayer = (name: string) => {
    setSelection((prev) => {
      if (prev.includes(name)) {
        if (captain === name) setCaptain(null);
        if (viceCaptain === name) setViceCaptain(null);
        return prev.filter((n) => n !== name);
      }
      if (prev.length >= 11) return prev;
      return [...prev, name];
    });
  };

  const makeCaptain = (name: string) => {
    if (!selection.includes(name)) return;
    setCaptain((prev) => (prev === name ? null : name));
    if (viceCaptain === name) setViceCaptain(null);
  };

  const makeVC = (name: string) => {
    if (!selection.includes(name)) return;
    setViceCaptain((prev) => (prev === name ? null : name));
    if (captain === name) setCaptain(null);
  };

  const saveTeam = () => {
    if (selection.length !== 11)
      return alert(`Need exactly 11 players. Currently: ${selection.length}`);
    if (!captain) return alert("Select a Captain (C).");
    if (!viceCaptain) return alert("Select a Vice-Captain (VC).");
    setSavedTeams((prev) => [
      ...prev,
      {
        id: `T_${Date.now()}`,
        players: [...selection],
        captain,
        viceCaptain,
        createdAt: Date.now(),
      },
    ]);
    setSelection([]);
    setCaptain(null);
    setViceCaptain(null);
  };

  const clearCurrent = () => {
    setSelection([]);
    setCaptain(null);
    setViceCaptain(null);
  };

  const deleteTeam = (id: string) => {
    if (!confirm("Delete this team?")) return;
    setSavedTeams((prev) => prev.filter((t) => t.id !== id));
    if (previewId === id) setPreviewId(null);
  };

  const duplicateTeam = (t: SavedTeam) => {
    setSelection([...t.players]);
    setCaptain(t.captain);
    setViceCaptain(t.viceCaptain);
    setPreviewId(null);
    setActiveTab("builder");
  };

  // ===== HELPERS =====
  const playerByName = (n: string) => players.find((p) => p.name === n);
  const teamForName = (n: string) => playerByName(n)?.team || "—";
  const roleForName = (n: string): Role => playerByName(n)?.role || "BAT";
  const teamIdx = (t: string) => teamNames.indexOf(t);
  const teamStyle = (t: string) =>
    TEAM_COLORS[teamIdx(t) % TEAM_COLORS.length] || TEAM_COLORS[0];

  const currentTeamCounts = useMemo(() => {
    const c: Record<string, number> = {};
    teamNames.forEach((t) => (c[t] = 0));
    selection.forEach((pn) => {
      const t = teamForName(pn);
      if (t in c) c[t]++;
    });
    return c;
  }, [selection, players, teamNames]);

  const currentRoleCounts = useMemo(() => {
    const c: Record<Role, number> = { WK: 0, BAT: 0, AR: 0, BWL: 0 };
    selection.forEach((pn) => c[roleForName(pn)]++);
    return c;
  }, [selection, players]);

  const captainStats = useMemo(() => {
    const map: Record<string, number> = {};
    savedTeams.forEach((t) => {
      if (t.captain) map[t.captain] = (map[t.captain] || 0) + 1;
    });
    return Object.entries(map)
      .map(([name, count]) => ({ name, count, team: teamForName(name) }))
      .sort((a, b) => b.count - a.count);
  }, [savedTeams, players]);

  const vcStats = useMemo(() => {
    const map: Record<string, number> = {};
    savedTeams.forEach((t) => {
      if (t.viceCaptain) map[t.viceCaptain] = (map[t.viceCaptain] || 0) + 1;
    });
    return Object.entries(map)
      .map(([name, count]) => ({ name, count, team: teamForName(name) }))
      .sort((a, b) => b.count - a.count);
  }, [savedTeams, players]);

  // Only players that have been picked at least once
  const playerExposure = useMemo(() => {
    const counts: Record<string, number> = {};
    savedTeams.forEach((t) => {
      t.players.forEach((pn) => {
        counts[pn] = (counts[pn] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .filter(([, count]) => count > 0)
      .map(([name, count]) => ({ name, count, team: teamForName(name) }))
      .sort((a, b) => b.count - a.count);
  }, [savedTeams, players]);

  const teamBreakdown = (t: SavedTeam) => {
    const c: Record<string, number> = {};
    teamNames.forEach((tn) => (c[tn] = 0));
    t.players.forEach((pn) => {
      const tm = teamForName(pn);
      if (tm in c) c[tm]++;
    });
    return c;
  };

  const groupByRole = (names: string[]): Record<Role, string[]> => {
    const g: Record<Role, string[]> = { WK: [], BAT: [], AR: [], BWL: [] };
    names.forEach((n) => g[roleForName(n)].push(n));
    return g;
  };

  const previewedTeam = savedTeams.find((t) => t.id === previewId);

  // ===== FIELD PREVIEW =====
  const FieldPreview = ({ team }: { team: SavedTeam }) => {
    const grouped = groupByRole(team.players);
    return (
      <div className="relative bg-gradient-to-b from-green-700 via-green-800 to-green-900 rounded-2xl p-4 border-2 border-green-950 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-20 h-64 border-2 border-green-600/40 rounded-md" />
        </div>
        <div className="relative space-y-4">
          {(["WK", "BAT", "AR", "BWL"] as Role[]).map((r) => {
            const list = grouped[r];
            if (list.length === 0) return null;
            return (
              <div key={r}>
                <div className="text-center text-[10px] font-bold text-green-100/80 tracking-widest mb-2">
                  {ROLE_LABELS[r]}
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  {list.map((pn) => {
                    const p = playerByName(pn);
                    const isCap = team.captain === pn;
                    const isVc = team.viceCaptain === pn;
                    const s = p ? teamStyle(p.team) : null;
                    return (
                      <div key={pn} className="flex flex-col items-center gap-0.5">
                        <div
                          className={`w-10 h-10 rounded-full ${
                            s?.bg || "bg-zinc-700"
                          } border-2 border-white/90 flex items-center justify-center text-xs font-bold shadow-lg relative`}
                        >
                          {pn.charAt(0)}
                          {isCap && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-yellow-400 text-black text-[10px] font-bold flex items-center justify-center border border-white">
                              C
                            </span>
                          )}
                          {isVc && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-zinc-200 text-black text-[10px] font-bold flex items-center justify-center border border-white">
                              VC
                            </span>
                          )}
                        </div>
                        <div className="bg-zinc-900/95 text-white text-[10px] font-medium px-1.5 py-0.5 rounded max-w-[80px] truncate text-center">
                          {pn}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ===== RENDER =====
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              Fantasy Team Builder
            </h1>
            <p className="text-zinc-400 text-sm mt-1">
              Paste preview → extract → tag roles → build & track teams.
            </p>
          </div>
          <div className="flex gap-3 text-sm">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2">
              <span className="text-zinc-400">Saved: </span>
              <span className="font-semibold">{savedTeams.length}</span>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2">
              <span className="text-zinc-400">Pool: </span>
              <span className="font-semibold">{players.length}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 border-b border-zinc-800 overflow-x-auto">
          {(
            [
              ["builder", "Builder"],
              ["saved", `Saved Teams (${savedTeams.length})`],
              ["analytics", "Analytics"],
              ["players", "Players Info"],
            ] as [Tab, string][]
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === key
                  ? "border-green-500 text-white"
                  : "border-transparent text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {activeTab === "builder" && (
          <div className="space-y-6">
            <div className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800">
              <h2 className="text-xl font-semibold mb-3">1. Paste Match Context</h2>
              <textarea
                value={matchText}
                onChange={(e) => setMatchText(e.target.value)}
                placeholder="Paste full Cricbuzz preview text (must include 'Squad:' lines)..."
                className="w-full h-48 bg-zinc-950 border border-zinc-700 rounded-xl p-3 text-sm font-mono outline-none focus:border-green-500"
              />
              <div className="flex flex-wrap gap-3 mt-3 items-center">
                <button
                  onClick={extractPlayingXI}
                  className="px-4 py-2 rounded-xl bg-green-600 hover:bg-green-500 font-semibold text-sm"
                >
                  Extract Playing XI
                </button>
                <button
                  onClick={() => setMatchText("")}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-sm"
                >
                  Clear Input
                </button>
                {parseInfo.msg && (
                  <span
                    className={`text-sm ${
                      parseInfo.ok ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {parseInfo.msg}
                  </span>
                )}
              </div>
            </div>

            {players.length > 0 && (
              <>
                {/* SPLIT POOL */}
                <div className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800">
                  <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                    <h2 className="text-xl font-semibold">2. Player Pool</h2>
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      <div className="text-zinc-400">
                        Selected:{" "}
                        <span className="font-semibold text-white">
                          {selection.length}
                        </span>{" "}
                        / 11
                      </div>
                      <div className="flex gap-1.5 text-xs">
                        {(["WK", "BAT", "AR", "BWL"] as Role[]).map((r) => (
                          <div
                            key={r}
                            className={`px-2 py-1 rounded font-bold ${ROLE_BG[r]}`}
                          >
                            {r}: {currentRoleCounts[r]}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {teamNames.map((tn) => {
                      const tp = players.filter((p) => p.team === tn);
                      const s = teamStyle(tn);
                      const teamSelected = selection.filter(
                        (n) => teamForName(n) === tn
                      ).length;
                      return (
                        <div
                          key={tn}
                          className="bg-zinc-950 border border-zinc-800 rounded-xl p-3"
                        >
                          <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-800">
                            <div
                              className={`px-2 py-1 rounded-md ${s.bg} text-white text-xs font-semibold`}
                            >
                              {tn}
                            </div>
                            <div className="text-xs text-zinc-400">
                              <span className="font-semibold text-white">
                                {teamSelected}
                              </span>{" "}
                              / {tp.length}
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            {tp.map((p) => {
                              const isSelected = selection.includes(p.name);
                              return (
                                <div
                                  key={p.name}
                                  onClick={() => togglePlayer(p.name)}
                                  className={`p-2 rounded-lg cursor-pointer text-sm border transition-all flex items-center justify-between gap-2 ${
                                    isSelected
                                      ? "bg-green-600/15 border-green-500"
                                      : "bg-zinc-900 border-zinc-800 hover:border-zinc-600"
                                  }`}
                                >
                                  <div className="font-medium truncate">
                                    {p.name}
                                  </div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      cycleRole(p.name);
                                    }}
                                    className={`text-[10px] font-bold px-2 py-0.5 rounded shrink-0 ${
                                      ROLE_BG[p.role]
                                    } hover:opacity-80`}
                                    title="Tap to change role"
                                  >
                                    {p.role}
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* CURRENT TEAM */}
                <div className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800">
                  <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                    <h2 className="text-xl font-semibold">3. Current Team</h2>
                    <div className="flex gap-2">
                      <button
                        onClick={clearCurrent}
                        className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs"
                      >
                        Clear
                      </button>
                      <button
                        onClick={saveTeam}
                        className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-xs font-semibold"
                      >
                        Save Team
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-4 text-sm">
                    {teamNames.map((t) => {
                      const s = teamStyle(t);
                      return (
                        <div
                          key={t}
                          className="bg-zinc-950 border border-zinc-800 rounded-lg p-2"
                        >
                          <div className="text-zinc-400 text-xs">{t}</div>
                          <div className={`text-lg font-bold ${s.text}`}>
                            {currentTeamCounts[t] || 0}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="space-y-1.5">
                    {selection.length === 0 && (
                      <div className="text-zinc-500 text-sm text-center py-8">
                        Tap players above to add them.
                      </div>
                    )}
                    {selection.map((name, i) => {
                      const p = playerByName(name);
                      const isCap = captain === name;
                      const isVc = viceCaptain === name;
                      const s = p ? teamStyle(p.team) : null;
                      return (
                        <div
                          key={name}
                          className={`bg-zinc-950 border rounded-lg p-2.5 flex items-center justify-between gap-2 ${
                            isCap
                              ? "border-yellow-500"
                              : isVc
                              ? "border-blue-500"
                              : "border-zinc-800"
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm flex items-center gap-1.5 flex-wrap">
                              <span className="text-zinc-500 text-xs">
                                {i + 1}.
                              </span>
                              <span className="truncate">{name}</span>
                              {p && (
                                <span
                                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                    ROLE_BG[p.role]
                                  }`}
                                >
                                  {p.role}
                                </span>
                              )}
                              {isCap && (
                                <span className="text-[10px] bg-yellow-500 text-black px-1.5 rounded font-bold">
                                  C
                                </span>
                              )}
                              {isVc && (
                                <span className="text-[10px] bg-blue-500 px-1.5 rounded font-bold">
                                  VC
                                </span>
                              )}
                            </div>
                            {p && (
                              <div className={`text-xs ${s!.text} mt-0.5`}>
                                {p.team}
                              </div>
                            )}
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <button
                              onClick={() => makeCaptain(name)}
                              className={`w-7 h-7 rounded-md text-xs font-bold ${
                                isCap
                                  ? "bg-yellow-500 text-black"
                                  : "bg-zinc-800 hover:bg-zinc-700"
                              }`}
                            >
                              C
                            </button>
                            <button
                              onClick={() => makeVC(name)}
                              className={`w-7 h-7 rounded-md text-xs font-bold ${
                                isVc ? "bg-blue-500" : "bg-zinc-800 hover:bg-zinc-700"
                              }`}
                            >
                              VC
                            </button>
                            <button
                              onClick={() => togglePlayer(name)}
                              className="w-7 h-7 rounded-md text-xs bg-zinc-800 hover:bg-red-600"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === "saved" && (
          <div className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800">
            <h2 className="text-xl font-semibold mb-4">Saved Teams</h2>
            {savedTeams.length === 0 ? (
              <div className="text-zinc-500 text-sm text-center py-12">
                No teams yet. Go to Builder.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {savedTeams.map((t, idx) => {
                  const bd = teamBreakdown(t);
                  return (
                    <div
                      key={t.id}
                      className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 hover:border-green-500 cursor-pointer transition-colors"
                      onClick={() => setPreviewId(t.id)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="font-semibold">Team #{idx + 1}</div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteTeam(t.id);
                          }}
                          className="text-xs text-zinc-500 hover:text-red-400"
                        >
                          Delete
                        </button>
                      </div>
                      <div className="space-y-1.5 text-sm">
                        {Object.entries(bd).map(([tn, c]) => {
                          const s = teamStyle(tn);
                          return (
                            <div key={tn} className="flex justify-between">
                              <span className={s.text}>{tn}</span>
                              <span className="font-semibold">{c}</span>
                            </div>
                          );
                        })}
                        <div className="border-t border-zinc-800 pt-2 mt-2 space-y-1">
                          <div className="flex justify-between">
                            <span className="text-zinc-400">Captain</span>
                            <span className="font-medium text-yellow-400 truncate ml-2">
                              {t.captain}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-400">Vice-Captain</span>
                            <span className="font-medium text-blue-400 truncate ml-2">
                              {t.viceCaptain}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {previewedTeam && (
          <div
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setPreviewId(null)}
          >
            <div
              className="bg-zinc-900 border border-zinc-700 rounded-2xl p-4 max-w-md w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">Team Preview</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => duplicateTeam(previewedTeam)}
                    className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs"
                  >
                    Edit Copy
                  </button>
                  <button
                    onClick={() => setPreviewId(null)}
                    className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs"
                  >
                    Close
                  </button>
                </div>
              </div>

              <FieldPreview team={previewedTeam} />

              <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                {Object.entries(teamBreakdown(previewedTeam)).map(([tn, c]) => {
                  const s = teamStyle(tn);
                  return (
                    <div
                      key={tn}
                      className="bg-zinc-950 border border-zinc-800 rounded-lg p-2"
                    >
                      <div className="text-zinc-400 text-xs">{tn}</div>
                      <div className={`text-xl font-bold ${s.text}`}>{c}</div>
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                <div className="bg-zinc-950 border border-yellow-500/40 rounded-lg p-2">
                  <div className="text-zinc-400">Captain</div>
                  <div className="font-semibold text-yellow-400 truncate">
                    {previewedTeam.captain}
                  </div>
                </div>
                <div className="bg-zinc-950 border border-blue-500/40 rounded-lg p-2">
                  <div className="text-zinc-400">Vice-Captain</div>
                  <div className="font-semibold text-blue-400 truncate">
                    {previewedTeam.viceCaptain}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="space-y-6">
            {savedTeams.length === 0 ? (
              <div className="bg-zinc-900 rounded-2xl p-12 border border-zinc-800 text-center text-zinc-500">
                Save at least one team to see analytics.
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800">
                    <h2 className="text-xl font-semibold mb-4">
                      Captain Frequency
                    </h2>
                    {captainStats.length === 0 ? (
                      <div className="text-zinc-500 text-sm">No captains yet.</div>
                    ) : (
                      <div className="space-y-2">
                        {captainStats.map((c) => {
                          const s = teamStyle(c.team);
                          return (
                            <div
                              key={c.name}
                              className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 flex items-center justify-between"
                            >
                              <div>
                                <div className="font-medium text-sm">{c.name}</div>
                                <div className={`text-xs ${s.text}`}>{c.team}</div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-yellow-400">
                                  {c.count}
                                </div>
                                <div className="text-[10px] text-zinc-500">
                                  {((c.count / savedTeams.length) * 100).toFixed(0)}
                                  %
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800">
                    <h2 className="text-xl font-semibold mb-4">
                      Vice-Captain Frequency
                    </h2>
                    {vcStats.length === 0 ? (
                      <div className="text-zinc-500 text-sm">
                        No vice-captains yet.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {vcStats.map((c) => {
                          const s = teamStyle(c.team);
                          return (
                            <div
                              key={c.name}
                              className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 flex items-center justify-between"
                            >
                              <div>
                                <div className="font-medium text-sm">{c.name}</div>
                                <div className={`text-xs ${s.text}`}>{c.team}</div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-blue-400">
                                  {c.count}
                                </div>
                                <div className="text-[10px] text-zinc-500">
                                  {((c.count / savedTeams.length) * 100).toFixed(0)}
                                  %
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800">
                  <h2 className="text-xl font-semibold mb-4">
                    Player Exposure
                    <span className="text-xs text-zinc-500 font-normal ml-2">
                      (only players picked in at least 1 team)
                    </span>
                  </h2>
                  {playerExposure.length === 0 ? (
                    <div className="text-zinc-500 text-sm">No picks yet.</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-zinc-800 text-zinc-400 text-left">
                            <th className="py-2 pr-3">#</th>
                            <th className="py-2 pr-3">Player</th>
                            <th className="py-2 pr-3">Team</th>
                            <th className="py-2 pr-3">Picks</th>
                            <th className="py-2">%</th>
                          </tr>
                        </thead>
                        <tbody>
                          {playerExposure.map((p, i) => {
                            const s = teamStyle(p.team);
                            return (
                              <tr key={p.name} className="border-b border-zinc-900">
                                <td className="py-2 pr-3 text-zinc-500">
                                  {i + 1}
                                </td>
                                <td className="py-2 pr-3 font-medium">{p.name}</td>
                                <td className={`py-2 pr-3 ${s.text}`}>{p.team}</td>
                                <td className="py-2 pr-3 font-semibold">
                                  {p.count}
                                </td>
                                <td className="py-2 text-zinc-400">
                                  {((p.count / savedTeams.length) * 100).toFixed(0)}
                                  %
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === "players" && (
          <div className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800">
            <h2 className="text-xl font-semibold mb-4">Players Info</h2>
            {players.length === 0 ? (
              <div className="text-zinc-500 text-sm text-center py-8">
                No players. Extract from a match first.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {teamNames.map((tn) => {
                  const tp = players.filter((p) => p.team === tn);
                  const s = teamStyle(tn);
                  return (
                    <div key={tn}>
                      <div
                        className={`text-sm font-semibold mb-2 ${s.text} flex items-center justify-between`}
                      >
                        <span>{tn}</span>
                        <span className="text-zinc-500 text-xs">
                          {tp.length} players
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        {tp.map((p, i) => (
                          <div
                            key={p.name}
                            className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm flex items-center justify-between"
                          >
                            <div>
                              <span className="text-zinc-500 mr-2">{i + 1}.</span>
                              {p.name}
                            </div>
                            <button
                              onClick={() => cycleRole(p.name)}
                              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                ROLE_BG[p.role]
                              } hover:opacity-80`}
                            >
                              {p.role}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
