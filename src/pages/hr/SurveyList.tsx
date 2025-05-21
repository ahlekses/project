import React from 'react';
import HRLayout from '../../components/layout/HRLayout';

const SurveyList = () => {
  return (
    <HRLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Surveys</h1>
          <p className="mt-2 text-gray-600">Manage and monitor all employee engagement surveys</p>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search surveys..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="ml-4">
                <button
                  onClick={() => window.location.href = '/hr/surveys/builder'}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create New Survey
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid gap-4">
              {/* Placeholder for survey list - would be populated with actual data */}
              <div className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Q4 2024 Employee Engagement Survey</h3>
                    <p className="text-sm text-gray-600 mt-1">Created on January 15, 2024</p>
                    <div className="mt-2 flex items-center">
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                        Active
                      </span>
                      <span className="ml-2 text-sm text-gray-600">
                        Responses: 45/100
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="p-2 text-gray-600 hover:text-blue-600 transition-colors">
                      Edit
                    </button>
                    <button className="p-2 text-gray-600 hover:text-red-600 transition-colors">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </HRLayout>
  );
};

export default SurveyList;