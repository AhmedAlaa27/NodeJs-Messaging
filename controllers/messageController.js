import prisma from "../prisma/prismaClient.js";
import sanitize from "sanitize-html";

export async function sendMessage(req, res) {
    try {
        const { recipientId, content } = req.body;
        const senderId = req.user.id;

        if (!content.trim()) {
            return res.status(400).json({ error: 'Message content cannot be empty' });
        }

        const sanitizedContent = sanitize(content.trim(), {
            allowedTags: [],
            allowedAttributes: {},
        });

        const recipient = await prisma.user.findUnique({
            where: { id: recipientId }
        });

        if (!recipient) {
            return res.status(404).json({ error: 'Recipient not found' });
        }

        const message = await prisma.message.create({
            data: {
                senderId,
                recipientId,
                content: sanitizedContent,
            },
        });

        res.status(201).json(message);

    } catch (err) {
        res.status(500).json({ error: 'An error occurred while sending the message' });
    }
}

export async function getMessages(req, res) {
    try {

        const userId = req.user.id;
        const cursor = req.query.cursor;
        const limit = parseInt(req.query.limit) || 20;

        const messages = await prisma.message.findMany({
            where: {
                OR: [
                    { senderId: userId },
                    { recipientId: userId },
                ],
                id: cursor ? { lt: cursor } : undefined
            },
            take: limit + 1,
            orderBy: {createdAt: 'desc'}
        });

        const hasNextPage = messages.length > limit;
        const data = hasNextPage ? messages.slice(0, -1) : messages;

        res.json({
            data,
            nextCursor: hasNextPage ? data[data.length - 1].id : null
        });

    } catch (err) {
        res.status(500).json({ error: "Failed to fetch messages" });
    }
}

export async function markMessagesAsRead(req, res) {
    try {

        const userId = req.user.id;
        const { messageIds} = req.body;

        const messages = await prisma.message.findMany({
            where: {
                id: { in: messageIds },
                recipientId: userId
            }
        });

        if (messages.length !== messageIds.length) {
            return res.status(403).json({ error: "Unauthorized to mark some messages" });
        }

        await prisma.message.updateMany({
            where: { id: {in: messageIds } },
            data: { read: true }
        });

        res.status(204).end();

    } catch (err) {
        res.status(500).json({ error: "Failed to mark messages as read" });
    }
}
