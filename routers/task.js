const express = require("express");
const Task = require("../models/Task");
const auth = require("../middleware/auth");

// express router
const router = new express.Router();

// Create task
router.post("/tasks", auth, async (req, res) => {
  const task = new Task({
    ...req.body,
    owner: req.user._id,
  });

  try {
    await task.save();
    res.status(201).send(task);
  } catch (e) {
    res.status(400).send(e);
  }
});

// filtering data
// GET /tasks?completed=true
// GET /tasks?limit=5&skip=0
// GET /taks?sortBy=createdAt:desc

// Read all tasks
router.get("/tasks", auth, async (req, res) => {
  const match = {};
  const sort = {};

  if (req.query.completed) {
    match.completed = req.query.completed === "true" ? true : false;
  }

  if (req.query.sortBy) {
    const parts = req.query.sortBy.split(":");
    sort[parts[0]] = parts[1] === "desc" ? -1 : 1;
  } else {
    sort["createdAt"] = -1;
  }

  try {
    await req.user
      .populate({
        path: "tasks",
        match,
        options: {
          limit: parseInt(req.query.limit),
          skip: parseInt(req.query.skip),
          sort,
        },
      })
      .execPopulate();
    res.status(200).send(req.user.tasks);
  } catch (e) {
    res.status(400).send(e);
  }
});

// Read single task
router.get("/tasks/:id", auth, async (req, res) => {
  const _id = req.params.id;

  try {
    const task = await Task.findOne({ _id, owner: req.user._id });

    if (!task) {
      return res.status(404).send();
    }

    res.send(task);
  } catch (e) {
    res.status(500).send(e);
  }
});

// Update the task
router.put("/tasks/:id", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowUpdates = ["description", "completed"];

  const isMatched = updates.every((update) => allowUpdates.includes(update));

  if (!isMatched) {
    return res.status(400).send({ error: "Invalid Updates" });
  }

  try {
    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!task) {
      return res.status(404).send();
    }

    updates.forEach((update) => (task[update] = req.body[update]));
    await task.save();
    res.status(200).send(task);
  } catch (e) {
    res.status(404).send(e);
  }
});

// Delete the task
router.delete("/tasks/:id", auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!task) {
      return res.status(404).send({ error: "task not found!" });
    }

    res.send(task);
  } catch (e) {
    res.status(500).send(e);
  }
});

module.exports = router;
