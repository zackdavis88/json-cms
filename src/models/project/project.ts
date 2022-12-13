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
} from 'sequelize';
import Membership from 'src/models/membership/membership';

class Project extends Model<InferAttributes<Project>, InferCreationAttributes<Project>> {
  declare id: CreationOptional<string>;
  declare isActive: CreationOptional<boolean>;
  declare name: string;
  declare description: CreationOptional<string> | null;
  declare createdOn: CreationOptional<Date>;
  declare updatedOn: CreationOptional<Date> | null;
  declare deletedOn: CreationOptional<Date> | null;

  declare createMembership: HasManyCreateAssociationMixin<Membership>;
  declare getMemberships: HasManyGetAssociationsMixin<Membership>;
  declare countMemberships: HasManyCountAssociationsMixin;
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
        defaultValue: new Date(),
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
