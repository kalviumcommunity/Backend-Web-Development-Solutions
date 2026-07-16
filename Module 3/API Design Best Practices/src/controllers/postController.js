const service = require('../services/postService');
const http = require('../utils/http');

function listPosts(req, res) {
  const result = service.listPosts(req.query);
  return http.sendData(res, 200, result.data, result.meta);
}

function getPost(req, res) {
  const post = service.getPost(req.params.id);
  if (!post) {
    return http.sendError(res, 404, 'NOT_FOUND', 'Post not found');
  }
  return http.sendData(res, 200, post);
}

function createPost(req, res) {
  const post = service.createPost(req.body);
  return http.sendData(res, 201, post);
}

function likePost(req, res) {
  try {
    const payload = service.likePost(req.params.id);
    return http.sendData(res, 201, payload);
  } catch (err) {
    return http.sendError(res, err.statusCode || 500, err.code || 'INTERNAL_ERROR', err.message || 'Something went wrong');
  }
}

function explode(req, res) {
  try {
    service.explode();
  } catch (err) {
    return http.sendError(res, 500, 'INTERNAL_ERROR', 'Something went wrong');
  }
}

module.exports = {
  listPosts,
  getPost,
  createPost,
  likePost,
  explode
};
