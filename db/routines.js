const client = require("./client");
const { attachActivitiesToRoutines } = require("./activities");
//const utilFile = require("./util");

async function getRoutineById(id) {
  // getRoutineById(id)
  // return the routine
  try {
    const {
      rows: [routine],
    } = await client.query(
      `
                SELECT *
                FROM routines
                WHERE id=$1;
                `,
      [id]
    );
    // if (!routine) {
    //     return null
    // }
    return routine;
  } catch (error) {
    throw error;
  }
}

async function getRoutinesWithoutActivities() {
  // select and return an array of all routines
  try {
    const { rows: routines } = await client.query(`
        SELECT *
        FROM routines
        `);
    return routines;
  } catch (error) {
    throw error;
  }
}
async function getAllRoutines() {
  // select and return an array of all routines, include their activities
  try {
    const { rows: routines } = await client.query(`
        SELECT routines.*, users.username AS "creatorName"
        FROM routines
        JOIN users on routines."creatorId" = users.id
    `);
    return await attachActivitiesToRoutines(routines);
  } catch (error) {
    throw error;
  }
}
async function getAllPublicRoutines() {
  // select and return an array of public routines, include their activities
  ///tests below
  //✕ selects and returns an array of all public routines, includes their activities (1 ms)
  //✕ includes username, from users join, aliased as creatorName (1 ms)
  //✕ includes duration and count on activities, from routine_activities join
  try {
    const { rows: routines } = await client.query(`
                SELECT routines.*, users.username AS "creatorName"
                FROM routines
                JOIN users ON routines."creatorId"=users.id
                WHERE "isPublic" = true;
                `);
    return await attachActivitiesToRoutines(routines);
  } catch (error) {
    throw error;
  }
}
async function getAllRoutinesByUser({ username }) {
  // select and return an array of all routines made by user, include their activities
  //Tests
  // ✕ selects and return an array of all routines made by user, includes their activities (1 ms)
  // ✕ includes username, from users join, aliased as creatorName
  // ✕ includes duration and count on activities, from routine_activities join
  try {
    //gets single user by username
    //gets a routine with an id (no activities)
    const { rows: routines } = await client.query(
      `
        SELECT routines.*, users.username AS "creatorName"
        FROM routines
        JOIN users ON "creatorId" = users.id
        WHERE users.username=$1
    `,
      [username]
    );
    return await attachActivitiesToRoutines(routines);
  } catch (error) {
    throw error;
  }
}
async function getPublicRoutinesByUser({ username }) {
  // select and return an array of public routines made by user, include their activities
  // ✕ selects and returns an array of all routines made by user, includes their activities (1 ms)
  // ✕ includes username, from users join, aliased as creatorName
  // ✕ includes duration and count on activities, from routine_activities join
  try {
    const { rows: routines } = await client.query(
      `
        SELECT routines.*, users.username AS "creatorName"
        FROM routines
        JOIN users ON "creatorId" = users.id
        WHERE users.username=$1 AND "isPublic" = true;
    `,
      [username]
    );
    return await attachActivitiesToRoutines(routines);
  } catch (error) {
    throw error;
  }
}
async function getPublicRoutinesByActivity({ id }) {
  // select and return an array of public routines which have a specific activityId in their routine_activities join, include their activities
  // ✕ selects and return an array of public routines which have a specific activityId in their routine_activities join, includes their activities (1 ms)
  // ✕ includes username, from users join, aliased as creatorName
  // ✕ includes duration and count on activities, from routine_activities join
  try {
    const { rows: routines } = await client.query(`
                SELECT routines.*, users.username AS "creatorName"
                FROM routines
                JOIN users ON routines."creatorId"=users.id
                WHERE "isPublic";
                `);
    return await attachActivitiesToRoutines(routines);
  } catch (error) {
    throw error;
  }
}
async function createRoutine({ creatorId, isPublic, name, goal }) {
  // create and return the new routine
  try {
    const {
      rows: [routine],
    } = await client.query(
      `
        INSERT INTO routines("creatorId", "isPublic", name, goal)
        VALUES($1, $2, $3, $4)
        RETURNING *;
      `,
      [creatorId, isPublic, name, goal]
    );
    return routine;
  } catch (error) {
    throw error;
  }
}

async function updateRoutine(fields) {
  const { id } = fields;
  delete fields.id;

  const setString = Object.keys(fields)
    .map((key, index) => `"${key}"=$${index + 1}`)
    .join(", ");

  try {
    const {
      rows: [updatedRoutine],
    } = await client.query(
      `
            UPDATE routines
            SET ${setString}
            WHERE id = ${id}
            RETURNING*;
        `,
      Object.values(fields)
    );

    return updatedRoutine;
  } catch (error) {
    throw error;
  }
}

async function destroyRoutine(id) {
  try {
    const routineId = getRoutineById(id);
    if (!routineId) {
      throw { message: "Error this routine doesnt exist" };
    }
    await client.query(
      `
          DELETE FROM routine_activities
          WHERE "routineId"=$1;
          `,
      [id]
    );
    const {
      rows: [routine],
    } = await client.query(
      `
          DELETE FROM routines
          WHERE id=$1
          RETURNING *;
          `,
      [id]
    );
    return routine;
  } catch {
    throw error;
  }
}
module.exports = {
  client,
  getRoutineById,
  getRoutinesWithoutActivities,
  getAllRoutines,
  getAllPublicRoutines,
  getAllRoutinesByUser,
  getPublicRoutinesByUser,
  getPublicRoutinesByActivity,
  createRoutine,
  updateRoutine,
  destroyRoutine,
};
