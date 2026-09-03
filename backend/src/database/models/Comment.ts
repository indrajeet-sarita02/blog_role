import { DataTypes, Model, Optional, InferAttributes, InferCreationAttributes, CreationOptional, ForeignKey } from 'sequelize';
import { sequelize } from '@config/database';
import Post from './Post';
import User from './User';
import { COMMENT_STATUS } from '@config/constants';

export interface CommentAttributes {
  id: number;
  postId: number;
  userId: number;
  parentId: number | null;
  content: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export type CommentCreationAttributes = Optional<
  CommentAttributes,
  'id' | 'parentId' | 'status' | 'createdAt' | 'updatedAt' | 'deletedAt'
>;

class Comment
  extends Model<InferAttributes<Comment>, InferCreationAttributes<Comment>>
  implements CommentAttributes
{
  declare id: CreationOptional<number>;
  declare postId: ForeignKey<number>;
  declare userId: ForeignKey<number>;
  declare parentId: number | null;
  declare content: string;
  declare status: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: Date | null;
}

Comment.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    postId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, references: { model: Post, key: 'id' } },
    userId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, references: { model: User, key: 'id' } },
    parentId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
    content: { type: DataTypes.TEXT, allowNull: false },
    status: {
      type: DataTypes.ENUM(...Object.values(COMMENT_STATUS)),
      allowNull: false,
      defaultValue: COMMENT_STATUS.PENDING,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
    deletedAt: { type: DataTypes.DATE, allowNull: true },
  },
  {
    sequelize,
    tableName: 'comments',
    paranoid: true,
  },
);

Comment.belongsTo(User, { as: 'user', foreignKey: 'userId' });
Comment.belongsTo(Post, { as: 'post', foreignKey: 'postId' });
Comment.belongsTo(Comment, { as: 'parent', foreignKey: 'parentId' });
Comment.hasMany(Comment, { as: 'replies', foreignKey: 'parentId' });

export default Comment;
