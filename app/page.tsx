"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LabelList,
} from "recharts";

const GOOGLE_SHEET_WEB_APP_URL =
  "https://script.google.com/macros/s/AKfycbz3PbRwLG1-bTkc_m5hW73fORKAbJ8h59rJe15pr-6gangNQ7HhtOJIR-4_ymZ72lmV/exec";

const MATCH_DAY = new Date("2026-05-09T00:00:00");

type CountdownParts = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isLive: boolean;
};

function getCountdownParts(target: Date): CountdownParts {
  const diff = target.getTime() - Date.now();

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isLive: true };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return { days, hours, minutes, seconds, isLive: false };
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center rounded-xl bg-white/10 px-2 py-2 backdrop-blur sm:min-w-[68px] sm:px-3">
      <span className="text-2xl font-black tabular-nums tracking-tight sm:text-3xl">
        {value.toString().padStart(2, "0")}
      </span>
      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-200">
        {label}
      </span>
    </div>
  );
}

function BreakingNews() {
  const [items, setItems] = useState<string[]>([]);

  useEffect(() => {
    fetch(`${GOOGLE_SHEET_WEB_APP_URL}?resource=news`, { cache: "no-store" })
      .then((response) => response.json())
      .then((data: { news?: unknown[] }) => {
        const lines = (data.news ?? [])
          .map((item) => String(item).trim())
          .filter(Boolean);
        setItems(lines);
      })
      .catch(() => setItems([]));
  }, []);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="mb-6 overflow-hidden rounded-3xl border-2 border-slate-900 bg-white shadow-xl">
      <div className="flex items-center gap-2 bg-slate-900 px-4 py-2 text-white">
        <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-white" />
        <span className="text-sm font-black uppercase tracking-widest">
          Transfer Window Drama – SSL Edition ⚽🔥
        </span>
      </div>
      <ul className="list-disc space-y-2 p-5 pl-9 text-gray-950">
        {items.map((item, index) => (
          <li key={index} className="font-bold">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function MatchCountdown() {
  const [parts, setParts] = useState<CountdownParts | null>(null);

  useEffect(() => {
    setParts(getCountdownParts(MATCH_DAY));
    const id = setInterval(() => {
      setParts(getCountdownParts(MATCH_DAY));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  if (!parts) {
    return null;
  }

  if (parts.isLive) {
    return (
      <div className="mt-6 rounded-2xl bg-green-500/20 p-4 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-green-200">
          Match Day
        </p>
        <p className="mt-1 text-2xl font-black">It&apos;s game time! ⚽</p>
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-2xl bg-white/10 p-4 backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-200">
            Kickoff Countdown
          </p>
          <p className="text-sm font-semibold text-slate-100">May 09, 2026</p>
        </div>
        <div className="grid w-full grid-cols-4 gap-2 sm:flex sm:w-auto">
          <CountdownUnit value={parts.days} label="Days" />
          <CountdownUnit value={parts.hours} label="Hours" />
          <CountdownUnit value={parts.minutes} label="Mins" />
          <CountdownUnit value={parts.seconds} label="Secs" />
        </div>
      </div>
    </div>
  );
}

const TEAMS = [
  {
    name: "Harbhanga United",
    short: "HU",
    emoji: "⚽",
    color: "#2563eb",
    players: [
      "Binayak L.",
      "Rishan Ray",
      "Shyama (C)",
      "Tirtha",
      "Abhishek Saha",
      "Amit Sinha",
      "Rohan Sen",
      "Aryaan DebRoy",
      "Jayanta Mukherjee",
      "Sushil Mahato",
      "Ashish Garg",
      "Indranil Acharya",
      "Srijan",
    ],
  },
  {
    name: "Chomkaitola Sporting Club",
    short: "CSC",
    emoji: "🔥",
    color: "#dc2626",
    players: [
      "Sumit",
      "Suman (C)",
      "Aranya Debnath",
      "Debasmit",
      "Shubhrangshu",
      "Sourav",
      "Shrish Maiti",
      "Abesh Chatterjee",
      "Barun Das",
      "Arindom",
      "Sandipan",
      "Raika Ghosh",
    ],
  },
  {
    name: "Old Monks™",
    short: "OM",
    emoji: "🥃",
    color: "#92400e",
    players: [
      "Naveen",
      "Suvam",
      "Bani (C)",
      "Debaditya Ray",
      "Soumyadip",
      "Arijeet",
      "Revanta",
      "Agniv Das",
      "Om Chatterjee",
      "Rishi Maulick",
      "Jay Shah",
      "Nilanjan",
      "Arunim",
    ],
  },
  {
    name: "FC Kumro Potash",
    short: "FCKP",
    emoji: "🎃",
    color: "#ea580c",
    players: [
      "Ankur Debnath",
      "Subho Chatterjee (C)",
      "Obie",
      "Krishnarjun",
      "Joon Chatterjee",
      "Rakesh",
      "Arya Mazumdar",
      "Reyaan Das",
      "Souradipta",
      "Somenath",
      "Richik Mukhopadhyay",
      "Animesh",
    ],
  },
];

type TeamStats = {
  predictionVotes: number;
  supportVotes: number;
};

type VotePayloadInput = {
  name: string;
  supportTeam: string;
  winningTeam: string;
};

function createEmptyStats(): Record<string, TeamStats> {
  return TEAMS.reduce<Record<string, TeamStats>>((acc, team) => {
    acc[team.name] = { predictionVotes: 0, supportVotes: 0 };
    return acc;
  }, {});
}

function getTotals(stats: Record<string, TeamStats>) {
  return Object.values(stats).reduce<TeamStats>(
    (totals, item) => ({
      predictionVotes: totals.predictionVotes + item.predictionVotes,
      supportVotes: totals.supportVotes + item.supportVotes,
    }),
    { predictionVotes: 0, supportVotes: 0 }
  );
}

function getLeader(stats: Record<string, TeamStats>, voteKey: keyof TeamStats) {
  return [...TEAMS].sort((a, b) => stats[b.name][voteKey] - stats[a.name][voteKey])[0];
}

// Add slang/celebrity/politician names you've seen abused. Compared as whole tokens, lowercase.
const BLOCKED_NAME_TERMS = [
  "messi",
  "ronaldo",
  "neymar",
  "modi",
  "trump",
  "mamata",
];

function validateName(rawName: string): string | null {
  const name = rawName.trim();
  if (name.length < 2) return "Please enter your full name.";
  if (name.length > 30) return "Name must be 30 characters or fewer.";
  if (!/^[A-Za-z][A-Za-z\s.'-]*$/.test(name)) {
    return "Name can only contain letters, spaces, hyphens, periods, and apostrophes.";
  }
  if (/\s{2,}/.test(name)) return "Please remove extra spaces from your name.";
  const spaceCount = (name.match(/ /g) ?? []).length;
  if (spaceCount < 1) return "Please enter both first and last name.";
  if (spaceCount > 2) return "Name can have at most two spaces.";
  if (/(.)\1{2,}/.test(name)) return "Please enter a real name.";
  const tokens = name.toLowerCase().split(/\s+/).map((t) => t.replace(/[.'-]/g, ""));
  if (tokens.some((token) => BLOCKED_NAME_TERMS.includes(token))) {
    return "Please use your actual name.";
  }
  return null;
}

function buildPayload({ name, supportTeam, winningTeam }: VotePayloadInput, ip: string) {
  return {
    tournament: "Saikat Soccer League",
    name,
    supportTeam,
    winningTeam,
    ip,
    submittedAt: new Date().toISOString(),
  };
}

async function fetchClientIp(): Promise<string> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const response = await fetch("https://api.ipify.org?format=json", { signal: controller.signal });
    clearTimeout(timeout);
    const data: { ip?: string } = await response.json();
    return data.ip ?? "";
  } catch {
    return "";
  }
}

async function saveToGoogleSheet(payload: VotePayloadInput) {
  const response = await fetch(GOOGLE_SHEET_WEB_APP_URL, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json();

  if (!result.ok) {
    throw new Error(result.error || "Vote save failed.");
  }

  return result;
}

async function loadVotesFromGoogleSheet() {
  const response = await fetch(GOOGLE_SHEET_WEB_APP_URL);
  const data = await response.json();

  const freshStats = createEmptyStats();

  data.votes.forEach((vote: VotePayloadInput) => {
    if (freshStats[vote.supportTeam]) {
      freshStats[vote.supportTeam].supportVotes += 1;
    }

    if (freshStats[vote.winningTeam]) {
      freshStats[vote.winningTeam].predictionVotes += 1;
    }
  });

  return {
    votes: data.votes.reverse(),
    stats: freshStats,
  };
}

type CardProps = {
  children: React.ReactNode;
  className?: string;
};

function Card({ children, className = "" }: CardProps) {
  return <div className={`bg-white text-gray-950 ${className}`}>{children}</div>;
}

function CardContent({ children, className = "" }: CardProps) {
  return <div className={className}>{children}</div>;
}

type NativeButtonProps = {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
};

function NativeButton({ children, onClick, disabled }: NativeButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded-xl bg-slate-900 px-6 py-3 font-bold text-white transition hover:bg-slate-800 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </button>
  );
}

type VoteButtonProps = {
  team: (typeof TEAMS)[number];
  selected: boolean;
  onClick: () => void;
  showMobilePlayers?: boolean;
};

function VoteButton({ team, selected, onClick, showMobilePlayers = true }: VoteButtonProps) {
  const heading = <div className="mb-2 font-black">{team.name} Players</div>;
  const playerItems = team.players.map((player) => <div key={player}>• {player}</div>);

  return (
    <div className="group relative">
      <button
        type="button"
        onClick={onClick}
        className={`w-full rounded-xl border p-4 text-left text-base font-bold transition hover:shadow-md ${
          selected
            ? "border-slate-900 bg-slate-900 text-white"
            : "border-gray-300 bg-white text-gray-950 hover:bg-gray-50"
        }`}
      >
        {team.emoji} {team.name}
      </button>

      {showMobilePlayers && (
        <details className="mt-2 rounded-xl border border-gray-300 bg-white text-sm text-gray-950 shadow-md sm:hidden">
          <summary className="cursor-pointer list-none px-4 py-2 font-bold text-slate-700 [&::-webkit-details-marker]:hidden">
            View {team.name} players
          </summary>
          <div className="px-4 pb-4">
            <div className="grid grid-cols-2 gap-1">{playerItems}</div>
          </div>
        </details>
      )}

      <div className="absolute left-0 top-full z-[9999] mt-2 hidden w-full rounded-xl border border-gray-300 bg-white p-4 text-sm text-gray-950 shadow-2xl group-hover:block max-sm:hidden!">
        {heading}
        <div className="grid grid-cols-1 gap-1">{playerItems}</div>
      </div>
    </div>
  );
}

export default function Page() {
  const [stats, setStats] = useState(createEmptyStats());
  const [votes, setVotes] = useState<VotePayloadInput[]>([]);
  const [name, setName] = useState("");
  const [supportPick, setSupportPick] = useState("");
  const [predictionPick, setPredictionPick] = useState("");
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [votesPage, setVotesPage] = useState(1);
  const VOTES_PER_PAGE = 10;

  useEffect(() => {
    loadVotesFromGoogleSheet()
      .then((data) => {
        setVotes(data.votes);
        setStats(data.stats);
      })
      .catch((error) => {
        console.error(error);
        setMessage({ text: "Unable to load current votes.", isError: true });
      });
  }, []);

  const totals = useMemo(() => getTotals(stats), [stats]);

  const predictionData = TEAMS.map((team) => ({
    name: team.short,
    fullName: team.name,
    votes: stats[team.name].predictionVotes,
    fill: team.color,
  }));

  const supportData = TEAMS.map((team) => ({
    name: team.short,
    fullName: team.name,
    votes: stats[team.name].supportVotes,
    fill: team.color,
  }));

  const predictionLeader = getLeader(stats, "predictionVotes");
  const supportLeader = getLeader(stats, "supportVotes");

  const submitVote = async () => {
    const nameError = validateName(name);
    if (nameError) {
      setMessage({ text: nameError, isError: true });
      return;
    }

    if (!supportPick) {
      setMessage({ text: "Please select the team you support.", isError: true });
      return;
    }

    if (!predictionPick) {
      setMessage({ text: "Please select the team you think will win.", isError: true });
      return;
    }

    setMessage({ text: "Saving vote...", isError: false });

    const ip = await fetchClientIp();
    const payload = buildPayload(
      {
        name: name.trim(),
        supportTeam: supportPick,
        winningTeam: predictionPick,
      },
      ip,
    );

    saveToGoogleSheet(payload)
      .then(() => loadVotesFromGoogleSheet())
      .then((data) => {
        setVotes(data.votes);
        setStats(data.stats);
        setSupportPick("");
        setPredictionPick("");
        setMessage({ text: "Vote counted successfully.", isError: false });
      })
      .catch((error) => {
        console.error(error);
        setMessage({
          text: error.message || "Vote save failed. May be the Name is already taken. Please try again with a different name.",
          isError: true,
        });
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-orange-50 p-6 text-gray-950">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 rounded-3xl bg-slate-900 p-8 text-white shadow-xl">
          <div className="flex items-center gap-4">
            <img
              src="/saikat-logo.png"
              alt="Saikat Association logo"
              width={72}
              height={72}
              className="rounded-full border-2 border-white/30 bg-white object-contain"
              loading="eager"
              fetchPriority="high"
            />
            <div>
              <h1 className="text-4xl font-black">Saikat Soccer League(SSL)</h1>
              <p className="mt-2 text-lg text-slate-200">Fan Support & Prediction Portal</p>
            </div>
          </div>
          <MatchCountdown />
        </div>

        <BreakingNews />

        <Card className="mb-6 rounded-3xl shadow-xl">
          <CardContent className="p-6">
            <h2 className="mb-4 text-2xl font-semibold tracking-tight text-gray-900">Fan Details</h2>
            <label className="mb-1 block text-sm font-bold text-gray-950">Your name *</label>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Enter your name"
              maxLength={30}
              className="w-full rounded-xl border border-gray-400 bg-white px-4 py-3 text-gray-950 placeholder:text-gray-500 outline-none focus:border-slate-900"
            />
            <p className="mt-3 text-sm font-medium text-gray-700">Name is mandatory for voting.</p>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="rounded-3xl shadow-xl">
            <CardContent className="overflow-visible p-6"> 
              <h2 className="mb-4 text-2xl font-black text-gray-950">❤️ Which team do you support?</h2>
              <div className="space-y-3">
                {TEAMS.map((team) => (
                  <VoteButton
                    key={`support-${team.name}`}
                    team={team}
                    selected={supportPick === team.name}
                    onClick={() => setSupportPick(team.name)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl shadow-xl">
            <CardContent className="overflow-visible p-6">
              <h2 className="mb-4 text-2xl font-black text-gray-950">🏆 Your Prediction: Who will win?</h2>
              <div className="space-y-3">
                {TEAMS.map((team) => (
                  <VoteButton
                    key={`prediction-${team.name}`}
                    team={team}
                    selected={predictionPick === team.name}
                    onClick={() => setPredictionPick(team.name)}
                    showMobilePlayers={false}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 flex justify-center">
          <NativeButton onClick={submitVote} disabled={!supportPick || !predictionPick}>
            Submit Vote
          </NativeButton>
        </div>

        {message && (
          <div
            className={`mt-4 rounded-2xl p-4 text-center font-bold shadow ${
              message.isError
                ? "border border-red-200 bg-red-50 text-red-700"
                : "bg-white text-gray-950"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <Card className="rounded-3xl shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-gray-950">Prediction Graph</h2>
                  <p className="mt-1 text-sm font-medium text-gray-700">Who fans think will win.</p>
                </div>
                <div className="rounded-xl bg-gray-100 px-3 py-2 text-sm font-bold text-gray-950">
                  Total: {totals.predictionVotes}
                </div>
              </div>

              {totals.predictionVotes === 0 ? (
                <div className="mt-4 flex h-72 items-center justify-center rounded-2xl bg-gray-50 text-center font-semibold text-gray-700">
                  No prediction votes yet.
                </div>
              ) : (
                <div className="mt-4 h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={predictionData} margin={{ top: 24, right: 20, left: 0, bottom: 8 }}>
                      <XAxis dataKey="name" />
                      <YAxis allowDecimals={false} domain={[0, "dataMax + 1"]} />
                      <Tooltip formatter={(value, name, item) => [value, item.payload.fullName]} />
                      <Bar dataKey="votes" radius={[10, 10, 0, 0]} minPointSize={8}>
                        <LabelList dataKey="votes" position="top" />
                        {predictionData.map((entry) => (
                          <Cell key={entry.fullName} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {totals.predictionVotes > 0 && (
                <p className="mt-3 text-center text-sm font-bold text-gray-950">
                  Current prediction leader: {predictionLeader.emoji} {predictionLeader.name}
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-3xl shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-gray-950">Support Graph</h2>
                  <p className="mt-1 text-sm font-medium text-gray-700">Who fans are supporting.</p>
                </div>
                <div className="rounded-xl bg-gray-100 px-3 py-2 text-sm font-bold text-gray-950">
                  Total: {totals.supportVotes}
                </div>
              </div>

              {totals.supportVotes === 0 ? (
                <div className="mt-4 flex h-72 items-center justify-center rounded-2xl bg-gray-50 text-center font-semibold text-gray-700">
                  No support votes yet.
                </div>
              ) : (
                <div className="mt-4 h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={supportData.filter((item) => item.votes > 0)}
                        dataKey="votes"
                        nameKey="fullName"
                        cx="50%"
                        cy="50%"
                        outerRadius={95}
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {supportData
                          .filter((item) => item.votes > 0)
                          .map((entry) => (
                            <Cell key={entry.fullName} fill={entry.fill} />
                          ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}

              {totals.supportVotes > 0 && (
                <p className="mt-3 text-center text-sm font-bold text-gray-950">
                  Current support leader: {supportLeader.emoji} {supportLeader.name}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {votes.length > 0 && (() => {
          const totalPages = Math.max(1, Math.ceil(votes.length / VOTES_PER_PAGE));
          const currentPage = Math.min(votesPage, totalPages);
          const startIndex = (currentPage - 1) * VOTES_PER_PAGE;
          const pageVotes = votes.slice(startIndex, startIndex + VOTES_PER_PAGE);
          return (
            <Card className="mt-8 rounded-3xl shadow-xl">
              <CardContent className="p-6">
                <h2 className="mb-4 text-xl font-black text-gray-950">Recent Votes</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-gray-950">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="p-3">Name</th>
                        <th className="p-3">Team you support</th>
                        <th className="p-3">Team Win</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pageVotes.map((vote, index) => (
                        <tr key={`${vote.name}-${startIndex + index}`} className="border-b">
                          <td className="p-3">{vote.name}</td>
                          <td className="p-3">{vote.supportTeam}</td>
                          <td className="p-3">{vote.winningTeam}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {totalPages > 1 && (
                  <div className="mt-4 flex items-center justify-between text-sm text-gray-700">
                    <span>
                      Showing {startIndex + 1}-{Math.min(startIndex + VOTES_PER_PAGE, votes.length)} of {votes.length}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setVotesPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="rounded-full border border-gray-300 px-4 py-1.5 font-semibold disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Prev
                      </button>
                      <span className="font-semibold">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        type="button"
                        onClick={() => setVotesPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="rounded-full border border-gray-300 px-4 py-1.5 font-semibold disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })()}
      </div>
    </div>
  );
}