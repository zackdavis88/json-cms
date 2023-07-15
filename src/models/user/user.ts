import bcrypt from 'bcryptjs';
import { SALT_ROUNDS } from 'src/config/auth';
import {
  Model,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  DataTypes,
  NonAttribute,
  HasManyGetAssociationsMixin,
} from 'sequelize';
import Membership from 'src/models/membership/membership';

class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare id: CreationOptional<string>;
  declare isActive: CreationOptional<boolean>;
  declare username: string;
  declare displayName: string;
  declare hash: string;
  declare apiKey: CreationOptional<string>;
  declare createdOn: CreationOptional<Date>;
  declare updatedOn: CreationOptional<Date> | null;
  declare deletedOn: CreationOptional<Date> | null;

  declare getMemberships: HasManyGetAssociationsMixin<Membership>;

  static generateHash(password: string): NonAttribute<string> {
    return bcrypt.hashSync(password, SALT_ROUNDS);
  }

  compareHash(password: string): NonAttribute<boolean> {
    return bcrypt.compareSync(password, this.hash);
  }
}

export const initializeUser = (sequelize: Sequelize) => {
  User.init(
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
      username: {
        type: DataTypes.STRING,
        unique: true,
      },
      displayName: {
        type: DataTypes.STRING,
      },
      hash: {
        type: DataTypes.STRING,
      },
      apiKey: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
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
      tableName: 'users',
      timestamps: false,
      scopes: {
        publicAttributes: {
          attributes: {
            exclude: ['id', 'hash', 'apiKey', 'updatedOn', 'deletedOn'],
          },
        },
      },
    },
  );
};

export default User;
