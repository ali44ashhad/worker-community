import React, { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { ArrowLeft, Circle, Pencil, Reply, Send, Trash2, Users } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { getApiBase } from '../../utils/apiBase';
import { getFullName } from '../../utils/userHelpers';
import { useInterestChat } from '../../hooks/useInterestChat';
import { formatCommunDisplayName } from '../../utils/communName';
import { fetchInterestCommunities } from '../../features/interestCommunitySlice';

const API_URL = getApiBase() || 'http://localhost:3000';

const InterestCommunityChat = ({ listPath = '/interest-communities' }) => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const reduxCommunities = useSelector((s) => s.interestCommunity.communities);
  const [communityName, setCommunityName] = useState('');
  const [communLabel, setCommunLabel] = useState('');
  const [members, setMembers] = useState([]);
  const [replyTo, setReplyTo] = useState(null);
  const [editing, setEditing] = useState(null);
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);

  const {
    messages,
    setMessages,
    onlineUsers,
    typingUsers,
    connected,
    sendMessage,
    editMessage,
    deleteMessage,
    handleTypingInput,
  } = useInterestChat(id, Boolean(id));

  useEffect(() => {
    if (!reduxCommunities.length) dispatch(fetchInterestCommunities());
  }, [dispatch, reduxCommunities.length]);

  useEffect(() => {
    const c = reduxCommunities.find((x) => String(x._id) === String(id));
    if (c?.name) setCommunityName(c.name);
  }, [reduxCommunities, id]);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const [msgRes, memberRes, listRes] = await Promise.all([
          axios.get(`${API_URL}/api/interest-communities/${id}/messages`, {
            withCredentials: true,
          }),
          axios.get(`${API_URL}/api/interest-communities/${id}/members`, {
            withCredentials: true,
          }),
          axios.get(`${API_URL}/api/interest-communities`, { withCredentials: true }),
        ]);
        setMessages(msgRes.data?.data?.messages || []);
        const cn = memberRes.data?.data?.communName;
        setCommunLabel(memberRes.data?.data?.communLabel || formatCommunDisplayName(cn));
        setMembers(memberRes.data?.data?.members || []);
        const found = (listRes.data?.data?.communities || []).find(
          (x) => String(x._id) === String(id)
        );
        if (found?.name) setCommunityName(found.name);
      } catch {
        /* access denied if not joined */
      }
    };
    load();
  }, [id, setMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUsers]);

  const handleSend = (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    if (editing?._id) {
      editMessage(editing._id, text);
      setEditing(null);
      setReplyTo(null);
    } else {
      sendMessage(text, replyTo?._id || null);
      setReplyTo(null);
    }
    setInput('');
  };

  const otherTyping = Object.entries(typingUsers).filter(
    ([userId]) => String(userId) !== String(user?._id)
  );
  const typingText =
    otherTyping.length === 1
      ? `${otherTyping[0][1]} is typing…`
      : otherTyping.length > 1
        ? `${otherTyping.length} people are typing…`
        : '';

  const isOnline = (userId) => onlineUsers.some((u) => String(u.userId) === String(userId));
  const othersOnline = onlineUsers.filter((u) => String(u.userId) !== String(user?._id));

  const getMsgAuthorName = (msg) => {
    if (!msg) return '';
    const mine = String(msg.author?._id) === String(user?._id);
    return mine ? 'You' : getFullName(msg.author);
  };

  const resolveReplyPreview = (msg) => {
    const r = msg?.replyTo;
    if (!r) return null;
    const name = r.author ? getFullName(r.author) : 'Unknown';
    const deleted = Boolean(r.deletedAt);
    const text = deleted ? 'Message deleted' : String(r.text || '');
    return { name, text };
  };

  return (
    <motion.div
      className="flex min-h-screen flex-col bg-[var(--background-subtle)]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <header className="sticky top-0 z-10 border-b border-purple-100/60 bg-white/95 px-4 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <Link
            to={listPath}
            className="rounded-xl border border-purple-100 p-2 text-[var(--purple-primary)] hover:bg-purple-50"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-semibold text-[var(--text-primary)]">
              {communityName || 'Community Chat'}
            </h1>
            <p className="truncate text-xs text-[var(--text-secondary)]">
              {communLabel ? `${communLabel} members only` : 'Your Commun members only'}
              {connected ? (
                <span className="ml-2 text-emerald-600">
                  · {othersOnline.length} online
                </span>
              ) : (
                <span className="ml-2 text-amber-600">· connecting…</span>
              )}
            </p>
          </div>
        </div>
      </header>

      {members.length > 0 && (
        <aside className="border-b border-purple-100/40 bg-white/60 px-4 py-3">
          <div className="mx-auto max-w-3xl">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-[var(--text-secondary)]">
              <Users className="h-3.5 w-3.5" />
              Members from your Commun ({members.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {members.map((m) => {
                const mine = String(m._id) === String(user?._id);
                const online = isOnline(m._id);
                const typing = typingUsers[m._id] && !mine;
                return (
                  <div
                    key={m._id}
                    className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${
                      online
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                        : 'border-purple-100 bg-purple-50/50 text-[var(--text-primary)]'
                    }`}
                  >
                    {online && (
                      <Circle className="h-2 w-2 shrink-0 fill-emerald-500 text-emerald-500" />
                    )}
                    <span className="max-w-[120px] truncate">
                      {mine ? 'You' : getFullName(m)}
                    </span>
                    {typing && (
                      <span className="text-[10px] italic text-[var(--purple-primary)]">
                        typing…
                      </span>
                    )}
                    {online && !typing && !mine && (
                      <span className="text-[10px] text-emerald-600">online</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </aside>
      )}

      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-4">
        <div className="min-h-[50vh] flex-1 space-y-3 overflow-y-auto rounded-2xl border border-purple-100/50 bg-white/80 p-4">
          {messages.length === 0 && (
            <p className="text-center text-sm text-[var(--text-secondary)]">
              No messages yet. Say hello to your neighbours!
            </p>
          )}
          {messages.map((msg) => {
            const mine = String(msg.author?._id) === String(user?._id);
            const isDeleted = Boolean(msg.deletedAt);
            const replyPreview = resolveReplyPreview(msg);
            return (
              <div
                key={msg._id}
                className={`flex ${mine ? 'justify-end' : 'justify-start'}`}
                onTouchStart={(e) => {
                  const t = e.touches?.[0];
                  if (!t) return;
                  e.currentTarget.dataset.sx = String(t.clientX);
                  e.currentTarget.dataset.did = '0';
                }}
                onTouchMove={(e) => {
                  const t = e.touches?.[0];
                  const sx = parseFloat(e.currentTarget.dataset.sx || '0');
                  if (!t || !sx) return;
                  if (t.clientX - sx > 60) e.currentTarget.dataset.did = '1';
                }}
                onTouchEnd={(e) => {
                  if (e.currentTarget.dataset.did === '1') {
                    setEditing(null);
                    setReplyTo({
                      _id: msg._id,
                      text: isDeleted ? '' : msg.text,
                      author: msg.author,
                      deletedAt: msg.deletedAt || null,
                    });
                    setInput('');
                  }
                }}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm ${
                    mine
                      ? 'bg-gradient-to-r from-[var(--purple-primary)] to-[var(--magenta)] text-white'
                      : 'border border-purple-100 bg-purple-50/50 text-[var(--text-primary)]'
                  }`}
                >
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold opacity-80">
                      {mine ? 'You' : getFullName(msg.author)}
                      {!mine && isOnline(msg.author?._id) && (
                        <span className="ml-1 text-[10px] text-emerald-600">online</span>
                      )}
                    </p>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEditing(null);
                          setReplyTo({
                            _id: msg._id,
                            text: isDeleted ? '' : msg.text,
                            author: msg.author,
                            deletedAt: msg.deletedAt || null,
                          });
                          setInput('');
                        }}
                        className={`rounded-lg p-1 ${mine ? 'text-white/80 hover:bg-white/10' : 'text-[var(--purple-primary)] hover:bg-purple-100/60'}`}
                        title="Reply"
                      >
                        <Reply className="h-3.5 w-3.5" />
                      </button>
                      {mine && !isDeleted && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setReplyTo(null);
                              setEditing({ _id: msg._id, text: msg.text });
                              setInput(msg.text || '');
                            }}
                            className="rounded-lg p-1 text-white/80 hover:bg-white/10"
                            title="Edit"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteMessage(msg._id)}
                            className="rounded-lg p-1 text-white/80 hover:bg-white/10"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {replyPreview && (
                    <div
                      className={`mb-2 rounded-xl border px-3 py-2 text-xs ${
                        mine ? 'border-white/20 bg-white/10 text-white/90' : 'border-purple-100 bg-white/70'
                      }`}
                    >
                      <p className={`font-semibold ${mine ? 'text-white/90' : 'text-[var(--purple-primary)]'}`}>
                        {replyPreview.name}
                      </p>
                      <p className={`mt-0.5 line-clamp-2 ${mine ? 'text-white/80' : 'text-[var(--text-secondary)]'}`}>
                        {replyPreview.text}
                      </p>
                    </div>
                  )}

                  {isDeleted ? (
                    <p className="italic opacity-80">This message was deleted</p>
                  ) : (
                    <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                  )}
                  <p
                    className={`mt-1 text-[10px] ${mine ? 'text-white/70' : 'text-[var(--text-secondary)]'}`}
                  >
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                    {msg.editedAt && !isDeleted ? <span className="ml-1">(edited)</span> : null}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {typingText && (
          <p className="mt-2 px-1 text-xs italic text-[var(--text-secondary)]">{typingText}</p>
        )}

        {(replyTo || editing) && (
          <div className="mt-3 rounded-2xl border border-purple-100 bg-white/80 px-4 py-3 text-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[var(--purple-primary)]">
                  {editing ? 'Editing message' : `Replying to ${getMsgAuthorName(replyTo)}`}
                </p>
                <p className="mt-0.5 line-clamp-2 text-xs text-[var(--text-secondary)]">
                  {editing ? editing.text : replyTo?.deletedAt ? 'Message deleted' : replyTo?.text}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setReplyTo(null);
                  setEditing(null);
                  setInput('');
                }}
                className="shrink-0 rounded-xl border border-purple-100 px-3 py-1.5 text-xs font-semibold text-[var(--purple-primary)] hover:bg-purple-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSend} className="mt-3 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              handleTypingInput();
            }}
            placeholder="Type a message…"
            className="flex-1 rounded-xl border border-purple-100 px-4 py-3 text-sm focus:border-[var(--purple-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--purple-primary)]/20"
            maxLength={2000}
          />
          <button
            type="submit"
            disabled={!input.trim() || !connected}
            className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-[var(--purple-primary)] to-[var(--magenta)] text-white disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </motion.div>
  );
};

export default InterestCommunityChat;
