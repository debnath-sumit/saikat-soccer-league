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
  "https://script.google.com/macros/s/AKfycbxL78oIit8irEZ7-KAmj37wnDPjJUm1mxaXmwYdEJra-ZpV3ZubUYPSjqfddd0dqdIi/exec";

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
      "Jayanta",
      "Sushil",
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

function buildPayload({ name, supportTeam, winningTeam }: VotePayloadInput) {
  return {
    tournament: "Saikat Soccer League",
    name,
    supportTeam,
    winningTeam,
    submittedAt: new Date().toISOString(),
  };
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
};

function VoteButton({ team, selected, onClick }: VoteButtonProps) {
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

      <div className="absolute left-0 top-full z-[9999] mt-2 hidden w-full rounded-xl border border-gray-300 bg-white p-4 text-sm text-gray-950 shadow-2xl group-hover:block">
        <div className="mb-2 font-black">{team.name} Players</div>

        <div className="grid grid-cols-1 gap-1">
          {team.players.map((player) => (
            <div key={player}>• {player}</div>
          ))}
        </div>
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
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadVotesFromGoogleSheet()
      .then((data) => {
        setVotes(data.votes);
        setStats(data.stats);
      })
      .catch((error) => {
        console.error(error);
        setMessage("Unable to load current votes.");
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

  const submitVote = () => {
    if (!name.trim()) {
      setMessage("Please enter your name first.");
      return;
    }

    if (!supportPick) {
      setMessage("Please select the team you support.");
      return;
    }

    if (!predictionPick) {
      setMessage("Please select the team you think will win.");
      return;
    }

    const payload = buildPayload({
      name: name.trim(),
      supportTeam: supportPick,
      winningTeam: predictionPick,
    });

    setMessage("Saving vote...");

    saveToGoogleSheet(payload)
      .then(() => loadVotesFromGoogleSheet())
      .then((data) => {
        setVotes(data.votes);
        setStats(data.stats);
        setSupportPick("");
        setPredictionPick("");
        setMessage("Vote counted successfully.");
      })
      .catch((error) => {
        console.error(error);
        setMessage(error.message || "Vote save failed. May be the Name is already taken. Please try again with a different name.");
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
        </div>

        <Card className="mb-6 rounded-3xl shadow-xl">
          <CardContent className="p-6">
            <h2 className="mb-4 text-2xl font-semibold tracking-tight text-gray-900">Fan Details</h2>
            <label className="mb-1 block text-sm font-bold text-gray-950">Your name *</label>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Enter your name"
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
          <div className="mt-4 rounded-2xl bg-white p-4 text-center font-bold text-gray-950 shadow">
            {message}
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

        {votes.length > 0 && (
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
                    {votes.map((vote, index) => (
                      <tr key={`${vote.name}-${index}`} className="border-b">
                        <td className="p-3">{vote.name}</td>
                        <td className="p-3">{vote.supportTeam}</td>
                        <td className="p-3">{vote.winningTeam}</td>
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