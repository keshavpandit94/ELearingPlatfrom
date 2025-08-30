import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import enrollmentRoutes from './routes/enrollmentRoutes.js';
import progressRoutes from "./routes/progressRoutes.js";
import cors from 'cors';

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

connectDB();

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/progress', progressRoutes);

app.listen(process.env.PORT || 5001, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
