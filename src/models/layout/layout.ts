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
import Component from 'src/models/component/component';
import Project from 'src/models/project/project';

class Layout extends Model<InferAttributes<Layout>, InferCreationAttributes<Layout>> {
  declare id: CreationOptional<string>;
  declare name: string;
  declare isActive: CreationOptional<boolean>;

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

  declare components: NonAttribute<Component[]>;
}

export class LayoutComponent extends Model<
  InferAttributes<LayoutComponent>,
  InferCreationAttributes<LayoutComponent>
> {
  declare layoutId: ForeignKey<Layout['id']>;
  declare componentId: ForeignKey<Component['id']>;
  declare order: number;
}

export const initializeLayout = (sequelize: Sequelize) => {
  Layout.init(
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
        defaultValue: DataTypes.NOW,
      },
      updatedOn: {
        type: DataTypes.DATE,
      },
      deletedOn: {
        type: DataTypes.DATE,
      },
    },
    { sequelize, tableName: 'layouts', timestamps: false },
  );
  LayoutComponent.init(
    {
      layoutId: {
        type: DataTypes.UUID,
        primaryKey: true,
      },
      componentId: {
        type: DataTypes.UUID,
        primaryKey: true,
      },
      order: {
        type: DataTypes.INTEGER,
      },
    },
    { sequelize, tableName: 'layout_components', timestamps: false },
  );
};

export default Layout;
