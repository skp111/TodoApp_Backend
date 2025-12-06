const cron = require("node-cron");
const Todo = require("../model/todoModel");
const sendEmail = require("./sendEmail");

// Runs every minute
cron.schedule("* * * * *", async () => {  // Runs every minute
  const now = new Date();  // Current time
  console.log("Running scheduled task to check for due todos at", now);

  const dueTodos = await Todo.find({ // Find todos that are due and not completed (conatisn details of todo as well as user details in createdBy field)
    deadline: { $lte: now }, // Deadline is less than or equal to current time
    status: false,
    emailSent: false
  }).populate("createdBy");

  console.log(`Found ${dueTodos.length} due todos`);

  for (let todo of dueTodos) {
    await sendEmail({
      to: todo.createdBy.email,
      subject: `Task "${todo.task}" is overdue`,
      html: `Your task "${todo.description}" was due at ${todo.deadline}. Please complete it.`,
    });

    todo.emailSent = true;
    await todo.save();
  }
});
