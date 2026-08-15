// This is for unit testing

// I am directly testing:
// - getAll()
// - findById()
// - getByStatus()
// - getPaginated
// - getStats()
// - create()
// - update()
// - remove()
// - completeTask
// - reset

const taskService = require("../src/services/taskService")

describe("Task Service", () => {

    beforeEach(() => {
        //for _reset
        taskService._reset()
    })

    //for create task
    test("it will create a task", () => {
        const task = taskService.create({
            title: "Learn react"
        })

        expect(task).toHaveProperty("id")
        expect(task.title).toBe("Learn react")
        expect(task.status).toBe("todo")
        expect(task.priority).toBe("medium")
    })


    //for task get By Status
    test("it will return tasks by status", () => {
        taskService.create({
            title: "Task 1",
            status: "todo"
        })

        taskService.create({
            title: "Task 2",
            status: "done"
        })

        taskService.create({
            title: "Task 3",
            status: "todo"
        })

        const tasks = taskService.getByStatus("todo")

        expect(tasks).toHaveLength(2)
        expect(tasks[0].status).toBe("todo")
        expect(tasks[1].status).toBe("todo")
    })


    //for task get by pagilation
    test("it will return paginated tasks", () => {
        for (let i = 1; i <= 15; i++) {
            taskService.create({
                title: `Task ${i}`
            })
        }

        const tasks = taskService.getPaginated(1, 10)

        expect(tasks).toHaveLength(10)
        expect(tasks[0].title).toBe("Task 1")
        expect(tasks[9].title).toBe("Task 10")
    })


    // for get all task
    test("it will return all tasks", () => {
        taskService.create({
            title: "Task 1"
        })

        taskService.create({
            title: "Task 2"
        })

        const tasks = taskService.getAll()

        expect(tasks).toHaveLength(2)
    })


    //for task get by Id
    test("it will find a task by id", () => {
        const createdTask = taskService.create({
            title: "Learn Jest"
        })

        const task = taskService.findById(createdTask.id)

        expect(task).toBeDefined()
        expect(task.id).toBe(createdTask.id)
        expect(task.title).toBe("Learn Jest")
    })


    //for task not found
    test("it will return undefined when task does not exist", () => {
        const task = taskService.findById("does not exist")

        expect(task).toBeUndefined()
    })

    //for update task
    test("should update a task", () => {
        const createdTask = taskService.create({
            title: "Learn Jest"
        })

        const updatedTask = taskService.update(createdTask.id, {
            title: "Learn Jest Properly",
            priority: "high"
        })

        expect(updatedTask.title).toBe("Learn Jest Properly")
        expect(updatedTask.priority).toBe("high")
        expect(updatedTask.id).toBe(createdTask.id)
    })

    // for task not found while updating
    test("it will return null when updating a task that does not exist", () => {
        const result = taskService.update("does not exist", {
            title: "Something",
        })

        expect(result).toBeNull()
    })


    //for task remove
    test("it will remove a task", () => {
        const createdTask = taskService.create({
            title: "Delete me"
        })

        const result = taskService.remove(createdTask.id)

        expect(result).toBe(true)
        expect(taskService.findById(createdTask.id)).toBeUndefined()
    })


    //for task not found while removing
    test("it will return false when removing a task that does not exist", () => {
        const result = taskService.remove("does-not-exist")

        expect(result).toBe(false)
    })


    //for get all task status 
    test("it will return all tasks status", () => {
        taskService.create({
            title: "Task 1",
            status: "todo"
        })

        taskService.create({
            title: "Task 2",
            status: "in_progress"
        })

        taskService.create({
            title: "Task 3",
            status: "done"
        })

        taskService.create({
            title: "Task 4",
            status: "todo"
        })

        const stats = taskService.getStats()

        expect(stats.todo).toBe(2)
        expect(stats.in_progress).toBe(1)
        expect(stats.done).toBe(1)
        expect(stats.overdue).toBe(0)
    })


    //for get task overdue 
    test("it will count overdue tasks", () => {
        taskService.create({
            title: "Overdue task",
            status: "todo",
            dueDate: "2020-01-01T00:00:00.000Z"
        })

        taskService.create({
            title: "Completed task",
            status: "done",
            dueDate: "2020-01-01T00:00:00.000Z"
        })

        const stats = taskService.getStats()

        expect(stats.overdue).toBe(1)
    })

    //for complete task
    test("it will complete a task", () => {
        const createdTask = taskService.create({
            title: "Complete me",
            status: "in_progress",
            priority: "high"
        })

        const completedTask = taskService.completeTask(createdTask.id)

        expect(completedTask.status).toBe("done")
        expect(completedTask.completedAt).not.toBeNull()
        expect(completedTask.priority).toBe("medium")
    })


    //for completing task that does not exist
    test("it will return null when completing a task that does not exist", () => {
        const result = taskService.completeTask("does-not-exist")

        expect(result).toBeNull()
    })

})