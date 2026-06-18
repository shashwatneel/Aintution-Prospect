import { useState } from "react";
import { useLocation } from "wouter";
import AI_LOGO from "@assets/AI_LOGO_1781758197757.png";
import INSIGHTS_IMG from "@assets/Client_Find_insitfulls_1781758262455.png";
import { LogOut, Plus, X, Image } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useListCards, useCreateCard, getListCardsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { data: cards = [], isLoading } = useListCards();
  const createCard = useCreateCard();

  const [showNewCard, setShowNewCard] = useState(false);
  const [newName, setNewName] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [creating, setCreating] = useState(false);

  async function handleCreateCard(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    try {
      await createCard.mutateAsync({ data: { name: newName.trim(), imageUrl: newImageUrl.trim() || null } });
      queryClient.invalidateQueries({ queryKey: getListCardsQueryKey() });
      setNewName("");
      setNewImageUrl("");
      setShowNewCard(false);
      toast.success("Card created!");
    } catch {
      toast.error("Failed to create card");
    } finally {
      setCreating(false);
    }
  }

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen dot-bg p-6 font-sans relative overflow-hidden">

      {/* Top Bar */}
      <div className="flex justify-between items-center mb-8 glass-panel p-4 rounded-3xl sticky top-4 z-50">
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => setLocation("/")}>
          <img src={AI_LOGO} alt="Logo" className="w-13 h-13" />
          <h1 className="text-xl font-bold text-shimmer hidden sm:block">Aintution Prospects</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-sm font-semibold text-gray-500 bg-white/50 px-4 py-2 rounded-full">
            {user?.username}
          </div>
          <button
            onClick={() => logout().then(() => setLocation("/"))}
            className="p-2.5 hover:bg-red-50 rounded-full transition-colors text-red-400 hover:text-red-600"
            title="Sign out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-10 relative z-10">
        {/* Analytics Hero — taller so full image is visible */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="cursor-pointer group"
          onClick={() => setLocation("/analytics")}
        >
          <div className="gradient-border p-1 rounded-[2rem] shadow-xl group-hover:shadow-2xl transition-all duration-300">
            <div className="glass-panel rounded-[1.8rem] overflow-hidden relative">
              <img
                src={INSIGHTS_IMG}
                alt="Analytics"
                className="w-full object-contain group-hover:scale-[1.02] transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent flex items-end p-8 pointer-events-none">
                <h2 className="text-3xl font-bold text-white drop-shadow-md">View Analytics Dashboard</h2>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Cards Grid — max 2 per row, bigger cards */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6 px-2">Your Cards</h2>
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {isLoading ? (
              [1, 2].map((i) => (
                <div key={i} className="h-64 rounded-3xl bg-white/40 animate-pulse" />
              ))
            ) : (
              cards.map((card) => (
                <motion.div key={card.id} variants={item} className="group cursor-pointer" onClick={() => setLocation(`/cards/${card.id}`)}>
                  <div className="gradient-border p-[2px] rounded-3xl h-full shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1">
                    <div className="glass-panel rounded-[1.4rem] overflow-hidden h-full">
                      {card.imageUrl ? (
                        <img
                          src={card.imageUrl}
                          alt={card.name}
                          className="w-full h-full min-h-[280px] object-contain md:object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                      ) : (
                        <div className="w-full min-h-[280px] bg-gradient-to-br from-blue-100 to-pink-100 flex flex-col items-center justify-center gap-3">
                          <Image className="w-14 h-14 text-blue-300" />
                          <span className="text-sm font-bold text-blue-400">{card.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}

            {/* New Card tile */}
            <motion.div variants={item} className="group cursor-pointer" onClick={() => setShowNewCard(true)}>
              <div className="border-2 border-dashed border-gray-300 hover:border-blue-400 rounded-3xl h-full flex items-center justify-center p-10 bg-white/20 hover:bg-white/40 transition-all duration-300 min-h-[260px] group-hover:-translate-y-1">
                <div className="flex flex-col items-center gap-4 text-gray-400 group-hover:text-blue-500 transition-colors">
                  <div className="p-5 bg-white rounded-full shadow-sm">
                    <Plus className="w-10 h-10" />
                  </div>
                  <span className="font-bold text-xl">Create New Card</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* New Card Modal */}
      <AnimatePresence>
        {showNewCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-sm px-4"
            onClick={(e) => { if (e.target === e.currentTarget) setShowNewCard(false); }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-md"
            >
              <div className="gradient-border p-[2px] rounded-3xl shadow-2xl">
                <div className="glass-panel rounded-[1.4rem] p-6 space-y-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black text-gradient">New Card</h3>
                    <button onClick={() => setShowNewCard(false)} className="p-2 hover:bg-white/60 rounded-full transition-colors">
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                  <form onSubmit={handleCreateCard} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Card Name</label>
                      <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="e.g. Tech Startup Founders"
                        required
                        autoFocus
                        className="w-full px-4 py-3 rounded-2xl bg-white/70 border border-white/80 focus:outline-none focus:ring-2 focus:ring-blue-200 font-semibold text-gray-800 placeholder-gray-300"
                        data-testid="input-new-card-name"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Image URL (optional)</label>
                      <input
                        type="url"
                        value={newImageUrl}
                        onChange={(e) => setNewImageUrl(e.target.value)}
                        placeholder="https://example.com/photo.jpg"
                        className="w-full px-4 py-3 rounded-2xl bg-white/70 border border-white/80 focus:outline-none focus:ring-2 focus:ring-blue-200 font-medium text-gray-800 placeholder-gray-300"
                        data-testid="input-new-card-image"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={creating || !newName.trim()}
                      className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-300 to-purple-300 hover:opacity-90 text-white font-black shadow-md transition-all active:scale-95 disabled:opacity-60"
                      data-testid="button-create-card"
                    >
                      {creating ? "Creating..." : "Create Card"}
                    </button>
                  </form>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
