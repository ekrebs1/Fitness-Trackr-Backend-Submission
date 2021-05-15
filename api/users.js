require("dotenv").config();
const express = require("express");
const usersRouter = express.Router();

const {
  getUserByUsername,
  createUser,
  getUser,
  getPublicRoutinesByUser,
} = require("../db");

const jwt = require("jsonwebtoken");
const { requireUser } = require("./utils");
const { JWT_SECRET } = process.env;
// const bcrypt = require('bcrypt')

usersRouter.post("/register", async (req, res, next) => {
  const { username, password } = req.body;

  try {
    const checkUsername = await getUserByUsername(username);
    if (checkUsername) {
      res.status(401);
      next({
        name: "UserExistsError",
        message: "A user by that username already exists",
      });
    } else if (password.length < 8) {
      next({
        name: "ShortPassword",
        message: "Password Too Short!",
      });
    } else {
      const user = await createUser({ username, password });
      console.log(user, "THIS IS A DIFFERENT USERS");
      if (!user) {
        next({
          name: "UserCreationError",
          message: "Unable to create user",
        });
      } else {
        const token = jwt.sign(
          {
            id: user.id,
            username: user.username,
          },
          process.env.JWT_SECRET,
          {
            expiresIn: "1w",
          }
        );
        res.send({
          user,
          message: "thank you for signing up",
          token,
        });
      }
    }
  } catch (error) {
    next(error);
  }
});

usersRouter.post("/login", async (req, res, next) => {
  const { username, password } = req.body;
  if (!username || !password) {
    next({ message: "Username and Password are required" });
    return;
  }
  try {
    const user = await getUser({ username, password });
    if (user) {
      const token = jwt.sign(
        {
          id: user.id,
          username: user.username,
        },
        JWT_SECRET
      );
      res.send({ message: "You are logged in!", token });
      return;
    } else {
      next({ message: "The Username or Password were not correct" });
      return;
    }
  } catch ({ message }) {
    next({ message });
  }
});

usersRouter.get("/me", requireUser, async (req, res, next) => {
  try {
    res.send(req.user);
  } catch (error) {
    next(error);
  }
});

usersRouter.get("/:username/routines", async (req, res, next) => {
  const { username } = req.params;
  try {
    const routines = await getPublicRoutinesByUser({ username });
    res.send(routines);
  } catch (error) {
    next(error);
  }
});
module.exports = usersRouter;
