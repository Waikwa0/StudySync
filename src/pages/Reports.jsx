// src/pages/Reports.jsx
// src/pages/Reports.jsx
import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import { db, auth } from "../firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { Link } from "react-router-dom";

/** Donut progress component */
const ProgressDonut = ({ percent = 0, size = 140, strokeWidth = 12 }) => {
  const radius = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percent / 100);

  return (
    <svg width={size} height={size}>
      <defs>
        <linearGradient id="donutGrad" x1="0" x2="1">
          <stop offset="0%" stopColor="#2f6fd4" />
          <stop offset="100%" stopColor="#57c6a6" />
        </linearGradient>
      </defs>

      <circle
        cx={cx}
        cy={cy}
        r={radius}
        stroke="#e6eef7"
        strokeWidth={strokeWidth}
        fill="none"
      />
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        stroke="url(#donutGrad)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${cx} ${cy})`}
      />

      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
        <tspan
          x="50%"
          dy="-0.2em"
          style={{ fontSize: "20px", fontWeight: 700, fill: "#1f2937" }}
        >
          {Math.round(percent)}%
        </tspan>
        <tspan
          x="50%"
          dy="1.3em"
          style={{ fontSize: "12px", fill: "#6b7280" }}
        >
          Completed
        </tspan>
      </text>
    </svg>
  );
};

