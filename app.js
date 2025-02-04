import express from 'express';
import authRoute from './routes/authRoutes.js';
import { passport, authenticate } from './utils/passport.js';


const app = express();

app.use(passport.initialize());
app.use(express.json());

app.use('/api/auth', authRoute);

app.get('/api/protected', authenticate, (req, res) => {
    res.status(200).json({ message: 'You accessed a protected route!', user: req.user });
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
})
