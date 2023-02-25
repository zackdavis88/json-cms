import {
  Model,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  DataTypes,
  ForeignKey,
  NonAttribute,
} from 'sequelize';
import User from 'src/models/user/user';
import Blueprint from 'src/models/blueprint/blueprint';

export interface ComponentContent {
  [key: string]: unknown;
}

class Component extends Model<
  InferAttributes<Component>,
  InferCreationAttributes<Component>
> {
  declare id: CreationOptional<string>;
  declare name: string;
  declare content: ComponentContent;
  declare isActive: CreationOptional<boolean>;

  declare blueprint: NonAttribute<Blueprint>;
  declare blueprintId: ForeignKey<Blueprint['id']>;
  declare blueprintVersion: number;

  declare createdById: ForeignKey<User['id']>;
  declare createdBy: NonAttribute<User>;
  declare createdOn: CreationOptional<Date>;

  declare updatedById: ForeignKey<User['id']> | null;
  declare updatedBy: NonAttribute<User> | null;
  declare updatedOn: CreationOptional<Date> | null;

  declare deletedById: ForeignKey<User['id']> | null;
  declare deletedBy: NonAttribute<User> | null;
  declare deletedOn: CreationOptional<Date> | null;
}

export const initializeComponent = (sequelize: Sequelize) => {
  Component.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      name: {
        type: DataTypes.STRING,
      },
      content: {
        type: DataTypes.JSON,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      blueprintVersion: {
        type: DataTypes.INTEGER,
      },
      createdOn: {
        type: DataTypes.DATE,
        defaultValue: new Date(),
      },
      updatedOn: {
        type: DataTypes.DATE,
      },
      deletedOn: {
        type: DataTypes.DATE,
      },
    },
    { sequelize, tableName: 'components', timestamps: false },
  );
};

export default Component;
