# JSON CMS

JSON CMS is a RESTful API that is designed for managing application content.

## Required Software Dependencies

### 1. [NodeJS 18.12.0](https://nodejs.org/en/download/)

### 2. [PostgresSQL 14.5](https://www.postgresql.org/download/)

## Required Setup

Before running the API and getting started there are a few steps that
must be completed.

**_NOTE:_** _These steps assume you are using a Linux operating system, the
equivalent Windows commands will have to be researched on your own._

**_You must complete all steps to start the API_**

### 1. Configure db.ts

Create a new database configuration file using the following path / template, found below:

**json-cms/src/config/db.ts**

```
export const DB_USERNAME = 'YOUR_DATABASE_USERNAME_GOES_HERE';
export const DB_PASSWORD = 'YOUR_DATABASE_PASSWORD_GOES_HERE';
export const DB_HOSTNAME = 'YOUR_DATABASE_HOSTNAME_GOES_HERE';
export const DB_PORT = 'YOUR_DATABASE_PORT_GOES_HERE';
export const DB_NAME = 'YOUR_DATABASE_NAME_GOES_HERE';
```

### 2. Configure auth.ts

Create a new auth configuration file using the following path / template, found below:

**json-cms/src/config/auth.ts**

```
export const SECRET = 'YOUR_SECRET_AND_SECURE_PASSWORD_GOES_HERE';
export const SALT_ROUNDS = 10;
```

**_NOTE:_** The `SALT_ROUNDS` value can be any _number_ your choose.

### 3. Install Node Modules

Run the following command from the _root of the cloned repository_ to
install node modules required for the API.

```
npm install
```

## Optional Setup

### Configure HTTPS

This step may be completed by providing a CA signed certificate, assuming
you have the .pem files, or by generating a self-signed certificate
as shown below:

```
mkdir -p json-cms/config/ssl
cd json-cms/config/ssl
openssl req -x509 -nodes -newkey rsa:2048 -keyout key.pem -out cert.pem -days 365
```

_You will be asked questions when generating the self-signed certificate, answer the prompts until the process completes_

## Start Up

**_After all `Required Software Dependencies` and `Required Setup` steps have been completed, use the following command
to start the API._**

```
npm run start:dev
```

or

```
npm run start:prod
```

## Test Suite

JSON CMS comes with unit tests that validate end-to-end functionality for each endpoint.

1. In one terminal start the JSON CMS API.

2. In another terminal instance run the following command from the root of the cloned repository
   to execute the full test suite:

```
npm run test
```
