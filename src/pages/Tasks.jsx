import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { db, auth } from "../firebase";
import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
  updateDoc,
  doc,
} from "firebase/firestore";

const Tasks = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    dueDate: "",
    assignedTo: "",
  });

  const userEmail = auth.currentUser?.email;

  const handleLogout = () => {
    alert("Logged out!");
  };

  // Fetch groups the user belongs to
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const q = query(
          collection(db, "groups"),
          where("members", "array-contains", userEmail)
        );
        const querySnapshot = await getDocs(q);
        const groupList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setGroups(groupList);
      } catch (error) {
        console.error("Error fetching groups:", error);
      }
    };

    if (userEmail) fetchGroups();
  }, [userEmail]);

  // Fetch tasks for selected group
  useEffect(() => {
    const fetchTasks = async () => {
      if (!selectedGroup) return;

      try {
        const q = query(
          collection(db, "tasks"),
          where("groupId", "==", selectedGroup)
        );
        const querySnapshot = await getDocs(q);
        const taskList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTasks(taskList);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    fetchTasks();
  }, [selectedGroup]);

  // Add a new task
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!selectedGroup) return alert("Please select a group first.");

    try {
      const newTaskData = {
        title: newTask.title,
        description: newTask.description,
        dueDate: newTask.dueDate,
        assignedTo: newTask.assignedTo ? [newTask.assignedTo] : [],
        groupId: selectedGroup,

        // readable status
        status: "Pending",
        completed: false,

        // 🔥 NEW: Track who completed tasks (initially nobody)
        completedBy: null,
      };

      const docRef = await addDoc(collection(db, "tasks"), newTaskData);
      setTasks([...tasks, { id: docRef.id, ...newTaskData }]);
      setNewTask({ title: "", description: "", dueDate: "", assignedTo: "" });
      alert("Task added successfully!");
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  // Toggle task completion
  const toggleTaskCompletion = async (taskId, currentStatus) => {
    try {
      const taskRef = doc(db, "tasks", taskId);

      const isCompleted = currentStatus === "Completed";

      const newStatus = isCompleted ? "Pending" : "Completed";

      const updatePayload = {
        status: newStatus,
        completed: newStatus === "Completed",
        completedBy: newStatus === "Completed" ? userEmail : null, // 🔥 store who completed it
      };

      await updateDoc(taskRef, updatePayload);

      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? { ...t, ...updatePayload }
            : t
        )
      );
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar
        isExpanded={isExpanded}
        onToggle={() => setIsExpanded(!isExpanded)}
        handleLogout={handleLogout}
      />

      <div
        className={`transition-all duration-300 p-6 w-full ${
          isExpanded ? "ml-64" : "ml-20"
        }`}
      >
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Tasks</h1>

        {/* Select Group */}
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">
            Select a Group
          </label>
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="border rounded px-3 py-2 w-full"
          >
            <option value="">-- Choose a Group --</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </div>

        {/* Tasks List */}
        {selectedGroup && (
          <>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              Tasks for this Group
            </h2>

            {tasks.length === 0 ? (
              <p className="text-gray-600 mb-6">
                No tasks found. Create one below.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="bg-white p-4 rounded-xl shadow hover:shadow-md flex flex-col justify-between"
                  >
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        {task.title}
                      </h3>

                      <p className="text-gray-600 text-sm mb-2">
                        {task.description}
                      </p>

                      <p className="text-sm text-gray-700">
                        <strong>Due:</strong> {task.dueDate}
                      </p>

                      <p className="text-sm text-gray-700">
                        <strong>Assigned To:</strong>{" "}
                        {task.assignedTo?.join(", ") || "Unassigned"}
                      </p>

                      <p className="text-sm text-gray-700 mb-3">
                        <strong>Status:</strong>{" "}
                        <span
                          className={`px-3 py-1 rounded-full text-white text-xs ${
                            task.status === "Completed"
                              ? "bg-green-500"
                              : "bg-yellow-500"
                          }`}
                        >
                          {task.status}
                        </span>
                      </p>
                    </div>

                    <button
                      onClick={() =>
                        toggleTaskCompletion(task.id, task.status)
                      }
                      className={`mt-3 w-full text-center ${
                        task.status === "Completed"
                          ? "bg-green-500 hover:bg-green-600"
                          : "bg-gray-400 hover:bg-gray-500"
                      } text-white px-3 py-2 rounded`}
                    >
                      {task.status === "Completed"
                        ? "Mark as Pending"
                        : "Mark as Completed"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Add Task Form */}
        {selectedGroup && (
          <div className="bg-white p-6 rounded-xl shadow max-w-xl mx-auto">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              Add a New Task
            </h2>

            <form onSubmit={handleAddTask} className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Task title"
                value={newTask.title}
                onChange={(e) =>
                  setNewTask({ ...newTask, title: e.target.value })
                }
                className="border rounded px-3 py-2"
                required
              />

              <textarea
                placeholder="Task description"
                value={newTask.description}
                onChange={(e) =>
                  setNewTask({ ...newTask, description: e.target.value })
                }
                className="border rounded px-3 py-2"
              />

              <input
                type="date"
                value={newTask.dueDate}
                onChange={(e) =>
                  setNewTask({ ...newTask, dueDate: e.target.value })
                }
                className="border rounded px-3 py-2"
                required
              />

              <input
                type="email"
                placeholder="Assign to (email)"
                value={newTask.assignedTo}
                onChange={(e) =>
                  setNewTask({ ...newTask, assignedTo: e.target.value })
                }
                className="border rounded px-3 py-2"
              />

              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Add Task
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tasks;
