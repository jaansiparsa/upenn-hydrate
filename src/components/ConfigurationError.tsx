import { AlertCircle, ExternalLink } from "lucide-react";

import React from "react";

export const ConfigurationError: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Configuration Required
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Supabase needs to be configured to use this app
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Setup Instructions:
          </h3>
          <ol className="list-decimal list-inside space-y-3 text-sm text-gray-600">
            <li>
              Create a new project at{" "}
              <a
                href="https://supabase.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-500 inline-flex items-center"
              >
                supabase.com
                <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </li>
            <li>Go to Settings → API</li>
            <li>Copy your Project URL and anon/public key</li>
            <li>
              Create a{" "}
              <code className="bg-gray-100 px-1 rounded">.env.local</code> file
              in the root directory
            </li>
            <li>
              Add these variables:
              <pre className="mt-2 bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                {`VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_access_token`}
              </pre>
            </li>
            <li>
              Get your Mapbox token from{" "}
              <a
                href="https://account.mapbox.com/access-tokens/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-500 inline-flex items-center"
              >
                account.mapbox.com
                <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </li>
            <li>Restart the development server</li>
          </ol>
        </div>

        <div className="text-center">
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Reload Page
          </button>
        </div>
      </div>
    </div>
  );
};
