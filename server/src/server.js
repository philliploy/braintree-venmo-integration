import settings from 'config';
import app from './express';
import routes from './routes/routes';
import path from 'path';

const PORT = process.env.PORT || settings.port;

routes();

if (process.env.NODE_ENV === 'production') {
  // All remaining requests return the React app, so it can handle routing.
  app.get('*', (request, response) => {
    response.sendFile(path.resolve(__dirname, '../../client/build', 'index.html'));
  });
} 

// start the server
app.listen(PORT, () => {
  console.log(`app started on port ${PORT}`);
});

