import express from 'express';
import compression from 'compression';
import settings from 'config';
import bodyParser from 'body-parser';

// server config
const app = express();

app.use(compression());

// tell the app to parse HTTP body messages
app.use(bodyParser.json({ limit: settings.bodyLimit }));
app.use(bodyParser.urlencoded({ extended: true }));

// Priority serve any static files.
app.use(express.static(settings.staticPath));

export default app;