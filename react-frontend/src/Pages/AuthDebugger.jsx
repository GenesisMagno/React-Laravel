import React, { useState } from 'react';
import api, { debugCookies, debugRequest, testLogin, testProtectedRoute, setTokenManually, clearTokens } from './axios'; // Adjust import path

const AuthDebugger = () => {
  const [results, setResults] = useState([]);
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [manualToken, setManualToken] = useState('');
  const [loading, setLoading] = useState(false);

  const addResult = (test, success, data, error = null) => {
    const result = {
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString(),
      test,
      success,
      data,
      error
    };
    setResults(prev => [result, ...prev]);
    return result;
  };

  const runTest = async (testName, testFn) => {
    setLoading(true);
    try {
      const result = await testFn();
      addResult(testName, true, result);
    } catch (error) {
      addResult(testName, false, null, error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const tests = [
    {
      name: 'Check Cookies',
      fn: () => {
        const cookies = debugCookies();
        return { cookies, hasJWT: !!cookies.jwt_token };
      }
    },
    {
      name: 'Test Connectivity',
      fn: () => debugRequest()
    },
    {
      name: 'Test Login',
      fn: () => {
        if (!credentials.email || !credentials.password) {
          throw new Error('Please enter email and password');
        }
        return testLogin(credentials);
      }
    },
    {
      name: 'Test Protected Route (/user)',
      fn: () => testProtectedRoute()
    },
    {
      name: 'Manual API Call to /user',
      fn: async () => {
        const response = await api.get('/user');
        return response.data;
      }
    }
  ];

  const clearResults = () => setResults([]);

  const handleManualToken = () => {
    if (manualToken.trim()) {
      setTokenManually(manualToken.trim());
      addResult('Manual Token Set', true, { token: manualToken.substring(0, 30) + '...' });
    }
  };

  const handleClearTokens = () => {
    clearTokens();
    addResult('Tokens Cleared', true, { message: 'All tokens cleared from localStorage' });
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">JWT Authentication Debugger</h1>
      
      {/* Controls */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
        
        {/* Credentials */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input
            type="email"
            placeholder="Email"
            value={credentials.email}
            onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={credentials.password}
            onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Manual Token */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Manual JWT Token (if needed)"
            value={manualToken}
            onChange={(e) => setManualToken(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleManualToken}
              disabled={!manualToken.trim()}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300"
            >
              Set Manual Token
            </button>
            <button
              onClick={handleClearTokens}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
            >
              Clear All Tokens
            </button>
          </div>
        </div>

        {/* Test Buttons */}
        <div className="flex flex-wrap gap-2 mb-4">
          {tests.map((test) => (
            <button
              key={test.name}
              onClick={() => runTest(test.name, test.fn)}
              disabled={loading}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-300"
            >
              {test.name}
            </button>
          ))}
        </div>

        <button
          onClick={clearResults}
          className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
        >
          Clear Results
        </button>
      </div>

      {/* Results */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Test Results</h2>
        
        {loading && (
          <div className="text-blue-500 mb-4">Running test...</div>
        )}

        {results.length === 0 ? (
          <p className="text-gray-500">No tests run yet. Click a test button above to start.</p>
        ) : (
          <div className="space-y-4">
            {results.map((result) => (
              <div
                key={result.id}
                className={`p-4 rounded-lg border-l-4 ${
                  result.success 
                    ? 'bg-green-50 border-green-400' 
                    : 'bg-red-50 border-red-400'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-900">{result.test}</h3>
                  <div className="text-sm text-gray-500">
                    {result.timestamp} - {result.success ? '✅ Success' : '❌ Failed'}
                  </div>
                </div>
                
                {result.success && result.data && (
                  <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                )}
                
                {!result.success && result.error && (
                  <pre className="bg-red-100 p-3 rounded text-sm overflow-x-auto text-red-800">
                    {JSON.stringify(result.error, null, 2)}
                  </pre>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
        <h3 className="font-semibold text-yellow-800 mb-2">Debug Instructions:</h3>
        <ol className="list-decimal list-inside text-yellow-700 space-y-1">
          <li>First run "Check Cookies" to see current state</li>
          <li>Test "Test Connectivity" to ensure basic connection works</li>
          <li>Enter your login credentials and run "Test Login"</li>
          <li>After successful login, run "Check Cookies" again to see if JWT was set</li>
          <li>Test "Test Protected Route" to see if authentication works</li>
          <li>Check browser console for detailed logs</li>
          <li>If cookies don't work, try setting token manually and test again</li>
        </ol>
      </div>
    </div>
  );
};

export default AuthDebugger;