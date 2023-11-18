import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import logger from './middlewares/logger.js';
import { dbCreationRouter, queriesRouter } from './routes/index.js';

dotenv.config();

const app: express.Express = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use(logger);
app.use(cors());

app.use('/db-creation', dbCreationRouter);
app.use('/query', queriesRouter);

app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));