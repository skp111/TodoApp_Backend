const Todo = require('../model/todoModel');

// GET TODOS
exports.getTodos = async (req, res) => {
    try {
        const { _id } = req.params;
        if (!_id)
            return res.status(401).json({ success: false, message: "No user id provided" });
        const todos = await Todo.find({ createdBy: _id });
        if (!todos)
            return res.status(401).json({ success: false, message: "No todos found" });
        res.status(200).json({ success: true, message: "Todos fetched successfully", todos });
    } catch (error) {
        console.log(error);
        res.status(400).json({ success: false, message: error.message });
    }
};

// CREATE TODO
exports.postTodo = async (req, res) => {
    try {
        const { task, description, deadline, createdBy } = req.body;
        if(!createdBy)
            return res.status(401).json({ success: false, message: "No user id provided" });
        if (!task || !description || !deadline)
            return res.status(401).json({ success: false, message: "All fields are required" });
        const todo = new Todo({ task, description, deadline, createdBy });
        const result = await todo.save();
        res.status(201).json({ success: true, message: "Todo added successfully", result });
    } catch (error) {
        console.log(error);
        res.status(400).json({ success: false, message: error.message });
    }
};

// UPDATE TODO
exports.updateTodo = async (req, res) => {
    try {
        const { _id } = req.params;
        if (!_id)
            return res.status(401).json({ success: false, message: "No todo id provided" });
        const { task, description, deadline, status } = req.body;
        if (!task || !description || !deadline)
            return res.status(401).json({ success: false, message: "All fields are required" });
        const todo = await Todo.findByIdAndUpdate(_id, { task, description, deadline, status }, { new: true });
        if (!todo)
            return res.status(401).json({ success: false, message: "Todo not found" });
        res.status(201).json({ success: true, message: "Todo updated successfully", todo });
    } catch (error) {
        console.log(error);
        res.status(400).json({ success: false, message: error.message });
    }
};

// DELETE TODO
exports.deleteTodo = async (req, res) => {
    try {
        const { _id } = req.params;
        if (!_id)
            return res.status(401).json({ success: false, message: "No todo id provided" });
        const todo = await Todo.findByIdAndDelete(_id);
        if (!todo)
            return res.status(401).json({ success: false, message: "Todo not found" });
        res.status(201).json({ success: true, message: "Todo deleted successfully" });
    } catch (error) {
        console.log(error);
        res.status(400).json({ success: false, message: error.message });
    }
};
