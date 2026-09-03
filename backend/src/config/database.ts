import { Sequelize } from 'sequelize';
import { env } from './env';

export const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: env.db.storage,
  logging: env.nodeEnv === 'development' ? console.log : false,
  define: {
    underscored: true,
  },
});

export async function connectDatabase(): Promise<void> {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
}
