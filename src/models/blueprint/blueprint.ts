import {
  Model,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  DataTypes,
  ForeignKey,
  NonAttribute,
  HasManyCreateAssociationMixin,
  HasManyGetAssociationsMixin,
} from 'sequelize';
import User from 'src/models/user/user';
import Project from 'src/models/project/project';

export const FieldTypes = {
  STRING: 'STRING',
  NUMBER: 'NUMBER',
  BOOLEAN: 'BOOLEAN',
  DATE: 'DATE',
  ARRAY: 'ARRAY',
  OBJECT: 'OBJECT',
} as const;

export interface BlueprintField {
  id?: string;
  name: string;
  type: string;
  isRequired?: boolean;
  regex?: string;
  isInteger?: boolean;
  min?: number;
  max?: number;
  arrayOf?: BlueprintField;
  fields?: BlueprintField[];
}

export class BlueprintVersion extends Model<
  InferAttributes<BlueprintVersion>,
  InferCreationAttributes<BlueprintVersion>
> {
  declare id: CreationOptional<string>;
  declare blueprintId: ForeignKey<Blueprint['id']>;
  declare name: string;
  declare version: number;
  declare fields: BlueprintField[];
}

class Blueprint extends Model<
  InferAttributes<Blueprint>,
  InferCreationAttributes<Blueprint>
> {
  declare id: CreationOptional<string>;
  declare name: string;
  declare isActive: CreationOptional<boolean>;
  declare fields: BlueprintField[];
  declare version: number;

  declare projectId: ForeignKey<Project['id']>;
  declare project: NonAttribute<Project>;

  declare createdById: ForeignKey<User['id']>;
  declare createdBy: NonAttribute<User>;
  declare createdOn: CreationOptional<Date>;

  declare updatedById: ForeignKey<User['id']> | null;
  declare updatedBy: NonAttribute<User> | null;
  declare updatedOn: CreationOptional<Date> | null;

  declare deletedById: ForeignKey<User['id']> | null;
  declare deletedBy: NonAttribute<User> | null;
  declare deletedOn: CreationOptional<Date> | null;

  declare createVersion: HasManyCreateAssociationMixin<BlueprintVersion>;
  declare getVersions: HasManyGetAssociationsMixin<BlueprintVersion>;
}

export const initializeBlueprint = (sequelize: Sequelize) => {
  Blueprint.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      name: {
        type: DataTypes.STRING,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      fields: {
        type: DataTypes.JSON,
      },
      version: {
        type: DataTypes.INTEGER,
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
    { sequelize, tableName: 'blueprints', timestamps: false },
  );

  BlueprintVersion.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      name: {
        type: DataTypes.STRING,
      },
      fields: {
        type: DataTypes.JSON,
      },
      version: {
        type: DataTypes.INTEGER,
      },
    },
    { sequelize, tableName: 'blueprint_versions', timestamps: false },
  );
};

export default Blueprint;
