const express = require('express')
const router = express.Router()
const Todo = require('../models/Todo')

// GET /api/todos - list all todos
router.get('/', async (req, res) => {
  try {
    const todos = await Todo.find().sort({ createdAt: -1 })
    res.json(todos)
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

// POST /api/todos - create
router.post('/', async (req, res) => {
  try {
    const { title } = req.body
    if (!title || !title.trim()) return res.status(400).json({ error: 'Title is required' })
    const todo = await Todo.create({ title: title.trim() })
    res.status(201).json(todo)
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

// PUT /api/todos/:id - update title & completed (full update)
router.put('/:id', async (req, res) => {
  try {
    const { title, completed } = req.body
    const update = {}
    if (typeof title === 'string') update.title = title.trim()
    if (typeof completed === 'boolean') update.completed = completed
    const todo = await Todo.findByIdAndUpdate(req.params.id, update, { new: true })
    if (!todo) return res.status(404).json({ error: 'Not found' })
    res.json(todo)
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

// PATCH /api/todos/:id/toggle - toggle completed
router.patch('/:id/toggle', async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id)
    if (!todo) return res.status(404).json({ error: 'Not found' })
    todo.completed = !todo.completed
    await todo.save()
    res.json(todo)
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

// DELETE /api/todos/:id
router.delete('/:id', async (req, res) => {
  try {
    const todo = await Todo.findByIdAndDelete(req.params.id)
    if (!todo) return res.status(404).json({ error: 'Not found' })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

module.exports = router
