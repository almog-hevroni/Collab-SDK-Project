import React from "react";
import { ExternalLink } from "lucide-react";

export default function IntegrationGuide({ apiKey }) {
  return (
    <div className="bg-slate-900 rounded-xl p-6 text-slate-300 flex flex-col">
      <h3 className="text-white font-bold mb-4 flex items-center gap-2">
        <ExternalLink size={18} /> Integration Guide
      </h3>
      <p className="mb-4 text-sm text-slate-400">
        Copy this code snippet into your Android Application class or
        MainActivity to initialize the SDK.
      </p>
      <div className="flex-1 bg-slate-800 rounded-lg p-4 font-mono text-xs overflow-auto">
        <pre>{`// In MainActivity.kt

override fun onCreate() {
    super.onCreate()
    
    // Initialize with your API Key
    CollabSession.initialize(
        "${apiKey}"
    )
}`}</pre>
      </div>
    </div>
  );
}
