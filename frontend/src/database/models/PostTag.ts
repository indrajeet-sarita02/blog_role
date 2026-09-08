import { DataTypes, Model } from 'sequelize';
import { sequelize } from '@/database';

class PostTag extends Model {
  declare postId: number;
  declare tagId: number;
  declare createdAt: Date;
}

PostTag.init(
  {
    postId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, primaryKey: true },
    tagId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, primaryKey: true },
  },
  { sequelize, tableName: 'post_tags', updatedAt: false },
);

export default PostTag;
