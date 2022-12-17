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
import Project from 'src/models/project/project';

type FieldTypes = 'STRING' | 'NUMBER' | 'BOOLEAN' | 'DATE' | 'ARRAY' | 'OBJECT';

export class BlueprintField extends Model<
  InferAttributes<BlueprintField>,
  InferCreationAttributes<BlueprintField>
> {
  declare id: CreationOptional<string>;
  declare type: FieldTypes;
  declare name: string;
  declare isRequired: CreationOptional<boolean>;
  declare isInteger: CreationOptional<boolean>;
  declare regex: CreationOptional<string> | null;
  declare min: CreationOptional<number> | null;
  declare max: CreationOptional<number> | null;
  declare arrayOfId: ForeignKey<BlueprintField['id']> | null;
  declare arrayOf: NonAttribute<BlueprintField> | null;
  declare parentFieldId: ForeignKey<BlueprintField['id']> | null;
  declare fields: NonAttribute<BlueprintField[]> | null;
  declare parentBlueprintId: ForeignKey<Blueprint['id']> | null;
}

class Blueprint extends Model<
  InferAttributes<Blueprint>,
  InferCreationAttributes<Blueprint>
> {
  declare id: CreationOptional<string>;
  declare projectId: ForeignKey<Project['id']>;
  declare name: string;
  declare isActive: CreationOptional<boolean>;
  declare createdOn: CreationOptional<Date>;
  declare updatedOn: CreationOptional<Date> | null;
  declare deletedOn: CreationOptional<Date> | null;
  declare createdById: ForeignKey<User['id']>;
  declare createdBy: NonAttribute<User>;
  declare updatedById: ForeignKey<User['id']> | null;
  declare updatedBy: NonAttribute<User> | null;
  declare deletedById: ForeignKey<User['id']> | null;
  declare deletedBy: NonAttribute<User> | null;
  declare fields: NonAttribute<BlueprintField[]>;
}

export const initializeBlueprint = (sequelize: Sequelize) => {
  BlueprintField.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      type: {
        type: DataTypes.STRING,
      },
      name: {
        type: DataTypes.STRING,
      },
      isRequired: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      isInteger: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      regex: {
        type: DataTypes.STRING,
      },
      min: {
        type: DataTypes.FLOAT,
      },
      max: {
        type: DataTypes.FLOAT,
      },
    },
    {
      sequelize,
      tableName: 'blueprint_fields',
      timestamps: false,
    },
  );
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
    { sequelize, tableName: 'blueprints', timestamps: false },
  );
};

export default Blueprint;
