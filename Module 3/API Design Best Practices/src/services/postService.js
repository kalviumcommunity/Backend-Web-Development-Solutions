const store = require('../data/postStore');

function listPosts(query = {}) {
  const limit = Math.min(parseInt(query.limit, 10) || 2, 100);
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const all = store.getAllPosts().sort((a, b) => b.createdAt - a.createdAt || b.id - a.id);
  const total = all.length;
  const pages = Math.max(1, Math.ceil(total / limit));
  const offset = (page - 1) * limit;
  const data = all.slice(offset, offset + limit);

  return {
    data,
    meta: { page, limit, total, pages }
  };
}

function getPost(id) {
  return store.getPostById(id);
}

function createPost(body = {}) {
  return store.createPost({
    title: body.title,
    author: body.author
  });
}

function likePost(id) {
  const post = store.incrementLikes(id);
  if (!post) {
    const err = new Error('Post not found');
    err.statusCode = 404;
    err.code = 'NOT_FOUND';
    throw err;
  }
  return {
    postId: post.id,
    likes: post.likes
  };
}

function explode() {
  const err = new Error('Internal server error');
  err.statusCode = 500;
  err.code = 'INTERNAL_ERROR';
  throw err;
}

module.exports = {
  listPosts,
  getPost,
  createPost,
  likePost,
  explode
};
