const db = require('../../database/connection');

const Message = {
  async save(userId, content) {
    const [result] = await db.execute(
      'INSERT INTO messages (user_id, content, created_at) VALUES (?, ?, NOW())',
      [userId, content]
    );
    return result.insertId;
  },

  async getRecent() {
    const [rows] = await db.execute(
      'SELECT m.*, u.name FROM messages m JOIN users u ON m.user_id = u.id ORDER BY m.created_at DESC LIMIT 50'
    );
    return rows;
  }
};

module.exports = Message;
