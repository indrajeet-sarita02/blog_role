import { DataTypes, Model } from 'sequelize';
import { sequelize } from '@/database';

class Media extends Model {
  declare id: number;
  declare userId: number;
  declare fileName: string;
  declare originalName: string;
  declare mimeType: string;
  declare fileSize: number;
  declare url: string;
  declare altText: string | null;
  declare createdAt: Date;
  declare deletedAt: Date | null;
}

Media.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    fileName: { type: DataTypes.STRING(255), allowNull: false },
    originalName: { type: DataTypes.STRING(255), allowNull: false },
    mimeType: { type: DataTypes.STRING(100), allowNull: false },
    fileSize: { type: DataTypes.BIGINT, allowNull: false },
    url: { type: DataTypes.STRING(255), allowNull: false },
    altText: { type: DataTypes.STRING(255), allowNull: true },
    deletedAt: { type: DataTypes.DATE, allowNull: true },
  },
  { sequelize, tableName: 'media', paranoid: true },
);

export default Media;
