import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import InterestCommunity from "../models/interestCommunity.model.js";
import InterestCommunityMembership from "../models/interestCommunityMembership.model.js";
import InterestChatMessage from "../models/interestChatMessage.model.js";
import { buildChatRoomId, getMemberCommunName } from "../utils/memberCommun.js";

const roomPresence = new Map();
const roomTyping = new Map();

function getPresenceList(roomId) {
    const set = roomPresence.get(roomId);
    if (!set) return [];
    return Array.from(set.values());
}

function addPresence(roomId, userInfo) {
    if (!roomPresence.has(roomId)) roomPresence.set(roomId, new Map());
    roomPresence.get(roomId).set(String(userInfo.userId), userInfo);
}

function removePresence(roomId, userId) {
    const map = roomPresence.get(roomId);
    if (!map) return;
    map.delete(String(userId));
    if (map.size === 0) roomPresence.delete(roomId);
}

function getJwtFromCookieHeader(cookieHeader) {
    const match = String(cookieHeader || "").match(/(?:^|;\s*)jwt=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : null;
}

async function authenticateSocket(socket) {
    const token = getJwtFromCookieHeader(socket.handshake.headers.cookie);
    if (!token) throw new Error("Unauthorized");

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");
    if (!user || user.isActive === false) throw new Error("Unauthorized");
    return user;
}

export function initChatSocket(io) {
    io.use(async (socket, next) => {
        try {
            socket.user = await authenticateSocket(socket);
            next();
        } catch (err) {
            next(new Error("Unauthorized"));
        }
    });

    io.on("connection", (socket) => {
        const user = socket.user;
        const communName = getMemberCommunName(user);
        socket.communName = communName;
        socket.activeRoomId = null;

        socket.on("join_interest_room", async ({ interestCommunityId }) => {
            try {
                if (!communName) {
                    socket.emit("chat_error", { message: "Commun name required." });
                    return;
                }

                const membership = await InterestCommunityMembership.findOne({
                    user: user._id,
                    interestCommunity: interestCommunityId,
                });
                if (!membership) {
                    socket.emit("chat_error", { message: "Join this community first." });
                    return;
                }

                const community = await InterestCommunity.findOne({
                    _id: interestCommunityId,
                    isActive: true,
                });
                if (!community) {
                    socket.emit("chat_error", { message: "Community not found." });
                    return;
                }

                if (socket.activeRoomId) {
                    socket.leave(socket.activeRoomId);
                    removePresence(socket.activeRoomId, user._id);
                    io.to(socket.activeRoomId).emit("presence_update", {
                        roomId: socket.activeRoomId,
                        users: getPresenceList(socket.activeRoomId),
                    });
                }

                const roomId = buildChatRoomId(interestCommunityId, communName);
                socket.activeRoomId = roomId;
                socket.join(roomId);

                const userInfo = {
                    userId: String(user._id),
                    firstName: user.firstName,
                    lastName: user.lastName,
                    profileImage: user.profileImage || "",
                    role: user.role,
                };
                addPresence(roomId, userInfo);

                io.to(roomId).emit("presence_update", {
                    roomId,
                    users: getPresenceList(roomId),
                });

                socket.emit("room_joined", {
                    roomId,
                    communityName: community.name,
                    communName,
                });
            } catch (err) {
                socket.emit("chat_error", { message: err.message || "Failed to join room." });
            }
        });

        socket.on("send_message", async ({ interestCommunityId, text, replyToId }) => {
            try {
                const messageText = String(text || "").trim();
                if (!messageText) return;

                const roomId = buildChatRoomId(interestCommunityId, communName);
                const membership = await InterestCommunityMembership.findOne({
                    user: user._id,
                    interestCommunity: interestCommunityId,
                });
                if (!membership) return;

                const saved = await InterestChatMessage.create({
                    interestCommunity: interestCommunityId,
                    communName,
                    author: user._id,
                    text: messageText,
                    replyTo: replyToId || null,
                });

                const replyDoc = replyToId
                    ? await InterestChatMessage.findOne({
                        _id: replyToId,
                        interestCommunity: interestCommunityId,
                        communName,
                    })
                        .populate("author", "firstName lastName profileImage")
                        .lean()
                    : null;

                const payload = {
                    _id: saved._id,
                    text: saved.text,
                    createdAt: saved.createdAt,
                    editedAt: saved.editedAt || null,
                    deletedAt: saved.deletedAt || null,
                    replyTo: replyDoc
                        ? {
                            _id: replyDoc._id,
                            text: replyDoc.deletedAt ? "" : replyDoc.text,
                            deletedAt: replyDoc.deletedAt || null,
                            author: replyDoc.author
                                ? {
                                    _id: replyDoc.author._id,
                                    firstName: replyDoc.author.firstName,
                                    lastName: replyDoc.author.lastName,
                                    profileImage: replyDoc.author.profileImage || "",
                                }
                                : null,
                        }
                        : null,
                    author: {
                        _id: user._id,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        profileImage: user.profileImage || "",
                    },
                };

                io.to(roomId).emit("new_message", payload);
            } catch (err) {
                socket.emit("chat_error", { message: "Failed to send message." });
            }
        });

        socket.on("edit_message", async ({ interestCommunityId, messageId, text }) => {
            try {
                const messageText = String(text || "").trim();
                if (!messageText) return;

                const roomId = buildChatRoomId(interestCommunityId, communName);
                const msg = await InterestChatMessage.findOne({
                    _id: messageId,
                    interestCommunity: interestCommunityId,
                    communName,
                    author: user._id,
                });
                if (!msg || msg.deletedAt) return;

                msg.text = messageText;
                msg.editedAt = new Date();
                await msg.save();

                io.to(roomId).emit("message_edited", {
                    messageId: String(msg._id),
                    text: msg.text,
                    editedAt: msg.editedAt,
                });
            } catch {
                socket.emit("chat_error", { message: "Failed to edit message." });
            }
        });

        socket.on("delete_message", async ({ interestCommunityId, messageId }) => {
            try {
                const roomId = buildChatRoomId(interestCommunityId, communName);
                const msg = await InterestChatMessage.findOne({
                    _id: messageId,
                    interestCommunity: interestCommunityId,
                    communName,
                    author: user._id,
                });
                if (!msg || msg.deletedAt) return;

                msg.deletedAt = new Date();
                msg.text = "";
                await msg.save();

                io.to(roomId).emit("message_deleted", {
                    messageId: String(msg._id),
                    deletedAt: msg.deletedAt,
                });
            } catch {
                socket.emit("chat_error", { message: "Failed to delete message." });
            }
        });

        socket.on("typing", ({ interestCommunityId, isTyping }) => {
            if (!communName) return;
            const roomId = buildChatRoomId(interestCommunityId, communName);
            const key = `${roomId}:${user._id}`;

            if (isTyping) {
                if (!roomTyping.has(roomId)) roomTyping.set(roomId, new Set());
                roomTyping.get(roomId).add(key);
                socket.to(roomId).emit("user_typing", {
                    userId: String(user._id),
                    name: `${user.firstName} ${user.lastName}`.trim(),
                    isTyping: true,
                });
            } else {
                roomTyping.get(roomId)?.delete(key);
                socket.to(roomId).emit("user_typing", {
                    userId: String(user._id),
                    name: `${user.firstName} ${user.lastName}`.trim(),
                    isTyping: false,
                });
            }
        });

        socket.on("leave_interest_room", () => {
            if (!socket.activeRoomId) return;
            removePresence(socket.activeRoomId, user._id);
            io.to(socket.activeRoomId).emit("presence_update", {
                roomId: socket.activeRoomId,
                users: getPresenceList(socket.activeRoomId),
            });
            socket.leave(socket.activeRoomId);
            socket.activeRoomId = null;
        });

        socket.on("disconnect", () => {
            if (!socket.activeRoomId) return;
            removePresence(socket.activeRoomId, user._id);
            io.to(socket.activeRoomId).emit("presence_update", {
                roomId: socket.activeRoomId,
                users: getPresenceList(socket.activeRoomId),
            });
        });
    });
}
