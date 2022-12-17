import {
  Model,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  DataTypes,
  ForeignKey,
  BelongsToGetAssociationMixin,
  NonAttribute,
} from 'sequelize';
import User from 'src/models/user/user';
import Project from 'src/models/project/project';

class Membership extends Model<
  InferAttributes<Membership>,
  InferCreationAttributes<Membership>
> {
  declare id: CreationOptional<string>;
  declare userId: ForeignKey<User['id']>;
  declare user: NonAttribute<User>;
  declare projectId: ForeignKey<Project['id']>;
  declare isProjectAdmin: CreationOptional<boolean>;
  declare isBlueprintManager: CreationOptional<boolean>;
  declare isComponentManager: CreationOptional<boolean>;
  declare isLayoutManager: CreationOptional<boolean>;
  declare isFragmentManager: CreationOptional<boolean>;
  declare createdOn: CreationOptional<Date>;
  declare updatedOn: CreationOptional<Date> | null;

  declare getUser: BelongsToGetAssociationMixin<User>;
  declare getProject: BelongsToGetAssociationMixin<Project>;
}

export const initializeMembership = (sequelize: Sequelize) => {
  Membership.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      createdOn: {
        type: DataTypes.DATE,
        defaultValue: new Date(),
      },
      updatedOn: {
        type: DataTypes.DATE,
      },
      isProjectAdmin: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      isBlueprintManager: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      isComponentManager: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      isLayoutManager: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      isFragmentManager: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      tableName: 'memberships',
      timestamps: false,
    },
  );
};

export default Membership;