const StatBar = ({ label, value, max, color }) => {
  const pct = max === 0 ? 0 : Math.round((value / max) * 100);

  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-sm text-gray-700">{label}</span>
        <span className="text-sm font-medium text-gray-700">{value}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`${color} h-2 rounded-full`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

export default function Reports() {
  const [isExpanded, setIsExpanded] = useState(true);

  const [groups, setGroups] = useState([]);
  const [groupsLoading, setGroupsLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState("");

  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);

  const userEmail = auth.currentUser?.email;

  /** FETCH GROUPS REAL-TIME */
  useEffect(() => {
    if (!userEmail) return;

    setGroupsLoading(true);
    const q = query(
      collection(db, "groups"),
      where("members", "array-contains", userEmail)
    );

    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setGroups(list);
      setGroupsLoading(false);

      if (selectedGroup && !list.find((g) => g.id === selectedGroup)) {
        setSelectedGroup("");
      }
    });

    return () => unsub();
  }, [userEmail]);

  /** FETCH TASKS REAL-TIME */
  useEffect(() => {
    if (!selectedGroup) {
      setTasks([]);
      return;
    }

    setTasksLoading(true);

    const q = query(
      collection(db, "tasks"),
      where("groupId", "==", selectedGroup)
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setTasks(list);
        setTasksLoading(false);
      },
      (err) => {
        console.error("tasks snapshot error:", err);
        setTasksLoading(false);
      }
    );

    return () => unsub();
  }, [selectedGroup]);

  /** METRICS */
  const metrics = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed === true).length;

    const today = new Date();
    const todayMid = new Date(today.toDateString());

    const overdue = tasks.filter((t) => {
      if (t.completed === true) return false;
      if (!t.dueDate) return false;
      return new Date(t.dueDate) < todayMid;
    }).length;

    const inProgress = total - completed - overdue;

    return { total, completed, overdue, inProgress };
  }, [tasks]);

  /**
   * CONTRIBUTION SUMMARY (robust):
   * - Primary: look for completedBy (string or array)
   * - Fallback: if no completedBy, attribute to assignedTo or createdBy (legacy)
   */
  const memberContributions = useMemo(() => {
    if (!selectedGroup) return [];

    const group = groups.find((g) => g.id === selectedGroup);
    if (!group) return [];

    const members = Array.isArray(group.members) ? group.members : [];

    const completedTasks = tasks.filter((t) => t.completed === true);

    // build counts per member
    const counts = members.map((member) => {
      const count = completedTasks.filter((t) => {
        // 1) if completedBy is array -> includes
        if (Array.isArray(t.completedBy) && t.completedBy.includes(member)) {
          return true;
        }

        // 2) if completedBy is a non-empty string -> equals
        if (typeof t.completedBy === "string" && t.completedBy.trim() !== "") {
          if (t.completedBy.trim() === member) return true;
        }

        // 3) fallback: if no completedBy and assignedTo contains member -> attribute it
        if ((!t.completedBy || t.completedBy === null || (typeof t.completedBy === "string" && t.completedBy.trim() === "")) && Array.isArray(t.assignedTo) && t.assignedTo.includes(member)) {
          return true;
        }

        // 4) another fallback: createdBy (if you want to treat creator as contributor)
        if ((!t.completedBy || t.completedBy === null || (typeof t.completedBy === "string" && t.completedBy.trim() === "")) && t.createdBy && t.createdBy === member) {
          return true;
        }

        return false;
      }).length;

      return { member, completedCount: count };
    });

    const totalCompleted = completedTasks.length || 0;

    return counts.map((c) => ({
      member: c.member,
      completedCount: c.completedCount,
      contributionPercent: totalCompleted === 0 ? 0 : Math.round((c.completedCount / totalCompleted) * 100),
    }));
  }, [tasks, groups, selectedGroup]);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar
        isExpanded={isExpanded}
        onToggle={() => setIsExpanded(!isExpanded)}
        handleLogout={() => {
          auth.signOut();
          window.location.href = "/login";
        }}
      />

      <div className={`transition-all duration-300 p-6 w-full ${isExpanded ? "ml-64" : "ml-20"}`}>
        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Reports</h1>
            <div className="text-sm text-gray-600">
              Group: {selectedGroup ? groups.find((g) => g.id === selectedGroup)?.name || selectedGroup : "—"}
            </div>
          </div>

          <Link to="/dashboard" className="text-sm text-gray-600 hover:underline">Back to Dashboard</Link>
        </div>

        {/* SELECT GROUP + DONUT + STATS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="col-span-2 bg-white p-6 rounded-xl shadow">
            {/* Select Group */}
            <div className="mb-5">
              <label className="block text-sm text-gray-600 mb-1">Select Group</label>

              {groupsLoading ? (
                <div className="text-gray-600">Loading groups...</div>
              ) : (
                <select
                  className="border rounded px-3 py-2 w-64"
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                >
                  <option value="">-- Choose group --</option>
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Metrics */}
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-full md:w-48 flex justify-center">
                <ProgressDonut
                  percent={metrics.total === 0 ? 0 : (metrics.completed / metrics.total) * 100}
                  size={150}
                  strokeWidth={14}
                />
              </div>

              <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded">
                  <div className="text-sm text-gray-500">Total Tasks</div>
                  <div className="text-xl font-semibold text-gray-800">{metrics.total}</div>
                </div>

                <div className="bg-gray-50 p-4 rounded">
                  <div className="text-sm text-gray-500">Completed</div>
                  <div className="text-xl font-semibold text-gray-800">{metrics.completed}</div>
                </div>

                <div className="bg-gray-50 p-4 rounded">
                  <div className="text-sm text-gray-500">Overdue</div>
                  <div className="text-xl font-semibold text-red-600">{metrics.overdue}</div>
                </div>
              </div>
            </div>

            {/* Contribution + Task stats */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contribution */}
              <div className="bg-white border rounded p-4">
                <h3 className="text-md font-semibold mb-3">Individual Contribution Summary</h3>

                {memberContributions.length === 0 ? (
                  <div className="text-sm text-gray-600">No contributions yet.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm table-fixed">
                      <thead>
                        <tr className="text-gray-600">
                          <th className="pb-2 w-1/2 break-words">Member</th>
                          <th className="pb-2 w-1/4">Tasks Completed</th>
                          <th className="pb-2 w-1/4">Contribution</th>
                        </tr>
                      </thead>
                      <tbody>
                        {memberContributions.map((m) => (
                          <tr key={m.member} className="border-t">
                            <td className="py-2 break-words max-w-xs">{m.member}</td>
                            <td className="py-2">{m.completedCount}</td>
                            <td className="py-2">{m.contributionPercent}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Task Statistics */}
              <div className="bg-white border rounded p-4">
                <h3 className="text-md font-semibold mb-3">Task Statistics</h3>

                <div className="space-y-4">
                  <StatBar label="Completed" value={metrics.completed} max={metrics.total} color="bg-green-500" />
                  <StatBar label="In Progress" value={metrics.inProgress} max={metrics.total} color="bg-blue-500" />
                  <StatBar label="Overdue" value={metrics.overdue} max={metrics.total} color="bg-red-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="col-span-1 bg-white p-6 rounded-xl shadow">
            <h3 className="text-md font-semibold text-gray-800 mb-3">Group Insights</h3>
            <p className="text-sm text-gray-600">
              Select a group to view real-time analytics, task progress, and contribution summary.
            </p>
          </div>
        </div>

        {/* Task List */}
        <div className="bg-white p-6 rounded-xl shadow mt-4">
          <h3 className="text-lg font-semibold mb-3">All Tasks</h3>

          {tasksLoading ? (
            <div className="text-gray-600">Loading tasks...</div>
          ) : tasks.length === 0 ? (
            <div className="text-gray-600">No tasks found.</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-gray-600">
                  <th className="py-2 pr-4">Title</th>
                  <th className="py-2 pr-4">Assigned To</th>
                  <th className="py-2 pr-4">Due</th>
                  <th className="py-2 pr-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((t) => (
                  <tr key={t.id} className="border-t">
                    <td className="py-2">{t.title}</td>
                    <td className="py-2">{(t.assignedTo || []).join(", ")}</td>
                    <td className="py-2">{t.dueDate || "-"}</td>
                    <td className="py-2">{t.completed ? "Completed" : "Pending"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
