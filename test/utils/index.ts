import fs from 'fs';
import { Sequelize, Utils, UUIDV4 } from 'sequelize';
import jwt from 'jsonwebtoken';
import {
  DB_USERNAME,
  DB_PASSWORD,
  DB_HOSTNAME,
  DB_PORT,
  DB_NAME,
} from '../../src/config/db';
import { PORT } from '../../src/config/app';
import { SECRET } from '../../src/config/auth';
import { initializeModels, User, Project, Membership } from '../../src/models';

interface TokenDataOverride {
  id?: string;
  apiKey?: string;
  iat?: number;
  exp?: number;
}

export class TestHelper {
  sequelize: Sequelize;
  testUsernames: string[];
  testProjectIds: string[];

  constructor() {
    const connectToDatabase = async () => {
      this.sequelize = new Sequelize(
        `postgres://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOSTNAME}:${DB_PORT}/${DB_NAME}`,
        {
          logging: false,
        },
      );

      await initializeModels(this.sequelize);
    };
    connectToDatabase();
    this.testUsernames = [];
    this.testProjectIds = [];
  }

  getServerUrl() {
    const certExists = fs.existsSync('../../src/config/ssl/cert.pem');
    const keyExists = fs.existsSync('../../src/config/ssl/key.pem');
    const protocol = certExists && keyExists ? 'https' : 'http';
    return `${protocol}://localhost:${PORT}`;
  }

  generateUUID() {
    return String(Utils.toDefaultValue(UUIDV4()));
  }

  addTestUsername(testUsername: string) {
    this.testUsernames = this.testUsernames.concat(testUsername);
  }

  addTestProjectId(testProjectId: string) {
    this.testProjectIds = this.testProjectIds.concat(testProjectId);
  }

  async removeTestData() {
    if (this.testUsernames.length) {
      await User.destroy({ where: { username: this.testUsernames } });
    }

    if (this.testProjectIds.length) {
      await Membership.destroy({ where: { projectId: this.testProjectIds } });
      await Project.destroy({ where: { id: this.testProjectIds } });
    }

    await this.sequelize.close();
    this.testUsernames = [];
  }

  async createTestUser(password = 'Password1') {
    const uuid = this.generateUUID();
    let username = '';
    if (typeof uuid === 'string') {
      username = uuid.slice(0, 11);
    }

    const testUser = await User.create({
      username: username.toLowerCase(),
      displayName: username.toUpperCase(),
      hash: User.generateHash(password),
      createdOn: new Date(),
    });

    this.addTestUsername(testUser.username);
    return testUser;
  }

  generateToken(
    user: User,
    dataOverride: TokenDataOverride | string = {},
    secretOverride?: string,
  ) {
    const tokenData = {
      id: user.id,
      apiKey: user.apiKey,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 3,
    };

    let token: string;
    if (typeof dataOverride === 'string') {
      token = jwt.sign(dataOverride, secretOverride || SECRET);
    } else {
      token = jwt.sign({ ...tokenData, ...dataOverride }, secretOverride || SECRET);
    }

    return token;
  }
}
