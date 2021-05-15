const client = require("./client");

async function createActivity({ name, description }) {
  try {
    const {
      rows: [activity],
    } = await client.query(
      `
        INSERT INTO activities(name, description)
        VALUES ($1, $2)
        RETURNING *;
        `,
      [name, description]
    );

    return activity;
  } catch (error) {
    throw error;
  }
}

async function getAllActivities() {
  try {
    const { rows } = await client.query(`
        SELECT * FROM activities;
        `);

    return rows;
  } catch (error) {
    throw error;
  }
}

async function updateActivity({ id, name, description }) {
  try {
    const {
      rows: [activity],
    } = await client.query(
      `
            UPDATE activities
            SET name = $2, description = $3
            WHERE id = $1
            RETURNING *;
        `,
      [id, name, description]
    );

    return activity;
  } catch (error) {
    throw error;
  }
}

async function getActivityById(id) {
  try {
    const {
      rows: [activity],
    } = await client.query(
      `
            SELECT * FROM activities
            WHERE id = $1;
        `,
      [id]
    );

    return activity;
  } catch (error) {
    throw error;
  }
}

async function attachActivitiesToRoutines(routines) {
  const routineArray = [...routines];
  const binds = routines.map((_, index) => `$${index + 1}`).join(", ");
  const routineIds = routines.map((routine) => routine.id);
  if (routineIds.length === 0) {
    return;
  }
  try {
    const { rows: activities } = await client.query(
      `
      SELECT activities.*, routine_activities.duration, routine_activities.count,
      routine_activities.id AS "routineActivityId", routine_activities."routineId"
      FROM activities
      JOIN routine_activities ON routine_activities."activityId" = activities.id
      WHERE routine_activities."routineId" IN (${binds});
    `,
      routineIds
    );
    for (const routine of routineArray) {
      const activitiesMerge = activities.filter(
        (activity) => routine.id === activity.routineId
      );
      routine.activities = activitiesMerge;
    }
    return routineArray;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  createActivity,
  getAllActivities,
  updateActivity,
  getActivityById,
  attachActivitiesToRoutines,
};
