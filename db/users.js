const client = require("./client");
const bcrypt = require("bcrypt");
//const usersRouter = require("../api/users");
const SALT_COUNT = 10;

async function createUser({ username, password }) {
  const hashedPassword = await bcrypt.hash(password, SALT_COUNT);

  try {
    const {
      rows: [user],
    } = await client.query(
      `
            INSERT INTO users(username, password)
            VALUES($1, $2)
            ON CONFLICT (username) DO NOTHING 
            RETURNING id, username
        `,
      [username, hashedPassword]
    );

    return user;
  } catch (error) {
    throw error;
  }
}

async function getUser({ username, password }) {
  try {
    const user = await getUserByUsername(username);
    const hashedPassword = user.password;
    const matching = await bcrypt.compare(password, hashedPassword);

    if (matching) {
      delete user.password;
      return user;
    } else {
      return "";
    }
  } catch (error) {
    throw error;
  }
}

async function getUserByUsername(username) {
  try {
    const { rows } = await client.query(
      `
        SELECT * FROM users
        WHERE username = $1;
        `,
      [username]
    );

    if (!rows || !rows.length) {
      return null;
    }
    const [user] = rows;

    return user;
  } catch (error) {
    throw error;
  }
}

async function getUserById(id) {
  try {
    const {
      rows: [user],
    } = await client.query(
      `
            SELECT * FROM users
            WHERE id = $1;
        `,
      [id]
    );

    delete user.password;
    return user;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  createUser,
  getUser,
  getUserById,
  getUserByUsername,
};
