import { useState } from "react";

const GroupCard = ({ name, description, members = [], joined, onJoin, groupCode }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white p-4 rounded-xl shadow cursor-pointer">
      {/* Top section */}
      <div onClick={() => setExpanded(!expanded)} className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{name}</h3>
          <p className="text-gray-600 text-sm">{description}</p>
          <p className="text-gray-800 font-medium mt-1">
            {members.length} {members.length === 1 ? "member" : "members"}
          </p>
        </div>
        <button
          onClick={(e) => { 
            e.stopPropagation(); 
            onJoin(); 
          }}
          className={`px-3 py-1 rounded-full text-white text-sm ${
            joined ? "bg-red-500 hover:bg-red-600" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {joined ? "Leave" : "Join"}
        </button>
      </div>

      {/* Expanded members list */}
      {expanded && (
        <div className="mt-3 border-t pt-2">
          <h4 className="text-gray-700 font-medium mb-1">Members:</h4>
          {members.length > 0 ? (
            <ul className="text-gray-600 text-sm list-disc list-inside">
              {members.map((member, index) => (
                <li key={index}>{member}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-sm italic">No members yet</p>
          )}

          {/* Show Group Code if user is joined */}
          {joined && groupCode && (
            <div className="mt-3 p-2 bg-gray-50 rounded-lg border text-gray-700 text-sm">
              <span className="font-medium">Group Code:</span> <span className="text-blue-600">{groupCode}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GroupCard;
