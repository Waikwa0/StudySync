import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import GroupCard from "../components/GroupCard";
import { db, auth } from "../firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  addDoc,
  query,
  where,
} from "firebase/firestore";

const Groups = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [groups, setGroups] = useState([]);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [joinCode, setJoinCode] = useState("");

  const userId = auth.currentUser?.uid;
  const userEmail = auth.currentUser?.email;

  const handleLogout = () => {
    alert("Logged out!");
  };

  // Fetch groups from Firestore
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const groupsCol = collection(db, "groups");
        const groupsSnapshot = await getDocs(groupsCol);
        const groupsList = groupsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setGroups(groupsList);
      } catch (error) {
        console.error("Error fetching groups:", error);
      }
    };

    fetchGroups();
  }, []);

  // Join a group
  const handleJoinGroup = async (groupId, members) => {
    if (!userId) return;
    if (members?.includes(userEmail)) return;

    const groupRef = doc(db, "groups", groupId);
    await updateDoc(groupRef, { members: arrayUnion(userEmail) });

    setGroups(
      groups.map((g) =>
        g.id === groupId
          ? { ...g, members: [...(g.members || []), userEmail] }
          : g
      )
    );
  };

  // Leave a group (🔥 FIXED)
  const handleLeaveGroup = async (groupId, members) => {
    if (!userId) return;
    if (!members?.includes(userEmail)) return;

    const groupRef = doc(db, "groups", groupId);
    await updateDoc(groupRef, { members: arrayRemove(userEmail) });

    // 🔥 Remove group from UI instantly after leaving
    setGroups((prev) =>
      prev
        .map((g) =>
          g.id === groupId
            ? { ...g, members: g.members.filter((m) => m !== userEmail) }
            : g
        )
        .filter((g) => g.members.includes(userEmail))
    );
  };

  // Create a new group
  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!newGroupName) return;

    // Generate unique group code
    const randomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
    const groupCode = `${newGroupName.slice(0, 4).toUpperCase()}-${randomCode}`;

    const newGroup = {
      name: newGroupName,
      description: newGroupDescription,
      members: [userEmail],
      groupCode,
    };

    const docRef = await addDoc(collection(db, "groups"), newGroup);
    setGroups([...groups, { id: docRef.id, ...newGroup }]);
    setNewGroupName("");
    setNewGroupDescription("");
    alert(`Group created successfully! Your code is ${groupCode}`);
  };

  // Join group by code
  const handleJoinByCode = async (e) => {
    e.preventDefault();
    if (!joinCode) return;

    try {
      const groupsCol = collection(db, "groups");
      const q = query(groupsCol, where("groupCode", "==", joinCode.trim()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        alert("No group found with that code.");
        return;
      }

      const groupDoc = querySnapshot.docs[0];
      const groupData = groupDoc.data();

      if (groupData.members?.includes(userEmail)) {
        alert("You are already a member of this group.");
        return;
      }

      const groupRef = doc(db, "groups", groupDoc.id);
      await updateDoc(groupRef, { members: arrayUnion(userEmail) });

      setGroups([
        ...groups,
        {
          id: groupDoc.id,
          ...groupData,
          members: [...(groupData.members || []), userEmail],
        },
      ]);
      setJoinCode("");
      alert(`Successfully joined group: ${groupData.name}`);
    } catch (error) {
      console.error("Error joining group by code:", error);
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
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Groups</h1>

        {/* Groups Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {groups.map((group) => (
            <GroupCard
              key={group.id}
              name={group.name}
              description={group.description}
              members={group.members || []}
              joined={group.members?.includes(userEmail)}
              onJoin={() =>
                group.members?.includes(userEmail)
                  ? handleLeaveGroup(group.id, group.members)
                  : handleJoinGroup(group.id, group.members)
              }
              groupCode={group.groupCode}
            />
          ))}
        </div>

        {/* Create and Join Group Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Create Group Card */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              Create a new group
            </h2>
            <p className="text-gray-600 mb-4">
              Collaborate with classmates and manage tasks together
            </p>
            <form onSubmit={handleCreateGroup} className="flex flex-col gap-2">
              <input
                type="text"
                placeholder="Group name (APT 3010)"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                className="px-3 py-2 rounded border focus:outline-none"
                required
              />
              <input
                type="text"
                placeholder="Description (Grp 1)"
                value={newGroupDescription}
                onChange={(e) => setNewGroupDescription(e.target.value)}
                className="px-3 py-2 rounded border focus:outline-none"
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mt-2"
              >
                Create
              </button>
            </form>
          </div>

          {/* Join Group by Code */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              Join a group
            </h2>
            <p className="text-gray-600 mb-4">
              Enter a group code shared by a classmate to join instantly
            </p>
            <form onSubmit={handleJoinByCode} className="flex flex-col gap-2">
              <input
                type="text"
                placeholder="Enter group code (e.g. MATH-9FXP)"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                className="px-3 py-2 rounded border focus:outline-none"
                required
              />
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mt-2"
              >
                Join Group
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Groups;
