const { randomUUID } = require('crypto');
const { ttlMs } = require('./cookieConfig');

const sessions = new Map();

function create(userId) {
  const id = randomUUID();
  const session = { userId, expiresAt: Date.now() + ttlMs };
  sessions.set(id, session);
  return { id, ...session };
}

function get(id) {
  if (!id) return null;
  const session = sessions.get(id);
  if (!session) return null;
  if (session.expiresAt <= Date.now()) {
    sessions.delete(id);
    return null;
  }
  return session;
}

function destroy(id) {
  if (id) sessions.delete(id);
}

module.exports = { create, get, destroy };
