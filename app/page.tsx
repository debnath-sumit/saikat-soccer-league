"use client";

import React, { useMemo, useState } from "react";
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

const GOOGLE_SHEET_WEB_APP_URL = "PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE";

const TEAMS = [
  { name: "Harbhanga United", short: "HU", emoji: "⚽", color: "#2563eb" },
  { name: "Chomkaitola Sporting Club", short: "CSC", emoji: "🔥", color: "#dc2626" },
  { name: "Old Monks™", short: "OM", emoji: "🥃", color: "#92400e" },
  { name: "FC Kumro Potash", short: "FCKP", emoji: "🎃", color: "#ea580c" },
];

type TeamStats = {
  predictionVotes: number;
  supportVotes: number;
};

function createEmptyStats(): Record<string, TeamStats> {
  return TEAMS.reduce<Record<string, TeamStats>>((acc, team) => {
    acc[team.name] = { predictionVotes: 0, supportVotes: 0 };
    return acc;
  }, {});
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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

type VoteType = "prediction" | "support";

type VotePayloadInput = {
  name: string;
  email: string;
  team: string;
  voteType: VoteType;
};

function addVote(stats: Record<string, TeamStats>, teamName: string, voteType: VoteType) {
  const key = voteType === "prediction" ? "predictionVotes" : "supportVotes";
  return {
    ...stats,
    [teamName]: {
      ...stats[teamName],
      [key]: stats[teamName][key] + 1,
    },
  };
}

function getLeader(stats: Record<string, TeamStats>, voteKey: keyof TeamStats) {
  return [...TEAMS].sort((a, b) => stats[b.name][voteKey] - stats[a.name][voteKey])[0];
}

function buildPayload({ name, email, team, voteType }: VotePayloadInput) {
  return {
    tournament: "Saikat Soccer League",
    name,
    email,
    team,
    voteType,
    submittedAt: new Date().toISOString(),
  };
}

async function saveToGoogleSheet(payload: VotePayloadInput) {
  if (!GOOGLE_SHEET_WEB_APP_URL || GOOGLE_SHEET_WEB_APP_URL.includes("PASTE_YOUR")) {
    console.warn("Google Sheet Web App URL is not configured yet.", payload);
    return;
  }

  await fetch(GOOGLE_SHEET_WEB_APP_URL, {
    method: "POST",
    mode: "no-cors",
    body: JSON.stringify(payload),
  });
}

function runSmokeTests() {
  const empty = createEmptyStats();
  const supportStats = addVote(empty, "Chomkaitola Sporting Club", "support");
  const finalStats = addVote(supportStats, "Old Monks™", "prediction");
  const totals = getTotals(finalStats);

  console.assert(TEAMS.length === 4, "There should be exactly four teams.");
  console.assert(isValidEmail("fan@example.com"), "Valid email should pass.");
  console.assert(!isValidEmail("fan-example"), "Invalid email should fail.");
  console.assert(totals.supportVotes === 1, "Support button should update support graph.");
  console.assert(totals.predictionVotes === 1, "Prediction button should update prediction graph.");
}

runSmokeTests();

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
  variant?: "primary" | "secondary";
};

function NativeButton({ children, onClick, disabled, variant = "primary" }: NativeButtonProps) {
  const base =
    "rounded-xl px-6 py-3 font-bold transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-50";
  const styles =
    variant === "primary"
      ? "bg-slate-900 text-white hover:bg-slate-800"
      : "border border-gray-300 bg-white text-gray-950 hover:bg-gray-50";

  return (
    <button type="button" onClick={onClick} disabled={disabled} className={`${base} ${styles}`}>
      {children}
    </button>
  );
}

type VoteButtonProps = {
  team: (typeof TEAMS)[number];
  selected: boolean;
  onClick: () => void;
};

function VoteButton({ team, selected, onClick }: VoteButtonProps) {
  return (
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
  );
}

