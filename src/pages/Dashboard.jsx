import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { auth, db } from "../firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";

const Dashboard = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [userGroupsCount, setUserGroupsCount] = useState(0);
  const [pendingTasks, setPendingTasks] = useState(0);
  const [completedTasks, setCompletedTasks] = useState(0);

  const handleLogout = async () => {
    await auth.signOut();
    window.location.href = "/login";
  };

  useEffect(() => {
    if (!auth.currentUser) return;

    // 🔹 Real-time listener for groups the user belongs to
    const groupsRef = collection(db, "groups");
    const groupsQuery = query(
      groupsRef,
      where("members", "array-contains", auth.currentUser.email)
    );

    const unsubscribeGroups = onSnapshot(groupsQuery, (snapshot) => {
      setUserGroupsCount(snapshot.size);
    });

    // 🔹 Real-time listener for tasks assigned to the user
    const tasksRef = collection(db, "tasks");
    const tasksQuery = query(
      tasksRef,
      where("assignedTo", "array-contains", auth.currentUser.email)
    );

    const unsubscribeTasks = onSnapshot(tasksQuery, (snapshot) => {
      const tasksList = snapshot.docs.map((doc) => doc.data());
      const completed = tasksList.filter((t) => t.status === "Completed").length;
      const pending = tasksList.filter((t) => t.status === "Pending").length;

      setCompletedTasks(completed);
      setPendingTasks(pending);
    });

    return () => {
      unsubscribeGroups();
      unsubscribeTasks();
    };
  }, []);

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
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

        {/* Top Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          {/* Groups Card */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Groups</h2>
            <p className="text-gray-600 text-sm mb-3">
              Manage and collaborate with study groups
            </p>
            <p className="text-gray-800 font-medium mb-2">
              {userGroupsCount} {userGroupsCount === 1 ? "group" : "groups"}
            </p>
            <Link to="/groups">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                View Groups
              </button>
            </Link>
          </div>

          {/* Tasks Card */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Tasks</h2>
            <p className="text-gray-600 text-sm mb-3">
              Track assignments & deadlines
            </p>
            <p className="text-gray-800 font-medium mb-1">
              {pendingTasks} pending task{pendingTasks !== 1 ? "s" : ""}
            </p>
            <p className="text-gray-800 font-medium mb-2">
              {completedTasks} completed
            </p>
            <Link to="/tasks">
              <button className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700">
                View Tasks
              </button>
            </Link>
          </div>

          {/* Progress Report Card */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              Progress Report
            </h2>
            <p className="text-gray-600 text-sm mb-3">
              Review performance insights
            </p>
            <Link to="/reports">
              <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
                View Report
              </button>
            </Link>
          </div>
        </div>

        {/* Create Group Section */}
        <div className="bg-white p-8 rounded-xl shadow-lg text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">
            Start a new study group
          </h2>
          <p className="text-gray-600 mb-5">
            Collaborate with classmates and manage tasks together
          </p>
          <Link to="/groups">
            <button className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 text-lg font-medium">
              ➕ Create Group
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
