import { DataTypes, Model, Optional, InferAttributes, InferCreationAttributes, CreationOptional, ForeignKey } from 'sequelize';
import { sequelize } from '@config/database';
import Post from './Post';
import User from './User';

export interface PostRevisionAttributes {
  id: number;
  postId: number;
  userId: number;
  title: string;
  excerpt: string | null;
  content: string | null;
  featuredImage: string | null;
  revisionNumber: number;
  createdAt: Date;
}

export type PostRevisionCreationAttributes = Optional<
  PostRevisionAttributes,
  'id' | 'excerpt' | 'content' | 'featuredImage' | 'createdAt'
>;

class PostRevision
  extends Model<InferAttributes<PostRevision>, InferCreationAttributes<PostRevision>>
  implements PostRevisionAttributes
{
  declare id: CreationOptional<number>;
  declare postId: ForeignKey<number>;
  declare userId: ForeignKey<number>;
  declare title: string;
  declare excerpt: string | null;
  declare content: string | null;
  declare featuredImage: string | null;
  declare revisionNumber: number;
  declare createdAt: CreationOptional<Date>;
}

PostRevision.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    postId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, references: { model: Post, key: 'id' } },
    userId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, references: { model: User, key: 'id' } },
    title: { type: DataTypes.STRING(255), allowNull: false },
    excerpt: { type: DataTypes.TEXT, allowNull: true },
    content: { type: DataTypes.TEXT, allowNull: true },
    featuredImage: { type: DataTypes.STRING(255), allowNull: true },
    revisionNumber: { type: DataTypes.INTEGER, allowNull: false },
    createdAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'post_revisions',
    paranoid: false,
    updatedAt: false,
  },
);

PostRevision.belongsTo(Post, { as: 'post', foreignKey: 'postId' });
PostRevision.belongsTo(User, { as: 'user', foreignKey: 'userId' });
Post.hasMany(PostRevision, { as: 'revisions', foreignKey: 'postId' });

export default PostRevision;
