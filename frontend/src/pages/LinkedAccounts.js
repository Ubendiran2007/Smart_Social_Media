import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const LinkedAccounts = () => {
  const navigate = useNavigate();

  const accounts = [
    { name: 'Google', connected: false },
    { name: 'Facebook', connected: false },
    { name: 'Twitter', connected: false }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/my-account')}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeftIcon className="h-6 w-6 text-gray-600" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">Linked Accounts</h1>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-4">
        {accounts.map((account) => (
          <div key={account.name} className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">{account.name}</span>
              <button
                onClick={() => alert(`${account.name} integration coming soon`)}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  account.connected
                    ? 'bg-red-100 text-red-600 hover:bg-red-200'
                    : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                }`}
              >
                {account.connected ? 'Disconnect' : 'Connect'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LinkedAccounts;