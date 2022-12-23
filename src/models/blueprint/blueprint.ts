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

export const FieldTypes = {
  STRING: 'STRING',
  NUMBER: 'NUMBER',
  BOOLEAN: 'BOOLEAN',
  DATE: 'DATE',
  ARRAY: 'ARRAY',
  OBJECT: 'OBJECT',
} as const;

interface BaseField {
  id?: string;
  name: string;
  isRequired?: boolean;
}

interface StringField extends BaseField {
  type: typeof FieldTypes.STRING;
  regex?: string;
}

interface NumberField extends BaseField {
  type: typeof FieldTypes.NUMBER;
  isInteger?: boolean;
  min?: number;
  max?: number;
}

interface BooleanField extends BaseField {
  type: typeof FieldTypes.BOOLEAN;
}

interface DateField extends BaseField {
  type: typeof FieldTypes.DATE;
}

interface ArrayField extends BaseField {
  type: typeof FieldTypes.ARRAY;
  min?: number;
  max?: number;
  arrayOf: StringField | NumberField | BooleanField | DateField | ObjectField;
}

interface ObjectField extends BaseField {
  type: typeof FieldTypes.OBJECT;
  fields: BlueprintField[];
}

type BlueprintField =
  | StringField
  | NumberField
  | BooleanField
  | DateField
  | ArrayField
  | ObjectField;

class Blueprint extends Model<
  InferAttributes<Blueprint>,
  InferCreationAttributes<Blueprint>
> {
  declare id: CreationOptional<string>;
  declare name: string;
  declare isActive: CreationOptional<boolean>;
  declare fields: BlueprintField[];

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
      fields: {
        type: DataTypes.JSONB,
      },
    },
    { sequelize, tableName: 'blueprints', timestamps: false },
  );
};

export default Blueprint;
