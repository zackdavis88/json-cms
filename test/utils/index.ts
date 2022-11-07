import fs from 'fs';
import { Sequelize, Utils, UUIDV4 } from 'sequelize';
import {
  DB_USERNAME,
  DB_PASSWORD,
  DB_HOSTNAME,
  DB_PORT,
  DB_NAME,
} from '../../src/config/db';
import { PORT } from '../../src/config/app';
import { initializeModels, User } from '../../src/models';

export class TestHelper {
  sequelize: Sequelize;
  testUsernames: string[];

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

  async removeTestData() {
    if (this.testUsernames.length) {
      await User.destroy({ where: { username: this.testUsernames } });
    }

    await this.sequelize.close();
    this.testUsernames = [];
  }

  async createTestUser(password: string) {
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

    this.testUsernames = this.testUsernames.concat(testUser.username);
    return testUser;
  }
}
