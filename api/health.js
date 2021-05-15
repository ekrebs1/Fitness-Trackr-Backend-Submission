const express = require("express");
const healthRouter = express.Router();

healthRouter.get("/", async (req, res, next) => {
  try {
    res.json({
      message: "Server is Healthy",
    });
  } catch (error) {
    next(error);
  }
});

module.exports = healthRouter;
