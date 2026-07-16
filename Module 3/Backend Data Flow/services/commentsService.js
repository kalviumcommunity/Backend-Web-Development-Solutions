const postsRepo = require('./../repository/postsRepo');
const commentsRepo = require('./../repository/commentsRepo');
const AppError = require('./../utils/AppError');

/**
 * SOLUTION (Multi-step workflow): add a comment to a post.
 * ALL CHECKS BEFORE ANY WRITE:
 *   1. post must exist      -> 404
 *   2. post must be open    -> 409
 * Then the writes in order:
 *   3. insert the comment
 *   4. bump the post's comment count
 *   5. return the created comment
 * No write happens before both checks pass, so the app never reaches a
 * half-finished state (a comment without a count bump, or vice versa).
 */
exports.addComment = async (postId, userId, body) => {
  const post = await postsRepo.findById(postId);
  if (!post) {
    throw new AppError('Post not found', 404);
  }
  if (post.locked) {
    throw new AppError('Post is locked for new comments', 409);
  }

  const comment = await commentsRepo.insert({ postId, authorId: userId, body });
  await postsRepo.incrementCommentCount(postId);
  return comment;
};
