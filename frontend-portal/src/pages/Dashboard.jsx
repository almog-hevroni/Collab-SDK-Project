import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { Plus, Server, ArrowRight, Loader } from "lucide-react";
import { toast } from "react-toastify";

export default function Dashboard() {
  const { api } = useContext(AuthContext);
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newAppName, setNewAppName] = useState("");

  useEffect(() => {
    fetchApps();
  }, []);

  const fetchApps = async () => {
    try {
      const res = await api.get("/apps/my-apps");
      setApps(res.data.data);
    } catch (error) {
      toast.error("Failed to load apps");
    } finally {
      setLoading(false);
    }
  };

  const createNewApp = async (e) => {
    e.preventDefault();
    if (!newAppName.trim()) return;

    try {
      const res = await api.post("/apps/register", { name: newAppName });
      setApps([...apps, res.data.app]);
      setNewAppName("");
      setShowModal(false);
      toast.success("App created successfully!");
    } catch (error) {
      toast.error("Failed to create app");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-secondary">My Apps</h1>
          <p className="text-gray-500">Manage your integrated applications</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 font-medium shadow-md transition-all hover:shadow-lg"
        >
          <Plus size={20} /> Create New App
        </button>
      </div>

      {apps.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border-2 border-dashed border-gray-200">
          <div className="w-16 h-16 bg-blue-50 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <Server size={32} />
          </div>
          <h3 className="text-xl font-semibold text-secondary mb-2">
            No Apps Yet
          </h3>
          <p className="text-gray-500 mb-6">
            Create your first app to get an API Key.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="text-primary font-medium hover:underline"
          >
            Create App Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {apps.map((app) => (
            <Link
              key={app._id}
              to={`/app/${app._id}`}
              className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                  {app.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">
                  Active
                </div>
              </div>

              <h3 className="text-xl font-bold text-secondary mb-1 group-hover:text-primary transition-colors">
                {app.name}
              </h3>
              <p className="text-sm text-gray-500 mb-4 truncate">
                ID: {app._id}
              </p>

              <div className="flex items-center text-primary font-medium text-sm mt-4">
                View Details <ArrowRight size={16} className="ml-1" />
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl animate-fade-in">
            <h2 className="text-2xl font-bold mb-4">Create New App</h2>
            <form onSubmit={createNewApp}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  App Name
                </label>
                <input
                  type="text"
                  className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-primary/50 outline-none"
                  placeholder="e.g. Tic Tac Toe Pro"
                  value={newAppName}
                  onChange={(e) => setNewAppName(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newAppName.trim()}
                  className="bg-primary hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50"
                >
                  Create App
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
