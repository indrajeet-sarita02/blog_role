import { DataTypes, Model, Optional, InferAttributes, InferCreationAttributes, CreationOptional, ForeignKey } from 'sequelize';
import { sequelize } from '@config/database';
import Post from './Post';
import Tag from './Tag';

export interface PostTagAttributes {
  postId: number;
  tagId: number;
  createdAt: Date;
}

export type PostTagCreationAttributes = Optional<PostTagAttributes, 'createdAt'>;

class PostTag
  extends Model<InferAttributes<PostTag>, InferCreationAttributes<PostTag>>
  implements PostTagAttributes
{
  declare postId: ForeignKey<number>;
  declare tagId: ForeignKey<number>;
  declare createdAt: CreationOptional<Date>;
}

PostTag.init(
  {
    postId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, references: { model: Post, key: 'id' }, primaryKey: true },
    tagId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, references: { model: Tag, key: 'id' }, primaryKey: true },
    createdAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'post_tags',
    paranoid: false,
    updatedAt: false,
  },
);

Post.belongsToMany(Tag, { through: PostTag, foreignKey: 'postId', otherKey: 'tagId', as: 'tags' });
Tag.belongsToMany(Post, { through: PostTag, foreignKey: 'tagId', otherKey: 'postId', as: 'posts' });

export default PostTag;
