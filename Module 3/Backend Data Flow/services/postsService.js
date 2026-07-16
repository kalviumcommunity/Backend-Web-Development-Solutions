const repo = require('./../repository/postsRepo');
const AppError = require('./../utils/AppError');

const EDIT_WINDOW_MS = 24 * 60 * 60 * 1000; // a post may only be edited within 24h

exports.getAll = async () => repo.findAll();
exports.create = async ({ authorId, title, body }) => repo.insert({ authorId, title, body });

/**
 * SOLUTION (Domain rule): edit a post.
 * Guards run in order, each throwing before any write:
 *   1. existence  -> 404
 *   2. ownership  -> 403
 *   3. 24h window -> 403
 * Only then the write happens.
 */
exports.editPost = async (postId, userId, changes) => {
  const post = await repo.findById(postId);
  if (!post) {
    throw new AppError('Post not found', 404);
  }
  if (post.authorId !== userId) {
    throw new AppError('You can only edit your own post', 403);
  }
  if (Date.now() - post.createdAt > EDIT_WINDOW_MS) {
    throw new AppError('Post can no longer be edited', 403);
  }
  return repo.update(postId, changes);
};
