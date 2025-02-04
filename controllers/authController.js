import prisma from "../prisma/prismaClient.js";
import { generateToken, hashPassword, verifyPassword } from "../utils/auth.js";

export async function register(req, res) {
    try {
        const { username, email, password } = req.body;
        const hashedPassword = await hashPassword(password);

        const user = await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
            },
        });

        res.status(201).json({
            id: user.id,
            username: user.username,
            email: user.email,
            token: generateToken(user),
        });
    } catch (err) {
        res.status(400).json({ error: 'Registration failed' });
    }
}

export async function login(req, res) {
    try {
        const { email, password } = req.body;
        const user = await prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                username: true,
                email: true,
                password: true,
                _count: {
                    select: {
                        sentMessages: true,
                        receivedMessages: true
                    }
                }
            }
        });

        if (!user ||!(await verifyPassword(password, user.password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const { password: _, ...userData } = user;

        res.json({
            ...userData,
            token: generateToken(user),
        });
    } catch (err) {
        res.status(400).json({ error: 'Login failed' });
    }
}
