const postsRepo = require('./../repository/postsRepo');
const votesRepo = require('./../repository/votesRepo');
const AppError = require('./../utils/AppError');

/**
 * SOLUTION (Domain rule): cast a vote, one per user per post.
 * Both guards run before the write:
 *   1. post must exist        -> 404
 *   2. no duplicate vote      -> 409
 */
exports.castVote = async (postId, userId) => {
  const post = await postsRepo.findById(postId);
  if (!post) {
    throw new AppError('Post not found', 404);
  }
  const existing = await votesRepo.find(postId, userId);
  if (existing) {
    throw new AppError('You have already voted on this post', 409);
  }
  return votesRepo.insert(postId, userId);
};

exports.countFor = async (postId) => votesRepo.countByPost(postId);
