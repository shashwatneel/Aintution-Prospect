import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Download, TrendingUp, Users, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import AI_LOGO from "@assets/AI_LOGO_1781758197757.png";
import { useGetAnalytics } from "@workspace/api-client-react";
import { useState } from "react";

const STATUS_COLORS = {
  not_send: { bg: "bg-gray-100", text: "text-gray-600", label: "Not Send" },
  send: { bg: "bg-blue-100", text: "text-blue-600", label: "Send" },
  accept: { bg: "bg-green-100", text: "text-green-600", label: "Accept" },
  reject: { bg: "bg-red-100", text: "text-red-600", label: "Reject" },
};

function StatBadge({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color: string }) {
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl ${color} backdrop-blur-sm`}>
      <Icon className="w-5 h-5 opacity-70" />
      <div>
        <p className="text-xs font-semibold opacity-70 uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-black">{value}</p>
      </div>
    </div>
  );
}

export default function Analytics() {
  const [, setLocation] = useLocation();
  const { data: analytics, isLoading } = useGetAnalytics();
  const [exporting, setExporting] = useState(false);

  function handleExportCsv() {
    setExporting(true);
    const link = document.createElement("a");
    link.href = "/api/analytics/export-csv";
    link.download = "aintution-prospects.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setExporting(false), 2000);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdfbfb] via-[#f0f4ff] to-[#fce4f5] relative overflow-hidden">
      {/* Floating blobs */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-blue-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 left-10 w-72 h-72 bg-pink-200/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top bar */}
      <div className="sticky top-0 z-50 px-4 pt-4 pb-2">
        <div className="max-w-6xl mx-auto glass-panel rounded-3xl px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLocation("/dashboard")}
              className="p-2 hover:bg-white/60 rounded-full transition-colors"
              data-testid="button-back-dashboard"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <img src={AI_LOGO} alt="Logo" className="w-8 h-8" />
            <h1 className="text-lg font-bold text-gradient hidden sm:block">Analytics</h1>
          </div>
          <button
            onClick={handleExportCsv}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-300/80 to-purple-300/80 hover:from-blue-400/80 hover:to-purple-400/80 text-white font-bold text-sm shadow-md transition-all hover:shadow-lg active:scale-95 disabled:opacity-60"
            data-testid="button-export-csv"
          >
            <Download className="w-4 h-4" />
            {exporting ? "Exporting..." : "Export CSV"}
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* All Cards Compact Overview */}
        {analytics && analytics.cards.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="gradient-border p-[2px] rounded-3xl"
          >
            <div className="glass-panel rounded-[1.4rem] p-6">
              <h2 className="text-2xl font-black text-gradient mb-4">All Cards Overview</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-gray-100">
                      <th className="text-left text-xs font-black text-gray-400 uppercase tracking-wider pb-3 pr-4">Card</th>
                      <th className="text-center text-xs font-black text-gray-400 uppercase tracking-wider pb-3 px-3">Total</th>
                      <th className="text-center text-xs font-black text-gray-400 uppercase tracking-wider pb-3 px-3">Not Send</th>
                      <th className="text-center text-xs font-black text-gray-400 uppercase tracking-wider pb-3 px-3">Sent</th>
                      <th className="text-center text-xs font-black text-gray-400 uppercase tracking-wider pb-3 px-3">Accept</th>
                      <th className="text-center text-xs font-black text-gray-400 uppercase tracking-wider pb-3 px-3">Reject</th>
                      <th className="text-center text-xs font-black text-gray-400 uppercase tracking-wider pb-3 px-3">Lead</th>
                      <th className="text-center text-xs font-black text-gray-400 uppercase tracking-wider pb-3 pl-3">Overdue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.cards.map((card, idx) => (
                      <tr
                        key={card.cardId}
                        className="border-b border-gray-50 hover:bg-blue-50/30 transition-colors cursor-pointer"
                        onClick={() => setLocation(`/cards/${card.cardId}`)}
                      >
                        <td className="py-3 pr-4">
                          <span className="font-bold text-gray-800 hover:text-blue-500 transition-colors">{card.cardName}</span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="text-blue-600 font-black text-base">{card.totalProspects}</span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-600`}>{card.statusCounts.not_send}</span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-600`}>{card.statusCounts.send}</span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-600`}>{card.statusCounts.accept}</span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-500`}>{card.statusCounts.reject}</span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-600`}>{card.leadDoneCount}</span>
                        </td>
                        <td className="py-3 pl-3 text-center">
                          {card.overdueCount > 0 ? (
                            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-600">{card.overdueCount}</span>
                          ) : (
                            <span className="text-gray-300 text-xs">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* Global Summary */}
        {analytics && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="gradient-border p-[2px] rounded-3xl"
          >
            <div className="glass-panel rounded-[1.4rem] p-6">
              <h2 className="text-2xl font-black text-gradient mb-5">Global Summary</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <StatBadge icon={Users} label="Total Prospects" value={analytics.totalProspects} color="bg-blue-50 text-blue-700" />
                <StatBadge icon={CheckCircle} label="Accepted" value={analytics.totalAccepted} color="bg-green-50 text-green-700" />
                <StatBadge icon={XCircle} label="Rejected" value={analytics.totalRejected} color="bg-red-50 text-red-700" />
              </div>
            </div>
          </motion.div>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-500 animate-spin" />
          </div>
        )}

        {/* Per-Card Analytics */}
        {analytics?.cards.map((card, idx) => (
          <motion.div
            key={card.cardId}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="gradient-border p-[2px] rounded-3xl"
          >
            <div className="glass-panel rounded-[1.4rem] p-6 space-y-5">
              {/* Card header */}
              <div className="flex items-center justify-between flex-wrap gap-3">
                <h3
                  className="text-xl font-black text-gradient cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => setLocation(`/cards/${card.cardId}`)}
                  data-testid={`text-card-name-${card.cardId}`}
                >
                  {card.cardName}
                </h3>
                <div className="flex items-center gap-2">
                  {card.overdueCount > 0 && (
                    <span className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-600 rounded-full text-xs font-bold">
                      <AlertCircle className="w-3 h-3" /> {card.overdueCount} overdue
                    </span>
                  )}
                  {card.dueTodayCount > 0 && (
                    <span className="flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">
                      <Clock className="w-3 h-3" /> {card.dueTodayCount} due today
                    </span>
                  )}
                </div>
              </div>

              {/* Total + Lead */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-4 text-center">
                  <p className="text-3xl font-black text-blue-600">{card.totalProspects}</p>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mt-1">Total</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 text-center">
                  <p className="text-3xl font-black text-green-600">{card.leadDoneCount}</p>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mt-1">Lead Done</p>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4 text-center">
                  <p className="text-3xl font-black text-amber-600">{card.overdueCount}</p>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mt-1">Overdue</p>
                </div>
                <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-4 text-center">
                  <p className="text-3xl font-black text-pink-600">{card.dueTodayCount}</p>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mt-1">Due Today</p>
                </div>
              </div>

              {/* Status Breakdown */}
              <div>
                <p className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">Status Breakdown</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(Object.entries(STATUS_COLORS) as [keyof typeof STATUS_COLORS, { bg: string; text: string; label: string }][]).map(([key, val]) => (
                    <div key={key} className={`${val.bg} ${val.text} rounded-2xl p-3 text-center`}>
                      <p className="text-2xl font-black">{card.statusCounts[key]}</p>
                      <p className="text-xs font-semibold uppercase tracking-wide mt-1">{val.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Message Completion */}
              {card.messageCounts.length > 0 && (
                <div>
                  <p className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">Message Completion</p>
                  <div className="space-y-2">
                    {card.messageCounts.map((msg) => {
                      const pct = card.totalProspects > 0 ? Math.round((msg.doneCount / card.totalProspects) * 100) : 0;
                      return (
                        <div key={msg.messageId} className="flex items-center gap-3" data-testid={`msg-completion-${msg.messageId}`}>
                          <p className="text-sm font-semibold text-gray-700 w-36 shrink-0 truncate">{msg.label}</p>
                          <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-blue-300 to-purple-300 transition-all duration-700"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <p className="text-sm font-bold text-gray-600 w-20 text-right shrink-0">
                            {msg.doneCount}/{card.totalProspects}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ))}

        {analytics?.cards.length === 0 && !isLoading && (
          <div className="text-center py-20 text-gray-400">
            <TrendingUp className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-xl font-bold">No data yet</p>
            <p className="text-sm mt-2">Create cards and add prospects to see analytics</p>
          </div>
        )}
      </div>
    </div>
  );
}
