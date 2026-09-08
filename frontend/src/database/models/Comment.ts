import { DataTypes, Model } from 'sequelize';
import { sequelize } from '@/database';

class Comment extends Model {
  declare id: number;
  declare postId: number;
  declare userId: number;
  declare parentId: number | null;
  declare content: string;
  declare status: string;
  declare createdAt: Date;
  declare updatedAt: Date;
  declare deletedAt: Date | null;
}

Comment.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    postId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    userId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    parentId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
    content: { type: DataTypes.TEXT, allowNull: false },
    status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'pending' },
    deletedAt: { type: DataTypes.DATE, allowNull: true },
  },
  { sequelize, tableName: 'comments', paranoid: true },
);

export default Comment;
