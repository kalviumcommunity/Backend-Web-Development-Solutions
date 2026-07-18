const express = require('express');
const postController = require('./controllers/postController');

const app = express();
app.use(express.json());

app.get('/posts', postController.list);
app.get('/posts/:id', postController.get);
app.post('/posts', postController.create);
app.patch('/posts/:id', postController.update);
app.delete('/posts/:id', postController.remove);

app.use((error, req, res, next) => {
  if (error.code === 'P2002') return res.status(409).json({ error: 'Resource already exists' });
  if (error.code === 'P2003') return res.status(422).json({ error: 'Related record does not exist' });
  res.status(error.statusCode || 500).json({ error: 'Request failed' });
});

if (require.main === module) {
  app.listen(process.env.PORT || 3000, () => console.log('API listening'));
}

module.exports = app;
