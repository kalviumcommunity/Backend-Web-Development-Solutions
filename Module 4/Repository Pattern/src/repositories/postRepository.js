const initialPosts = require('../data/initialPosts');

const posts = initialPosts.map((post) => ({ ...post }));
let nextId = posts.reduce((highest, post) => Math.max(highest, post.id), 0) + 1;

function findAll() {
  return posts.map((post) => ({ ...post }));
}

function findById(id) {
  return posts.find((post) => post.id === Number(id)) || null;
}

function create(fields) {
  const post = {
    id: nextId++,
    title: fields.title,
    body: fields.body || '',
    authorId: fields.authorId,
  };
  posts.push(post);
  return { ...post };
}

function update(id, patch) {
  const post = posts.find((candidate) => candidate.id === Number(id));
  if (!post) return null;
  if (patch.title !== undefined) post.title = patch.title;
  if (patch.body !== undefined) post.body = patch.body;
  return { ...post };
}

function remove(id) {
  const index = posts.findIndex((post) => post.id === Number(id));
  if (index === -1) return false;
  posts.splice(index, 1);
  return true;
}

module.exports = { findAll, findById, create, update, remove };
