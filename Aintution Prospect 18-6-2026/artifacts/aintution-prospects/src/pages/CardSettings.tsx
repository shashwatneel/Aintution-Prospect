import { useLocation, useRoute } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react";
import AI_LOGO from "@assets/AI_LOGO_1781758197757.png";
import { useGetCard, useListMessages, useUpdateCard, useCreateMessage, useUpdateMessage, useDeleteMessage, getGetCardQueryKey, getListMessagesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function CardSettings() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/cards/:cardId/settings");
  const cardId = Number(params?.cardId);
  const queryClient = useQueryClient();

  const { data: card } = useGetCard(cardId, { query: { enabled: !!cardId, queryKey: getGetCardQueryKey(cardId) } });
  const { data: messages = [] } = useListMessages(cardId, { query: { enabled: !!cardId, queryKey: getListMessagesQueryKey(cardId) } });

  const updateCard = useUpdateCard();
  const createMessage = useCreateMessage();
  const updateMessage = useUpdateMessage();
  const deleteMessage = useDeleteMessage();

  const [cardName, setCardName] = useState("");
  const [cardImageUrl, setCardImageUrl] = useState("");
  const [msgContents, setMsgContents] = useState<Record<number, string>>({});
  const [msgDays, setMsgDays] = useState<Record<number, string>>({});
  const [savingCard, setSavingCard] = useState(false);

  useEffect(() => {
    if (card) {
      setCardName(card.name);
      setCardImageUrl(card.imageUrl ?? "");
    }
  }, [card]);

  useEffect(() => {
    const contentMap: Record<number, string> = {};
    const daysMap: Record<number, string> = {};
    messages.forEach((m) => {
      contentMap[m.id] = m.content;
      daysMap[m.id] = m.daysFromPrev != null ? String(m.daysFromPrev) : "";
    });
    setMsgContents(contentMap);
    setMsgDays(daysMap);
  }, [messages]);

  async function handleSaveCard() {
    setSavingCard(true);
    try {
      await updateCard.mutateAsync({ cardId, data: { name: cardName, imageUrl: cardImageUrl || null } });
      queryClient.invalidateQueries({ queryKey: getGetCardQueryKey(cardId) });
      toast.success("Card updated!");
    } catch {
      toast.error("Failed to save card");
    } finally {
      setSavingCard(false);
    }
  }

  async function handleSaveMessage(msgId: number, isDefault: boolean) {
    try {
      const updateData: { content?: string; daysFromPrev?: number | null } = {
        content: msgContents[msgId] ?? "",
      };
      if (!isDefault) {
        const days = msgDays[msgId];
        updateData.daysFromPrev = days ? Number(days) : null;
      }
      await updateMessage.mutateAsync({ cardId, messageId: msgId, data: updateData });
      queryClient.invalidateQueries({ queryKey: getListMessagesQueryKey(cardId) });
      toast.success("Message saved!");
    } catch {
      toast.error("Failed to save message");
    }
  }

  async function handleAddMessage() {
    try {
      await createMessage.mutateAsync({ cardId, data: { label: "", content: "", daysFromPrev: null } });
      queryClient.invalidateQueries({ queryKey: getListMessagesQueryKey(cardId) });
      toast.success("Message added!");
    } catch {
      toast.error("Failed to add message");
    }
  }

  async function handleDeleteMessage(msgId: number) {
    try {
      await deleteMessage.mutateAsync({ cardId, messageId: msgId });
      queryClient.invalidateQueries({ queryKey: getListMessagesQueryKey(cardId) });
      toast.success("Message deleted");
    } catch {
      toast.error("Failed to delete message");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdfbfb] via-[#f0f4ff] to-[#fce4f5] relative overflow-hidden">
      <div className="absolute top-20 right-10 w-60 h-60 bg-lavender-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 left-10 w-60 h-60 bg-pink-200/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top bar */}
      <div className="sticky top-0 z-50 px-4 pt-4 pb-2">
        <div className="max-w-3xl mx-auto glass-panel rounded-3xl px-5 py-3 flex items-center gap-3">
          <button
            onClick={() => setLocation(`/cards/${cardId}`)}
            className="p-2 hover:bg-white/60 rounded-full transition-colors"
            data-testid="button-back-card"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <img src={AI_LOGO} alt="Logo" className="w-8 h-8" />
          <h1 className="text-lg font-bold text-gradient">Settings — {card?.name}</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Card details */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="gradient-border p-[2px] rounded-3xl">
          <div className="glass-panel rounded-[1.4rem] p-6 space-y-4">
            <h2 className="text-xl font-black text-gradient">Card Details</h2>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-600">Card Name</label>
              <input
                type="text"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-white/60 border border-white/80 focus:outline-none focus:ring-2 focus:ring-blue-200 font-semibold text-gray-800 transition-all"
                placeholder="Enter card name"
                data-testid="input-card-name"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-600">Image URL</label>
              <input
                type="url"
                value={cardImageUrl}
                onChange={(e) => setCardImageUrl(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-white/60 border border-white/80 focus:outline-none focus:ring-2 focus:ring-blue-200 font-semibold text-gray-800 transition-all"
                placeholder="https://example.com/image.jpg"
                data-testid="input-card-image-url"
              />
              {cardImageUrl && (
                <img src={cardImageUrl} alt="Preview" className="w-full h-32 object-cover rounded-xl mt-2" onError={(e) => ((e.target as HTMLImageElement).style.display = "none")} />
              )}
            </div>

            <button
              onClick={handleSaveCard}
              disabled={savingCard}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-300 to-purple-300 hover:opacity-90 text-white font-bold shadow-md transition-all active:scale-95 disabled:opacity-60"
              data-testid="button-save-card"
            >
              <Save className="w-4 h-4" />
              {savingCard ? "Saving..." : "Save Card"}
            </button>
          </div>
        </motion.div>

        {/* Message Templates */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="text-xl font-black text-gradient">Message Templates</h2>
            <button
              onClick={handleAddMessage}
              disabled={createMessage.isPending}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-pink-300 to-lavender-300 hover:opacity-90 text-white font-bold text-sm shadow-md transition-all active:scale-95 disabled:opacity-60"
              data-testid="button-add-message"
            >
              <Plus className="w-4 h-4" />
              Add Message
            </button>
          </div>

          <div className="space-y-4">
            {messages.map((msg, idx) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="gradient-border p-[2px] rounded-3xl"
              >
                <div className="glass-panel rounded-[1.4rem] p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-black text-gray-700">{msg.label}</span>
                    {!msg.isDefault && (
                      <button
                        onClick={() => handleDeleteMessage(msg.id)}
                        className="p-1.5 hover:bg-red-50 rounded-full text-red-400 hover:text-red-600 transition-colors"
                        data-testid={`button-delete-message-${msg.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {!msg.isDefault && (
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Days from previous message</label>
                      <input
                        type="number"
                        min="1"
                        value={msgDays[msg.id] ?? ""}
                        onChange={(e) => setMsgDays((prev) => ({ ...prev, [msg.id]: e.target.value }))}
                        className="w-24 px-3 py-2 rounded-xl bg-white/60 border border-white/80 focus:outline-none focus:ring-2 focus:ring-blue-200 font-semibold text-gray-800 text-sm"
                        placeholder="e.g. 30"
                        data-testid={`input-days-${msg.id}`}
                      />
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">
                      Message content — use #name for first name
                    </label>
                    <textarea
                      value={msgContents[msg.id] ?? ""}
                      onChange={(e) => setMsgContents((prev) => ({ ...prev, [msg.id]: e.target.value }))}
                      rows={4}
                      className="w-full px-4 py-3 rounded-2xl bg-white/60 border border-white/80 focus:outline-none focus:ring-2 focus:ring-blue-200 font-medium text-gray-800 text-sm resize-y transition-all"
                      placeholder={msg.isDefault ? "Good Morning #name" : "Write your message here, use #name for first name"}
                      data-testid={`textarea-content-${msg.id}`}
                    />
                  </div>

                  <button
                    onClick={() => handleSaveMessage(msg.id, msg.isDefault)}
                    disabled={updateMessage.isPending}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-200 to-purple-200 hover:opacity-90 text-blue-800 font-bold text-sm shadow-sm transition-all active:scale-95 disabled:opacity-60"
                    data-testid={`button-save-message-${msg.id}`}
                  >
                    <Save className="w-3.5 h-3.5" />
                    Save
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
