import { DataTypes, Model, Optional, InferAttributes, InferCreationAttributes, CreationOptional, ForeignKey } from 'sequelize';
import { sequelize } from '@config/database';
import User from './User';

export interface MediaAttributes {
  id: number;
  userId: number;
  fileName: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  storagePath: string;
  url: string;
  altText: string | null;
  createdAt: Date;
  deletedAt: Date | null;
}

export type MediaCreationAttributes = Optional<MediaAttributes, 'id' | 'altText' | 'createdAt' | 'deletedAt'>;

class Media
  extends Model<InferAttributes<Media>, InferCreationAttributes<Media>>
  implements MediaAttributes
{
  declare id: CreationOptional<number>;
  declare userId: ForeignKey<number>;
  declare fileName: string;
  declare originalName: string;
  declare mimeType: string;
  declare fileSize: number;
  declare storagePath: string;
  declare url: string;
  declare altText: string | null;
  declare createdAt: CreationOptional<Date>;
  declare deletedAt: Date | null;
}

Media.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, references: { model: User, key: 'id' } },
    fileName: { type: DataTypes.STRING(255), allowNull: false },
    originalName: { type: DataTypes.STRING(255), allowNull: false },
    mimeType: { type: DataTypes.STRING(100), allowNull: false },
    fileSize: { type: DataTypes.BIGINT, allowNull: false },
    storagePath: { type: DataTypes.STRING(255), allowNull: false },
    url: { type: DataTypes.STRING(255), allowNull: false },
    altText: { type: DataTypes.STRING(255), allowNull: true },
    createdAt: DataTypes.DATE,
    deletedAt: { type: DataTypes.DATE, allowNull: true },
  },
  {
    sequelize,
    tableName: 'media',
    paranoid: true,
  },
);

Media.belongsTo(User, { as: 'user', foreignKey: 'userId' });

export default Media;
