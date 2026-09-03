import { DataTypes, Model, Optional, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '@config/database';

export interface TagAttributes {
  id: number;
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

export type TagCreationAttributes = Optional<TagAttributes, 'id' | 'createdAt' | 'updatedAt'>;

class Tag
  extends Model<InferAttributes<Tag>, InferCreationAttributes<Tag>>
  implements TagAttributes
{
  declare id: CreationOptional<number>;
  declare name: string;
  declare slug: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Tag.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(100), allowNull: false },
    slug: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'tags',
    paranoid: false,
  },
);

export default Tag;
