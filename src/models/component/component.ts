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
import Blueprint, { BlueprintVersion } from 'src/models/blueprint/blueprint';
import Project from 'src/models/project/project';

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

  declare blueprintVersion: NonAttribute<BlueprintVersion>;
  declare blueprintVersionId: ForeignKey<BlueprintVersion['id']>;
  /*
    TODO:
    Sequelize has a typescript bug with the 'where' query, you cannot compare with null. For example:

    Model.find({where: {someForeignKey: null}})

    This technically works, but typescript doesnt allow it even if the column has allowNull = true.
    I'm setting up this blueprintIsCurrent flag as a work around.

    Revisit this in the future and see if the issue has been resolved in a later version.
  */
  declare blueprintIsCurrent: CreationOptional<boolean>;

  declare project: NonAttribute<Project>;
  declare projectId: ForeignKey<Project['id']>;

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
      blueprintIsCurrent: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      createdOn: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
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
