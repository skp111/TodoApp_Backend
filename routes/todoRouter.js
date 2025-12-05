const express = require('express');
const todoRouter = express.Router();

const { getTodos, postTodo, updateTodo, deleteTodo } = require('../controller/todoCont');

todoRouter.get('/todo/:_id', getTodos);
todoRouter.post('/todo/create', postTodo);
todoRouter.put('/todo/:_id', updateTodo);
todoRouter.delete('/todo/:_id', deleteTodo);

module.exports = todoRouter;
