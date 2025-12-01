import { NavLink } from "react-router-dom";
import { 
  FiMenu, 
  FiHome, 
  FiUsers, 
  FiList, 
  FiBarChart2, 
  FiFileText,
  FiRefreshCw
} from "react-icons/fi";

const Sidebar = ({ isExpanded, onToggle }) => {
  return (
    <div
      className={`h-screen bg-[#0A2A43] text-white flex flex-col transition-all duration-300
      ${isExpanded ? "w-64" : "w-20"} fixed left-0 top-0`}
    >
      {/* Logo + Toggle */}
      <div className="flex items-center gap-2 p-4">
        <FiRefreshCw size={26} className="text-white" />

        {isExpanded && (
          <h1 className="font-bold text-lg tracking-wide">
            STUDYSYNC
          </h1>
        )}

        {/* Toggle Button */}
        <button onClick={onToggle} className="ml-auto">
          <FiMenu size={22} />
        </button>
      </div>

      {/* Nav Links */}
      <nav className="flex flex-col gap-2 mt-4">
        <NavLink
          to="/dashboard"
          className="flex items-center gap-3 hover:bg-blue-700 px-4 py-3 rounded-md"
        >
          <FiHome size={22} /> {isExpanded && "Dashboard"}
        </NavLink>

        <NavLink
          to="/groups"
          className="flex items-center gap-3 hover:bg-blue-700 px-4 py-3 rounded-md"
        >
          <FiUsers size={22} /> {isExpanded && "Groups"}
        </NavLink>

        <NavLink
          to="/tasks"
          className="flex items-center gap-3 hover:bg-blue-700 px-4 py-3 rounded-md"
        >
          <FiList size={22} /> {isExpanded && "Tasks"}
        </NavLink>

        <NavLink
          to="/reports"
          className="flex items-center gap-3 hover:bg-blue-700 px-4 py-3 rounded-md"
        >
          <FiBarChart2 size={22} /> {isExpanded && "Reports"}
        </NavLink>

        <NavLink
          to="/contributions"
          className="flex items-center gap-3 hover:bg-blue-700 px-4 py-3 rounded-md"
        >
          <FiFileText size={22} /> {isExpanded && "Contributions"}
        </NavLink>
      </nav>
    </div>
  );
};

export default Sidebar;
