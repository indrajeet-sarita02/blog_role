import { DataTypes, Model, Optional, InferAttributes, InferCreationAttributes, CreationOptional, ForeignKey } from 'sequelize';
import { sequelize } from '@config/database';
import User from './User';
import Category from './Category';
import { POST_STATUS, POST_VISIBILITY } from '@config/constants';

export interface PostAttributes {
  id: number;
  authorId: number;
  categoryId: number | null;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  featuredImage: string | null;
  status: string;
  visibility: string;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export type PostCreationAttributes = Optional<
  PostAttributes,
  | 'id'
  | 'categoryId'
  | 'excerpt'
  | 'content'
  | 'featuredImage'
  | 'publishedAt'
  | 'createdAt'
  | 'updatedAt'
  | 'deletedAt'
>;

class Post
  extends Model<InferAttributes<Post>, InferCreationAttributes<Post>>
  implements PostAttributes
{
  declare id: CreationOptional<number>;
  declare authorId: ForeignKey<number>;
  declare categoryId: number | null;
  declare title: string;
  declare slug: string;
  declare excerpt: string | null;
  declare content: string | null;
  declare featuredImage: string | null;
  declare status: string;
  declare visibility: string;
  declare publishedAt: Date | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: Date | null;
}

Post.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    authorId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, references: { model: User, key: 'id' } },
    categoryId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true, references: { model: Category, key: 'id' } },
    title: { type: DataTypes.STRING(255), allowNull: false },
    slug: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    excerpt: { type: DataTypes.TEXT, allowNull: true },
    content: { type: DataTypes.TEXT, allowNull: true },
    featuredImage: { type: DataTypes.STRING(255), allowNull: true },
    status: { type: DataTypes.ENUM(...Object.values(POST_STATUS)), allowNull: false, defaultValue: POST_STATUS.DRAFT },
    visibility: {
      type: DataTypes.ENUM(...Object.values(POST_VISIBILITY)),
      allowNull: false,
      defaultValue: POST_VISIBILITY.PUBLIC,
    },
    publishedAt: { type: DataTypes.DATE, allowNull: true },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
    deletedAt: { type: DataTypes.DATE, allowNull: true },
  },
  {
    sequelize,
    tableName: 'posts',
    paranoid: true,
  },
);

Post.belongsTo(User, { as: 'author', foreignKey: 'authorId' });
Post.belongsTo(Category, { as: 'category', foreignKey: 'categoryId' });

export default Post;
