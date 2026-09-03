import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { setupRoutes } from './routes';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { apiLimiter } from './middleware/rate-limit.middleware';
import { requestContext } from './middleware/context.middleware';
import { env } from './config/env';

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: env.frontendUrl,
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(requestContext);

app.use('/uploads', express.static(path.join(process.cwd(), env.uploadDir)));

if (env.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

app.use(apiLimiter);

setupRoutes(app);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
