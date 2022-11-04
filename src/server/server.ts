import fs from 'fs';
import https from 'https';
import http from 'http';
import express from 'express';
import morgan from 'morgan';
import methodOverride from 'method-override';
import { PORT } from 'src/config/app';

const app = express();
app.use(
  express.urlencoded({
    extended: true,
  }),
);
app.use(express.json());
app.use(methodOverride());
app.use(morgan('dev'));

// Build an HTTP or HTTPS server depending on configs available.
let server;
const certExists = fs.existsSync('../config/ssl/cert.pem');
const keyExists = fs.existsSync('../config/ssl/key.pem');
const useHttps = certExists && keyExists;
if (useHttps) {
  server = https.createServer(
    {
      key: fs.readFileSync('../config/ssl/key.pem'),
      cert: fs.readFileSync('../config/ssl/cert.pem'),
    },
    app,
  );
} else {
  server = http.createServer(app);
}

server.listen(PORT, () => {
  console.log(
    'Typhoon API listening on port %s using %s protocol',
    PORT,
    useHttps ? 'https' : 'http',
  );
});
