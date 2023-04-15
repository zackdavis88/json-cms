import {
  Model,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  DataTypes,
  HasManyCreateAssociationMixin,
  HasManyGetAssociationsMixin,
  HasManyCountAssociationsMixin,
  ForeignKey,
  NonAttribute,
} from 'sequelize';
import User from 'src/models/user/user';
import Membership from 'src/models/membership/membership';
import Blueprint from 'src/models/blueprint/blueprint';
import Component from 'src/models/component/component';
import Layout from 'src/models/layout/layout';

class Project extends Model<InferAttributes<Project>, InferCreationAttributes<Project>> {
  declare id: CreationOptional<string>;
  declare isActive: CreationOptional<boolean>;
  declare name: string;
  declare description: CreationOptional<string> | null;

  declare createMembership: HasManyCreateAssociationMixin<Membership>;
  declare getMemberships: HasManyGetAssociationsMixin<Membership>;
  declare countMemberships: HasManyCountAssociationsMixin;

  declare createBlueprint: HasManyCreateAssociationMixin<Blueprint>;
  declare getBlueprints: HasManyGetAssociationsMixin<Blueprint>;
  declare countBlueprints: HasManyCountAssociationsMixin;

  declare createComponent: HasManyCreateAssociationMixin<Component>;
  declare getComponents: HasManyGetAssociationsMixin<Component>;
  declare countComponents: HasManyCountAssociationsMixin;

  declare createLayout: HasManyCreateAssociationMixin<Layout>;
  declare getLayouts: HasManyGetAssociationsMixin<Layout>;
  declare countLayouts: HasManyCountAssociationsMixin;

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

export const initializeProject = (sequelize: Sequelize) => {
  Project.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      name: {
        type: DataTypes.STRING,
      },
      description: {
        type: DataTypes.STRING,
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
    {
      sequelize,
      tableName: 'projects',
      timestamps: false,
    },
  );
};

export default Project;
