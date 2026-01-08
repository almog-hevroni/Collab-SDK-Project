import React, { useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { Copy, ArrowLeft, RefreshCw, Key } from "lucide-react";
import { toast } from "react-toastify";
import AnalyticsChart from "../components/AnalyticsChart";
import IntegrationGuide from "../components/IntegrationGuide";
import RoomList from "../components/RoomList";

export default function AppDetails() {
  const { id } = useParams();
  const { api } = useContext(AuthContext);

  const [app, setApp] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      // Fetch App Details
      const appRes = await api.get("/apps/my-apps");
      const currentApp = appRes.data.data.find((a) => a._id === id);
      setApp(currentApp);

      // Fetch Rooms
      if (currentApp) {
        const roomRes = await api.get(`/rooms/app/${id}`);
        const fetchedRooms = roomRes.data.data;
        setRooms(fetchedRooms);
        prepareChartData(fetchedRooms);
      }
    } catch (error) {
      toast.error("Error loading details");
    } finally {
      setLoading(false);
    }
  };

  const prepareChartData = (roomsData) => {
    // 1. Initialize map for last 7 days
    const daysMap = new Map();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      daysMap.set(dateStr, 0);
    }

    // 2. Count rooms per day
    roomsData.forEach((room) => {
      const roomDate = new Date(room.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      if (daysMap.has(roomDate)) {
        daysMap.set(roomDate, daysMap.get(roomDate) + 1);
      }
    });

    // 3. Convert to array for Recharts
    const data = Array.from(daysMap).map(([name, count]) => ({ name, count }));
    setChartData(data);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const handleDeleteRoom = async (roomId) => {
    if (
      !window.confirm(
        "Are you sure you want to close this room? Players will be disconnected."
      )
    )
      return;
    try {
      await api.delete(`/rooms/${roomId}`);
      const updatedRooms = rooms.filter((r) => r.roomId !== roomId);
      setRooms(updatedRooms);
      prepareChartData(updatedRooms); // Refresh chart
      toast.success("Room closed successfully");
    } catch (error) {
      toast.error("Failed to delete room");
    }
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (!app) return <div className="p-10 text-center">App not found</div>;

  return (
    <div>
      <Link
        to="/dashboard"
        className="flex items-center text-gray-500 hover:text-primary mb-6 transition-colors"
      >
        <ArrowLeft size={18} className="mr-2" /> Back to Dashboard
      </Link>

      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-secondary mb-2">
              {app.name}
            </h1>
            <p className="text-gray-500 flex items-center gap-2">
              App ID:{" "}
              <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">
                {app._id}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              className="p-2 text-gray-500 hover:bg-slate-50 rounded-full"
              title="Refresh Data"
            >
              <RefreshCw size={20} />
            </button>
          </div>
        </div>

        <div className="mt-8 bg-slate-50 border rounded-lg p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full">
            <div className="bg-amber-100 p-2 rounded-lg text-amber-600">
              <Key size={24} />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                API Key (Secret)
              </p>
              <code className="block text-sm font-mono text-secondary truncate">
                {app.apiKey}
              </code>
            </div>
          </div>
          <button
            onClick={() => copyToClipboard(app.apiKey)}
            className="flex items-center gap-2 px-4 py-2 bg-white border shadow-sm rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            <Copy size={16} /> Copy Key
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <AnalyticsChart chartData={chartData} />
        <IntegrationGuide apiKey={app.apiKey} />
      </div>

      <RoomList rooms={rooms} onDeleteRoom={handleDeleteRoom} />
    </div>
  );
}
