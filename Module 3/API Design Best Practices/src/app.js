const express = require('express');
const postRoutes = require('./routes/postRoutes');
const { resetData } = require('./data/postStore');
const controller = require('./controllers/postController');
const { sendError } = require('./utils/http');

function createApp() {
  const app = express();
  app.use(express.json());

  app.use('/', postRoutes);
  app.get('/internal-test-error', controller.explode);

  app.use((req, res) => {
    return sendError(res, 404, 'NOT_FOUND', 'Route not found');
  });

  return app;
}

if (require.main === module) {
  const app = createApp();
  const port = 3000;
  app.listen(port, () => {
    console.log(`Solution API listening on port ${port}`);
  });
}

module.exports = {
  createApp,
  resetData
};
