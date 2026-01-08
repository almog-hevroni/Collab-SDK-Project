import React from "react";
import { Box, Trash2 } from "lucide-react";

export default function RoomList({ rooms, onDeleteRoom }) {
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
                    <td className="p-4 text-sm text-gray-600">
                      {new Date(room.createdAt).toLocaleString()}
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {new Date(room.lastUpdated).toLocaleString()}
                    </td>
                    <td className="p-4 text-right">
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
