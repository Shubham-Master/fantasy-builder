"use client";

import { useState, useEffect, useMemo } from "react";

// ============ TYPES ============
type Role = "WK" | "BAT" | "AR" | "BWL";

type Player = {
  name: string;
  team: string;
  role: Role;
  probable: boolean;
};

type SavedTeam = {
  id: string;
  players: string[];
  captain: string | null;
  viceCaptain: string | null;
  createdAt: number;
};

type Tab = "builder" | "saved" | "analytics" | "players" | "table";

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

// ============ SEED PLAYER ROLES (IPL) ============
const SEED_ROLES: Record<string, Role> = {
  "MS Dhoni": "WK",
  "Rishabh Pant": "WK",
  "Sanju Samson": "WK",
  "KL Rahul": "WK",
  "Quinton de Kock": "WK",
  "Jos Buttler": "WK",
  "Jitesh Sharma": "WK",
  "Phil Salt": "WK",
  "Philip Salt": "WK",
  "Ishan Kishan": "WK",
  "Prabhsimran Singh": "WK",
  "Heinrich Klaasen": "WK",
  "Jonny Bairstow": "WK",
  "Dhruv Jurel": "WK",
  "Wriddhiman Saha": "WK",
  "Jordan Cox": "WK",
  "N Jagadeesan": "WK",
  "Vishnu Vinod": "WK",
  "Ryan Rickelton": "WK",
  "Angkrish Raghuvanshi": "BAT",
  "Virat Kohli": "BAT",
  "Rohit Sharma": "BAT",
  "Shubman Gill": "BAT",
  "Yashasvi Jaiswal": "BAT",
  "Suryakumar Yadav": "BAT",
  "Devdutt Padikkal": "BAT",
  "Shreyas Iyer": "BAT",
  "Rajat Patidar": "BAT",
  "Tilak Varma": "BAT",
  "Sai Sudharsan": "BAT",
  "B Sai Sudharsan": "BAT",
  "Faf du Plessis": "BAT",
  "David Warner": "BAT",
  "Priyansh Arya": "BAT",
  "Jacob Bethell": "BAT",
  "Travis Head": "BAT",
  "Abhishek Sharma": "BAT",
  "Will Jacks": "BAT",
  "Tim David": "BAT",
  "Ruturaj Gaikwad": "BAT",
  "Riyan Parag": "BAT",
  "Karun Nair": "BAT",
  "Aiden Markram": "BAT",
  "Rinku Singh": "BAT",
  "Mayank Agarwal": "BAT",
  "Nehal Wadhera": "BAT",
  "Harnoor Singh": "BAT",
  "Vihaan Malhotra": "BAT",
  "Anuj Rawat": "BAT",
  "Abhishek Porel": "BAT",
  "Ajinkya Rahane": "BAT",
  "Finn Allen": "BAT",
  "Manish Pandey": "BAT",
  "Naman Dhir": "BAT",
  "Hardik Pandya": "AR",
  "Krunal Pandya": "AR",
  "Ravindra Jadeja": "AR",
  "Axar Patel": "AR",
  "Glenn Maxwell": "AR",
  "Cameron Green": "AR",
  "Andre Russell": "AR",
  "Sunil Narine": "AR",
  "Marcus Stoinis": "AR",
  "Shivam Dube": "AR",
  "Nitish Reddy": "AR",
  "Rachin Ravindra": "AR",
  "Mitchell Marsh": "AR",
  "Marco Jansen": "AR",
  "Azmatullah Omarzai": "AR",
  "Shashank Singh": "AR",
  "Venkatesh Iyer": "AR",
  "Cooper Connolly": "AR",
  "Harpreet Brar": "AR",
  "Mitchell Owen": "AR",
  "Romario Shepherd": "AR",
  "Suryansh Shedge": "AR",
  "Washington Sundar": "AR",
  "Sai Kishore": "AR",
  "R Sai Kishore": "AR",
  "Liam Livingstone": "AR",
  "Moeen Ali": "AR",
  "Wanindu Hasaranga": "AR",
  "Dunith Wellalage": "AR",
  "Ramandeep Singh": "AR",
  "Anukul Roy": "AR",
  "Corbin Bosch": "AR",
  "Jasprit Bumrah": "BWL",
  "Mohammed Shami": "BWL",
  "Mohammed Siraj": "BWL",
  "Arshdeep Singh": "BWL",
  "Yuzvendra Chahal": "BWL",
  "Kuldeep Yadav": "BWL",
  "Rashid Khan": "BWL",
  "Rashid-Khan": "BWL",
  "Lockie Ferguson": "BWL",
  "Bhuvneshwar Kumar": "BWL",
  "Josh Hazlewood": "BWL",
  "Pat Cummins": "BWL",
  "Trent Boult": "BWL",
  "T Natarajan": "BWL",
  "Mitchell Starc": "BWL",
  "Mukesh Kumar": "BWL",
  "Khaleel Ahmed": "BWL",
  "Tushar Deshpande": "BWL",
  "Avesh Khan": "BWL",
  "Umran Malik": "BWL",
  "Harshit Rana": "BWL",
  "Akash Madhwal": "BWL",
  "Varun Chakaravarthy": "BWL",
  "Sandeep Sharma": "BWL",
  "Mohit Sharma": "BWL",
  "Anrich Nortje": "BWL",
  "Kagiso Rabada": "BWL",
  "Jofra Archer": "BWL",
  "Matheesha Pathirana": "BWL",
  "Jacob Duffy": "BWL",
  "Rasikh Salam Dar": "BWL",
  "Maheesh Theekshana": "BWL",
  "Noor Ahmad": "BWL",
  "Suyash Sharma": "BWL",
  "Ravi Bishnoi": "BWL",
  "Ben Dwarshuis": "BWL",
  "Xavier Bartlett": "BWL",
  "Vijaykumar Vyshak": "BWL",
  "Yash Thakur": "BWL",
  "Praveen Dubey": "BWL",
  "Mangesh Yadav": "BWL",
  "Richard Gleeson": "BWL",
  "Abhinandan Singh": "BWL",
  "Vicky Ostwal": "BWL",
  "Blessing Muzarabani": "BWL",
  "Vaibhav Arora": "BWL",
  "Pyla Avinash": "BWL",
  "Vishal Nishad": "BWL",
  "Musheer Khan": "BAT",
  "Swapnil Singh": "AR",
  "Kanishk Chouhan": "BWL",
  "Satvik Deswal": "BWL",
};

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

  // NEW: swap mode state
  const [swapTargetName, setSwapTargetName] = useState<string | null>(null);

  const [savedTeams, setSavedTeams] = useState<SavedTeam[]>([]);
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<Tab>("builder");
  const [previewId, setPreviewId] = useState<string | null>(null);

  const [tableFilterCap, setTableFilterCap] = useState<string>("");
  const [tableFilterVC, setTableFilterVC] = useState<string>("");
  const [tableFilterPlayer, setTableFilterPlayer] = useState<string>("");

  const [roleMemory, setRoleMemory] = useState<Record<string, Role>>({});

  // ===== STORAGE =====
  useEffect(() => {
    try {
      const s = localStorage.getItem("ftb_saved_v1");
      if (s) setSavedTeams(JSON.parse(s));
      const p = localStorage.getItem("ftb_players_v2");
      if (p) setPlayers(JSON.parse(p));
      const t = localStorage.getItem("ftb_teams_v1");
      if (t) setTeamNames(JSON.parse(t));
      const r = localStorage.getItem("ftb_role_memory_v1");
      if (r) setRoleMemory(JSON.parse(r));
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem("ftb_saved_v1", JSON.stringify(savedTeams));
  }, [savedTeams]);
  useEffect(() => {
    localStorage.setItem("ftb_players_v2", JSON.stringify(players));
  }, [players]);
  useEffect(() => {
    localStorage.setItem("ftb_teams_v1", JSON.stringify(teamNames));
  }, [teamNames]);
  useEffect(() => {
    localStorage.setItem("ftb_role_memory_v1", JSON.stringify(roleMemory));
  }, [roleMemory]);

  // ===== HELPERS =====
  const getRoleFor = (name: string, isWk: boolean): Role => {
    if (roleMemory[name]) return roleMemory[name];
    if (SEED_ROLES[name]) return SEED_ROLES[name];
    if (isWk) return "WK";
    return "BAT";
  };

  // ===== PARSER =====
  const parseTokens = (
    raw: string,
    team: string,
  ): { name: string; isWk: boolean }[] => {
    const tokens = raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const out: { name: string; isWk: boolean }[] = [];
    for (const token of tokens) {
      const isWk = /\(w\)/i.test(token);
      const clean = token.replace(/\([^)]*\)/g, "").trim();
      if (!clean) continue;
      const names = clean
        .split("/")
        .map((s) => s.trim())
        .filter(Boolean);
      for (const n of names) out.push({ name: n, isWk });
    }
    return out;
  };

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
    const probableLists: string[] = [];
    while ((m = probableRegex.exec(matchText)) !== null) {
      probableLists.push(m[1].trim());
    }

    // ===== CONTENT-BASED MATCHING (the fix) =====
    // For each team, find the probable XII list whose players have the MOST
    // overlap with that team's squad. This handles the case where Probable XII
    // and Squad: appear in different orders in the source text.
    const teamProbableMap: Record<string, { name: string; isWk: boolean }[]> =
      {};
    const assignedIdx = new Set<number>();

    teamData.forEach((td) => {
      const squadNames = new Set(
        parseTokens(td.squadList, td.name).map((t) => t.name),
      );
      let bestIdx = -1;
      let bestOverlap = -1;
      probableLists.forEach((prob, idx) => {
        if (assignedIdx.has(idx)) return;
        const probTokens = parseTokens(prob, "");
        const overlap = probTokens.filter((t) => squadNames.has(t.name)).length;
        if (overlap > bestOverlap) {
          bestOverlap = overlap;
          bestIdx = idx;
        }
      });
      if (bestIdx !== -1 && bestOverlap > 0) {
        assignedIdx.add(bestIdx);
        teamProbableMap[td.name] = parseTokens(probableLists[bestIdx], td.name);
      }
    });

    // Build final player list
    const allPlayers: Player[] = [];
    teamData.forEach((td) => {
      const probableTokens = teamProbableMap[td.name] || [];
      const probableNames = new Set(probableTokens.map((t) => t.name));
      const squadTokens = parseTokens(td.squadList, td.name);
      const seen = new Set<string>();

      // Probable XI first (in given order, only if they're actually in squad)
      probableTokens.forEach((tk) => {
        if (seen.has(tk.name)) return;
        // Only include if in this team's squad (safety net)
        const inSquad = squadTokens.some((s) => s.name === tk.name);
        if (!inSquad) return;
        seen.add(tk.name);
        allPlayers.push({
          name: tk.name,
          team: td.name,
          role: getRoleFor(tk.name, tk.isWk),
          probable: true,
        });
      });

      // Then rest of squad
      squadTokens.forEach((tk) => {
        if (seen.has(tk.name)) return;
        seen.add(tk.name);
        allPlayers.push({
          name: tk.name,
          team: td.name,
          role: getRoleFor(tk.name, tk.isWk),
          probable: probableNames.has(tk.name),
        });
      });
    });

    if (allPlayers.length === 0) {
      setParseInfo({ msg: "No players parsed.", ok: false });
      return;
    }

    setPlayers(allPlayers);
    setTeamNames(teamData.map((t) => t.name));
    setSelection([]);
    setCaptain(null);
    setViceCaptain(null);
    setEditingTeamId(null);
    setSwapTargetName(null);

    const probableCount = allPlayers.filter((p) => p.probable).length;
    const matchedTeams = Object.keys(teamProbableMap).length;
    setParseInfo({
      msg: `Extracted ${allPlayers.length} players (${probableCount} probable across ${matchedTeams}/${teamData.length} teams). ⭐ = probable XI.`,
      ok: true,
    });
  };

  // ===== ROLE CYCLE =====
  const cycleRole = (name: string) => {
    setPlayers((prev) =>
      prev.map((p) => {
        if (p.name !== name) return p;
        const newRole = ROLES[(ROLES.indexOf(p.role) + 1) % ROLES.length];
        setRoleMemory((mem) => ({ ...mem, [name]: newRole }));
        return { ...p, role: newRole };
      }),
    );
  };

  // ===== TEAM BUILDING (with swap mode) =====
  const togglePlayer = (name: string) => {
    // Already selected → deselect
    if (selection.includes(name)) {
      if (swapTargetName === name) setSwapTargetName(null);
      setSelection((prev) => prev.filter((n) => n !== name));
      if (captain === name) setCaptain(null);
      if (viceCaptain === name) setViceCaptain(null);
      return;
    }

    // Swap mode armed → replace
    if (swapTargetName) {
      const target = swapTargetName;
      setSelection((prev) => prev.map((n) => (n === target ? name : n)));
      if (captain === target) setCaptain(name);
      if (viceCaptain === target) setViceCaptain(name);
      setSwapTargetName(null);
      return;
    }

    if (selection.length >= 11) {
      alert(
        "11 players already selected. Tap ⇄ on a selected player to swap, or tap × to remove one first.",
      );
      return;
    }
    setSelection((prev) => [...prev, name]);
  };

  const armSwap = (name: string) => {
    if (!selection.includes(name)) return;
    setSwapTargetName((prev) => (prev === name ? null : name));
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

  const validateTeam = (): boolean => {
    if (selection.length !== 11) {
      alert(`Need exactly 11 players. Currently: ${selection.length}`);
      return false;
    }
    if (!captain) {
      alert("Select a Captain (C).");
      return false;
    }
    if (!viceCaptain) {
      alert("Select a Vice-Captain (VC).");
      return false;
    }
    return true;
  };

  const saveTeam = () => {
    if (!validateTeam()) return;
    if (editingTeamId) {
      setSavedTeams((prev) =>
        prev.map((t) =>
          t.id === editingTeamId
            ? { ...t, players: [...selection], captain, viceCaptain }
            : t,
        ),
      );
      setEditingTeamId(null);
    } else {
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
    }
    setSelection([]);
    setCaptain(null);
    setViceCaptain(null);
    setSwapTargetName(null);
  };

  const saveAsNew = () => {
    if (!validateTeam()) return;
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
    setEditingTeamId(null);
    setSelection([]);
    setCaptain(null);
    setViceCaptain(null);
    setSwapTargetName(null);
  };

  const clearCurrent = () => {
    if (
      editingTeamId &&
      !confirm("Cancel editing? Unsaved changes will be lost.")
    )
      return;
    setSelection([]);
    setCaptain(null);
    setViceCaptain(null);
    setEditingTeamId(null);
    setSwapTargetName(null);
  };

  const deleteTeam = (id: string) => {
    if (!confirm("Delete this team?")) return;
    setSavedTeams((prev) => prev.filter((t) => t.id !== id));
    if (previewId === id) setPreviewId(null);
    if (editingTeamId === id) {
      setEditingTeamId(null);
      setSelection([]);
      setCaptain(null);
      setViceCaptain(null);
    }
  };

  const startEdit = (t: SavedTeam) => {
    setSelection([...t.players]);
    setCaptain(t.captain);
    setViceCaptain(t.viceCaptain);
    setEditingTeamId(t.id);
    setPreviewId(null);
    setSwapTargetName(null);
    setActiveTab("builder");
  };

  const startDuplicate = (t: SavedTeam) => {
    setSelection([...t.players]);
    setCaptain(t.captain);
    setViceCaptain(t.viceCaptain);
    setEditingTeamId(null);
    setPreviewId(null);
    setSwapTargetName(null);
    setActiveTab("builder");
  };

  const resetAll = () => {
    if (
      !confirm(
        "⚠️ Reset everything?\n\nThis will delete:\n• All saved teams\n• Current player pool\n• Match data\n\nRole memory will be kept. Cannot be undone.",
      )
    )
      return;
    setSavedTeams([]);
    setPlayers([]);
    setTeamNames([]);
    setSelection([]);
    setCaptain(null);
    setViceCaptain(null);
    setMatchText("");
    setParseInfo({ msg: "", ok: true });
    setPreviewId(null);
    setEditingTeamId(null);
    setSwapTargetName(null);
  };

  const resetRoleMemory = () => {
    if (!confirm("Clear role memory? All custom role mappings will be lost."))
      return;
    setRoleMemory({});
  };

  // ===== ANALYTICS =====
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

  const uniqueCaps = useMemo(() => {
    const set = new Set<string>();
    savedTeams.forEach((t) => { if (t.captain) set.add(t.captain); });
    return Array.from(set).sort();
  }, [savedTeams]);

  const uniqueVCs = useMemo(() => {
    const set = new Set<string>();
    savedTeams.forEach((t) => { if (t.viceCaptain) set.add(t.viceCaptain); });
    return Array.from(set).sort();
  }, [savedTeams]);

  const filteredTableTeams = useMemo(() => {
    return savedTeams.filter((t) => {
      if (tableFilterCap && t.captain !== tableFilterCap) return false;
      if (tableFilterVC && t.viceCaptain !== tableFilterVC) return false;
      if (tableFilterPlayer && !t.players.includes(tableFilterPlayer)) return false;
      return true;
    });
  }, [savedTeams, tableFilterCap, tableFilterVC, tableFilterPlayer]);

  const highlightedTeamIds = useMemo(() => {
    const ids = new Set<string>();
    for (let i = 0; i < savedTeams.length; i++) {
      for (let j = i + 1; j < savedTeams.length; j++) {
        const setA = new Set(savedTeams[i].players);
        const common = savedTeams[j].players.filter((p) => setA.has(p));
        if (common.length >= 9) {
          ids.add(savedTeams[i].id);
          ids.add(savedTeams[j].id);
        }
      }
    }
    return ids;
  }, [savedTeams]);

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
                      <div
                        key={pn}
                        className="flex flex-col items-center gap-0.5"
                      >
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
              Paste preview → extract → build & track teams.
            </p>
          </div>
          <div className="flex gap-2 text-sm items-center">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2">
              <span className="text-zinc-400">Saved: </span>
              <span className="font-semibold">{savedTeams.length}</span>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2">
              <span className="text-zinc-400">Pool: </span>
              <span className="font-semibold">{players.length}</span>
            </div>
            <button
              onClick={resetAll}
              className="bg-red-600/20 border border-red-600/50 text-red-400 hover:bg-red-600/30 rounded-xl px-3 py-2 text-sm font-semibold"
            >
              Reset All
            </button>
          </div>
        </div>

        <div className="flex gap-2 border-b border-zinc-800 overflow-x-auto">
          {(
            [
              ["builder", "Builder"],
              ["saved", `Saved Teams (${savedTeams.length})`],
              ["table", "Table View"],
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
              <h2 className="text-xl font-semibold mb-3">
                1. Paste Match Context
              </h2>
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
                {/* SWAP MODE BANNER */}
                {swapTargetName && (
                  <div className="bg-orange-600/20 border-2 border-orange-500 rounded-xl p-3 flex items-center justify-between flex-wrap gap-2">
                    <div className="text-sm">
                      <span className="font-bold text-orange-300">
                        🔄 SWAP MODE
                      </span>
                      <span className="text-zinc-300 ml-2">
                        Tap any player below to swap with{" "}
                        <span className="font-semibold text-white">
                          {swapTargetName}
                        </span>
                      </span>
                    </div>
                    <button
                      onClick={() => setSwapTargetName(null)}
                      className="px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs"
                    >
                      Cancel Swap
                    </button>
                  </div>
                )}

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
                  <p className="text-xs text-zinc-500 mb-3">
                    ⭐ = Probable XI · Tap role badge to change · ⇄ on selected
                    player to swap
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {teamNames.map((tn) => {
                      const tp = players.filter((p) => p.team === tn);
                      const s = teamStyle(tn);
                      const teamSelected = selection.filter(
                        (n) => teamForName(n) === tn,
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
                          <div className="space-y-1.5 max-h-[600px] overflow-y-auto pr-1">
                            {tp.map((p) => {
                              const isSelected = selection.includes(p.name);
                              const isSwapArmed = swapTargetName === p.name;
                              const isSwapCandidate =
                                swapTargetName !== null && !isSelected;
                              return (
                                <div
                                  key={p.name}
                                  onClick={() => togglePlayer(p.name)}
                                  className={`p-2 rounded-lg cursor-pointer text-sm border transition-all flex items-center justify-between gap-2 ${
                                    isSwapArmed
                                      ? "bg-orange-600/20 border-orange-500 ring-2 ring-orange-500/50"
                                      : isSelected
                                        ? "bg-green-600/15 border-green-500"
                                        : isSwapCandidate
                                          ? "bg-zinc-900 border-orange-500/30 hover:border-orange-500 hover:bg-orange-600/10"
                                          : p.probable
                                            ? "bg-zinc-900 border-zinc-700 hover:border-zinc-500"
                                            : "bg-zinc-900/50 border-zinc-800/50 hover:border-zinc-700 opacity-70"
                                  }`}
                                >
                                  <div className="flex items-center gap-1.5 min-w-0">
                                    {p.probable && (
                                      <span className="text-yellow-400 text-xs">
                                        ⭐
                                      </span>
                                    )}
                                    <span className="font-medium truncate">
                                      {p.name}
                                    </span>
                                  </div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      cycleRole(p.name);
                                    }}
                                    className={`text-[10px] font-bold px-2 py-0.5 rounded shrink-0 ${
                                      ROLE_BG[p.role]
                                    } hover:opacity-80`}
                                    title="Tap to change role (saved permanently)"
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
                    <div className="flex items-center gap-3 flex-wrap">
                      <h2 className="text-xl font-semibold">3. Current Team</h2>
                      {editingTeamId && (
                        <span className="text-xs bg-orange-500/20 border border-orange-500/50 text-orange-300 px-2 py-1 rounded-md font-semibold">
                          ✏️ EDITING Team #
                          {savedTeams.findIndex((t) => t.id === editingTeamId) +
                            1}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={clearCurrent}
                        className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs"
                      >
                        {editingTeamId ? "Cancel Edit" : "Clear"}
                      </button>
                      {editingTeamId ? (
                        <>
                          <button
                            onClick={saveTeam}
                            className="px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-xs font-semibold"
                          >
                            Save Changes
                          </button>
                          <button
                            onClick={saveAsNew}
                            className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-xs font-semibold"
                          >
                            Save as New
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={saveTeam}
                          className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-xs font-semibold"
                        >
                          Save Team
                        </button>
                      )}
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
                      const isSwapArmed = swapTargetName === name;
                      const s = p ? teamStyle(p.team) : null;
                      return (
                        <div
                          key={name}
                          className={`bg-zinc-950 border rounded-lg p-2.5 flex items-center justify-between gap-2 ${
                            isSwapArmed
                              ? "border-orange-500 ring-2 ring-orange-500/50 bg-orange-600/10"
                              : isCap
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
                              {isSwapArmed && (
                                <span className="text-[10px] bg-orange-500 text-black px-1.5 rounded font-bold animate-pulse">
                                  SWAP
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
                              title="Captain"
                            >
                              C
                            </button>
                            <button
                              onClick={() => makeVC(name)}
                              className={`w-7 h-7 rounded-md text-xs font-bold ${
                                isVc
                                  ? "bg-blue-500"
                                  : "bg-zinc-800 hover:bg-zinc-700"
                              }`}
                              title="Vice-Captain"
                            >
                              VC
                            </button>
                            <button
                              onClick={() => armSwap(name)}
                              className={`w-7 h-7 rounded-md text-xs font-bold ${
                                isSwapArmed
                                  ? "bg-orange-500 text-black"
                                  : "bg-zinc-800 hover:bg-orange-600"
                              }`}
                              title="Swap — tap then tap any pool player"
                            >
                              ⇄
                            </button>
                            <button
                              onClick={() => togglePlayer(name)}
                              className="w-7 h-7 rounded-md text-xs bg-zinc-800 hover:bg-red-600"
                              title="Remove"
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
                  const isEditing = editingTeamId === t.id;
                  return (
                    <div
                      key={t.id}
                      className={`bg-zinc-950 border rounded-2xl p-4 transition-colors ${
                        isEditing
                          ? "border-orange-500"
                          : "border-zinc-800 hover:border-green-500"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="font-semibold flex items-center gap-2">
                          Team #{idx + 1}
                          {isEditing && (
                            <span className="text-[10px] bg-orange-500/30 text-orange-300 px-1.5 py-0.5 rounded">
                              EDITING
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => deleteTeam(t.id)}
                          className="text-xs text-zinc-500 hover:text-red-400"
                        >
                          Delete
                        </button>
                      </div>
                      <div
                        className="space-y-1.5 text-sm cursor-pointer"
                        onClick={() => setPreviewId(t.id)}
                      >
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
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => setPreviewId(t.id)}
                          className="flex-1 px-2 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs"
                        >
                          Preview
                        </button>
                        <button
                          onClick={() => startEdit(t)}
                          className="flex-1 px-2 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-xs font-semibold"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => startDuplicate(t)}
                          className="flex-1 px-2 py-1.5 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-xs"
                        >
                          Duplicate
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
        {activeTab === "table" && (
          <div className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800 overflow-x-auto">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <h2 className="text-xl font-semibold">Teams Table View</h2>
              <span className="text-zinc-500 text-xs">
                {filteredTableTeams.length} / {savedTeams.length} teams
              </span>
            </div>

            {savedTeams.length === 0 ? (
              <div className="text-zinc-500 text-sm text-center py-12">
                No teams yet. Go to Builder.
              </div>
            ) : (
              <>
                {/* Filters */}
                <div className="flex flex-wrap gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-zinc-400 font-semibold uppercase tracking-wide">
                      CAP
                    </label>
                    <select
                      value={tableFilterCap}
                      onChange={(e) => setTableFilterCap(e.target.value)}
                      className="bg-zinc-800 border border-zinc-700 text-white text-xs rounded-lg px-2 py-1.5 outline-none focus:border-yellow-500"
                    >
                      <option value="">All Captains</option>
                      {uniqueCaps.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-zinc-400 font-semibold uppercase tracking-wide">
                      VC
                    </label>
                    <select
                      value={tableFilterVC}
                      onChange={(e) => setTableFilterVC(e.target.value)}
                      className="bg-zinc-800 border border-zinc-700 text-white text-xs rounded-lg px-2 py-1.5 outline-none focus:border-blue-500"
                    >
                      <option value="">All Vice-Captains</option>
                      {uniqueVCs.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  {tableFilterPlayer && (
                    <div className="flex items-center gap-2 bg-purple-600/20 border border-purple-500/50 rounded-lg px-3 py-1.5">
                      <span className="text-xs text-purple-300 font-medium">
                        Player: {tableFilterPlayer}
                      </span>
                      <button
                        onClick={() => setTableFilterPlayer("")}
                        className="text-purple-400 hover:text-purple-200 text-xs font-bold"
                      >
                        ×
                      </button>
                    </div>
                  )}
                  {(tableFilterCap || tableFilterVC || tableFilterPlayer) && (
                    <button
                      onClick={() => {
                        setTableFilterCap("");
                        setTableFilterVC("");
                        setTableFilterPlayer("");
                      }}
                      className="text-xs text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded-lg"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>

                {highlightedTeamIds.size > 0 && (
                  <div className="mb-3 flex items-center gap-2 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-2">
                    <span className="font-bold">⚠</span>
                    <span>
                      Highlighted rows share 9+ players with another team
                    </span>
                  </div>
                )}

                <table className="w-full text-sm min-w-[800px]">
                  <thead>
                    <tr className="border-b border-zinc-700 text-zinc-400 text-left text-xs uppercase tracking-wider">
                      <th className="py-3 px-2 font-semibold">Team</th>
                      <th className="py-3 px-2 font-semibold">C</th>
                      <th className="py-3 px-2 font-semibold">VC</th>
                      <th className="py-3 px-2 font-semibold">XI</th>
                      <th className="py-3 px-2 font-semibold whitespace-nowrap">
                        {teamNames
                          .map((t) =>
                            t
                              .split(" ")
                              .map((w) => w[0])
                              .join(""),
                          )
                          .join("-")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTableTeams.map((t) => {
                      const idx = savedTeams.indexOf(t);
                      const bd = teamBreakdown(t);
                      const counts = teamNames.map((tn) => bd[tn] || 0).join("-");
                      const isHighlighted = highlightedTeamIds.has(t.id);
                      return (
                        <tr
                          key={t.id}
                          className={`border-b cursor-pointer transition-colors ${
                            isHighlighted
                              ? "border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/15"
                              : "border-zinc-800 hover:bg-zinc-950/50"
                          }`}
                          onClick={() => setPreviewId(t.id)}
                        >
                          <td className="py-3 px-2 font-bold align-top whitespace-nowrap">
                            T{idx + 1}
                            {isHighlighted && (
                              <span className="ml-1 text-amber-400 text-xs">
                                ⚠
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-2 text-yellow-400 font-medium align-top whitespace-nowrap">
                            {t.captain}
                          </td>
                          <td className="py-3 px-2 text-blue-400 font-medium align-top whitespace-nowrap">
                            {t.viceCaptain}
                          </td>
                          <td className="py-3 px-2 align-top">
                            <div className="text-zinc-300 leading-relaxed">
                              {t.players.map((pn, i) => {
                                const p = playerByName(pn);
                                const isWk = p?.role === "WK";
                                const isC = pn === t.captain;
                                const isVc = pn === t.viceCaptain;
                                const isFiltered = pn === tableFilterPlayer;
                                return (
                                  <span key={pn}>
                                    <span
                                      className={
                                        isFiltered
                                          ? "font-bold text-purple-400 underline"
                                          : isC
                                            ? "font-bold text-yellow-400"
                                            : isVc
                                              ? "font-bold text-blue-400"
                                              : ""
                                      }
                                    >
                                      {pn}
                                      {isWk ? "(wk)" : ""}
                                    </span>
                                    {i < t.players.length - 1 ? ", " : ""}
                                  </span>
                                );
                              })}
                            </div>
                          </td>
                          <td className="py-3 px-2 font-bold align-top whitespace-nowrap">
                            {counts}
                          </td>
                        </tr>
                      );
                    })}
                    {filteredTableTeams.length === 0 && (
                      <tr>
                        <td
                          colSpan={5}
                          className="py-10 text-center text-zinc-500 text-sm"
                        >
                          No teams match the current filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </>
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
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <h3 className="text-lg font-semibold">Team Preview</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(previewedTeam)}
                    className="px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-xs font-semibold"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => startDuplicate(previewedTeam)}
                    className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs"
                  >
                    Duplicate
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
                      <div className="text-zinc-500 text-sm">
                        No captains yet.
                      </div>
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
                                <div className="font-medium text-sm">
                                  {c.name}
                                </div>
                                <div className={`text-xs ${s.text}`}>
                                  {c.team}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-yellow-400">
                                  {c.count}
                                </div>
                                <div className="text-[10px] text-zinc-500">
                                  {(
                                    (c.count / savedTeams.length) *
                                    100
                                  ).toFixed(0)}
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
                                <div className="font-medium text-sm">
                                  {c.name}
                                </div>
                                <div className={`text-xs ${s.text}`}>
                                  {c.team}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-blue-400">
                                  {c.count}
                                </div>
                                <div className="text-[10px] text-zinc-500">
                                  {(
                                    (c.count / savedTeams.length) *
                                    100
                                  ).toFixed(0)}
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
                      (picked players only)
                    </span>
                  </h2>
                  {playerExposure.length === 0 ? (
                    <div className="text-zinc-500 text-sm">No picks yet.</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <p className="text-xs text-zinc-500 mb-2">
                        Click a player to filter teams in Table View
                      </p>
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
                              <tr
                                key={p.name}
                                className="border-b border-zinc-900 hover:bg-zinc-950/60 cursor-pointer group"
                                onClick={() => {
                                  setTableFilterPlayer(p.name);
                                  setTableFilterCap("");
                                  setTableFilterVC("");
                                  setActiveTab("table");
                                }}
                              >
                                <td className="py-2 pr-3 text-zinc-500">
                                  {i + 1}
                                </td>
                                <td className="py-2 pr-3 font-medium group-hover:text-purple-400 transition-colors">
                                  {p.name}
                                  <span className="ml-1 opacity-0 group-hover:opacity-100 text-[10px] text-purple-400 transition-opacity">
                                    → filter
                                  </span>
                                </td>
                                <td className={`py-2 pr-3 ${s.text}`}>
                                  {p.team}
                                </td>
                                <td className="py-2 pr-3 font-semibold">
                                  {p.count}
                                </td>
                                <td className="py-2 text-zinc-400">
                                  {(
                                    (p.count / savedTeams.length) *
                                    100
                                  ).toFixed(0)}
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
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <h2 className="text-xl font-semibold">Players Info</h2>
              <button
                onClick={resetRoleMemory}
                className="text-xs bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded-lg"
              >
                Reset Role Memory ({Object.keys(roleMemory).length})
              </button>
            </div>
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
                            <div className="flex items-center gap-1.5">
                              <span className="text-zinc-500 mr-1">
                                {i + 1}.
                              </span>
                              {p.probable && (
                                <span className="text-yellow-400 text-xs">
                                  ⭐
                                </span>
                              )}
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
