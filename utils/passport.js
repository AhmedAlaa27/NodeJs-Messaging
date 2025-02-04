import passport from "passport";
import { Strategy as JWTStrategy } from "passport-jwt";
import { ExtractJwt } from "passport-jwt";
import prisma from "../prisma/prismaClient.js";

const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
}

passport.use(new JWTStrategy(jwtOptions, async (jwt_payload, done) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: jwt_payload.id },
        });
        if (!user) {
            return done(null, false);
        }
        return done(null, user);
    } catch (err) {
        return done(err, false);
    }
}));

const authenticate = passport.authenticate('jwt', { session: false });

export { authenticate, passport };