export default function Page() {
  const [stats, setStats] = useState(createEmptyStats());
  const [votes, setVotes] = useState<VotePayloadInput[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [supportPick, setSupportPick] = useState("");
  const [predictionPick, setPredictionPick] = useState("");
  const [message, setMessage] = useState("");

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

  const validateUser = () => {
    if (!name.trim()) {
      setMessage("Please enter your name first.");
      return false;
    }
    if (!email.trim() || !isValidEmail(email)) {
      setMessage("Please enter a valid email address first.");
      return false;
    }
    return true;
  };

  const submitVote = (voteType: VoteType) => {
    if (!validateUser()) return;

    const selectedTeam = voteType === "support" ? supportPick : predictionPick;
    if (!selectedTeam) {
      setMessage(voteType === "support" ? "Please select your support team." : "Please select your prediction team.");
      return;
    }

    const payload = buildPayload({
      name: name.trim(),
      email: email.trim(),
      team: selectedTeam,
      voteType,
    });

    setStats((prev) => addVote(prev, selectedTeam, voteType));
    setVotes((prev) => [payload, ...prev]);

    if (voteType === "support") setSupportPick("");
    if (voteType === "prediction") setPredictionPick("");

    setMessage(
      voteType === "support"
        ? `Support vote counted for ${selectedTeam}.`
        : `Prediction vote counted for ${selectedTeam}.`
    );

    saveToGoogleSheet(payload).catch((error) => {
      console.error(error);
      setMessage("Vote counted locally, but Google Sheets save failed. Please check your Apps Script URL.");
    });
  };

  const resetLocalGraphs = () => {
    setStats(createEmptyStats());
    setVotes([]);
    setSupportPick("");
    setPredictionPick("");
    setMessage("Local graph data reset. Google Sheet data is not deleted.");
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
        </div>

        <Card className="mb-6 rounded-3xl shadow-xl">
          <CardContent className="p-6">
            <h2 className="mb-4 text-2xl font-semibold tracking-tight text-gray-900">Fan Details</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-bold text-gray-950">Your name *</label>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Enter your name"
                  className="w-full rounded-xl border border-gray-400 bg-white px-4 py-3 text-gray-950 placeholder:text-gray-500 outline-none focus:border-slate-900"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-bold text-gray-950">Your email *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Enter your email"
                  className="w-full rounded-xl border border-gray-400 bg-white px-4 py-3 text-gray-950 placeholder:text-gray-500 outline-none focus:border-slate-900"
                />
              </div>
            </div>
            <p className="mt-3 text-sm font-medium text-gray-700">Name and email are mandatory for both submit buttons.</p>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="rounded-3xl shadow-xl">
            <CardContent className="p-6">
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
              <div className="mt-5">
                <NativeButton onClick={() => submitVote("support")} disabled={!supportPick}>
                  Submit Support Vote
                </NativeButton>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl shadow-xl">
            <CardContent className="p-6">
              <h2 className="mb-4 text-2xl font-black text-gray-950">🏆 Your Prediction: Who will win?</h2>
              <div className="space-y-3">
                {TEAMS.map((team) => (
                  <VoteButton
                    key={`prediction-${team.name}`}
                    team={team}
                    selected={predictionPick === team.name}
                    onClick={() => setPredictionPick(team.name)}
                  />
                ))}
              </div>
              <div className="mt-5">
                <NativeButton onClick={() => submitVote("prediction")} disabled={!predictionPick}>
                  Submit Prediction Vote
                </NativeButton>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 flex justify-center">
          <NativeButton onClick={resetLocalGraphs} variant="secondary">
            Reset Local Graphs
          </NativeButton>
        </div>

        {message && <div className="mt-4 rounded-2xl bg-white p-4 text-center font-bold text-gray-950 shadow">{message}</div>}

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <Card className="rounded-3xl shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-gray-950">Prediction Graph</h2>
                  <p className="mt-1 text-sm font-medium text-gray-700">Who fans think will win.</p>
                </div>
                <div className="rounded-xl bg-gray-100 px-3 py-2 text-sm font-bold text-gray-950">Total: {totals.predictionVotes}</div>
              </div>

              {totals.predictionVotes === 0 ? (
                <div className="mt-4 flex h-72 items-center justify-center rounded-2xl bg-gray-50 text-center font-semibold text-gray-700">
                  No prediction votes yet. Submit a prediction vote to show the graph.
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
                <div className="rounded-xl bg-gray-100 px-3 py-2 text-sm font-bold text-gray-950">Total: {totals.supportVotes}</div>
              </div>

              {totals.supportVotes === 0 ? (
                <div className="mt-4 flex h-72 items-center justify-center rounded-2xl bg-gray-50 text-center font-semibold text-gray-700">
                  No support votes yet. Submit a support vote to show the graph.
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

        {votes.length > 0 && (
          <Card className="mt-8 rounded-3xl shadow-xl">
            <CardContent className="p-6">
              <h2 className="mb-4 text-xl font-black text-gray-950">Recent Local Votes</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-950">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="p-3">Name</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Vote Type</th>
                      <th className="p-3">Team</th>
                    </tr>
                  </thead>
                  <tbody>
                    {votes.map((vote, index) => (
                      <tr key={`${vote.email}-${vote.voteType}-${index}`} className="border-b">
                        <td className="p-3">{vote.name}</td>
                        <td className="p-3">{vote.email}</td>
                        <td className="p-3 capitalize">{vote.voteType}</td>
                        <td className="p-3">{vote.team}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
