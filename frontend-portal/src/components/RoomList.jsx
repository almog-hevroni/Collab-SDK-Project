import React from "react";
import { Box, Trash2, Eye } from "lucide-react";

export default function RoomList({ rooms, onDeleteRoom }) {
  const getStatusBadge = (room) => {
    const state = room.roomState || {};

    if (state.status === "GAME_OVER") {
      return (
        <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full">
          Game Over {state.winner ? `(${state.winner})` : ""}
        </span>
      );
    }

    if (state.board) {
      return (
        <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">
          In Progress
        </span>
      );
    }

    return <span className="text-gray-400 text-xs">Idle</span>;
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-secondary mb-4 flex items-center gap-2">
        <Box size={24} className="text-primary" /> Active Rooms ({rooms.length})
      </h2>

      {rooms.length === 0 ? (
        <div className="bg-white rounded-lg p-8 text-center border border-gray-200 text-gray-500">
          No active rooms found. Start your game to see rooms here.
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="p-4 font-semibold text-gray-600 text-sm">
                    Room ID
                  </th>
                  <th className="p-4 font-semibold text-gray-600 text-sm">
                    Status
                  </th>
                  <th className="p-4 font-semibold text-gray-600 text-sm">
                    Created
                  </th>
                  <th className="p-4 font-semibold text-gray-600 text-sm">
                    Last Update
                  </th>
                  <th className="p-4 font-semibold text-gray-600 text-sm text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {rooms.map((room) => (
                  <tr
                    key={room._id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="p-4 font-mono font-medium text-primary">
                      {room.roomId}
                    </td>
                    <td className="p-4">{getStatusBadge(room)}</td>
                    <td className="p-4 text-sm text-gray-600">
                      {new Date(room.createdAt).toLocaleString()}
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {new Date(room.lastUpdated).toLocaleString()}
                    </td>
                    <td className="p-4 text-right flex justify-end gap-2">
                      <button
                        onClick={() =>
                          alert(JSON.stringify(room.roomState, null, 2))
                        }
                        className="text-blue-500 hover:bg-blue-50 p-2 rounded-lg transition-colors"
                        title="View State Data"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => onDeleteRoom(room.roomId)}
                        className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                        title="Close Room"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
