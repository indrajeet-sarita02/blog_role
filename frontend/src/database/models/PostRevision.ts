import { DataTypes, Model } from 'sequelize';
import { sequelize } from '@/database';

class PostRevision extends Model {
  declare id: number;
  declare postId: number;
  declare userId: number;
  declare title: string;
  declare excerpt: string | null;
  declare content: string | null;
  declare featuredImage: string | null;
  declare revisionNumber: number;
  declare createdAt: Date;
}

PostRevision.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    postId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    userId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    title: { type: DataTypes.STRING(255), allowNull: false },
    excerpt: { type: DataTypes.TEXT, allowNull: true },
    content: { type: DataTypes.TEXT, allowNull: true },
    featuredImage: { type: DataTypes.STRING(255), allowNull: true },
    revisionNumber: { type: DataTypes.INTEGER, allowNull: false },
  },
  { sequelize, tableName: 'post_revisions', updatedAt: false },
);

export default PostRevision;
