import { useEffect, useRef, useState, useCallback } from "react";
import { io } from "socket.io-client";
import { getSocketUrl } from "../utils/apiBase";

export function useInterestChat(interestCommunityId, enabled = true) {
  const socketRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const [connected, setConnected] = useState(false);
  const typingTimeoutRef = useRef(null);

  const emitTyping = useCallback(
    (isTyping) => {
      if (!socketRef.current || !interestCommunityId) return;
      socketRef.current.emit("typing", { interestCommunityId, isTyping });
    },
    [interestCommunityId]
  );

  const sendMessage = useCallback(
    (text, replyToId = null) => {
      if (!socketRef.current || !interestCommunityId) return;
      socketRef.current.emit("send_message", { interestCommunityId, text, replyToId });
    },
    [interestCommunityId]
  );

  const editMessage = useCallback(
    (messageId, text) => {
      if (!socketRef.current || !interestCommunityId) return;
      socketRef.current.emit("edit_message", { interestCommunityId, messageId, text });
    },
    [interestCommunityId]
  );

  const deleteMessage = useCallback(
    (messageId) => {
      if (!socketRef.current || !interestCommunityId) return;
      socketRef.current.emit("delete_message", { interestCommunityId, messageId });
    },
    [interestCommunityId]
  );

  const handleTypingInput = useCallback(() => {
    emitTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => emitTyping(false), 1500);
  }, [emitTyping]);

  useEffect(() => {
    if (!enabled || !interestCommunityId) return undefined;

    const socket = io(getSocketUrl(), {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      socket.emit("join_interest_room", { interestCommunityId });
    });

    socket.on("disconnect", () => setConnected(false));

    socket.on("new_message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("message_edited", ({ messageId, text, editedAt }) => {
      setMessages((prev) =>
        prev.map((m) =>
          String(m._id) === String(messageId) ? { ...m, text, editedAt: editedAt || new Date() } : m
        )
      );
    });

    socket.on("message_deleted", ({ messageId, deletedAt }) => {
      setMessages((prev) =>
        prev.map((m) =>
          String(m._id) === String(messageId)
            ? { ...m, text: "", deletedAt: deletedAt || new Date() }
            : m
        )
      );
    });

    socket.on("presence_update", ({ users }) => {
      setOnlineUsers(users || []);
    });

    socket.on("user_typing", ({ userId, name, isTyping }) => {
      setTypingUsers((prev) => {
        const next = { ...prev };
        if (isTyping) next[userId] = name;
        else delete next[userId];
        return next;
      });
    });

    return () => {
      socket.emit("leave_interest_room");
      socket.disconnect();
      socketRef.current = null;
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [interestCommunityId, enabled]);

  return {
    messages,
    setMessages,
    onlineUsers,
    typingUsers,
    connected,
    sendMessage,
    editMessage,
    deleteMessage,
    handleTypingInput,
  };
}
