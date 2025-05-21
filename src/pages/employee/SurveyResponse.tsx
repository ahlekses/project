import React from 'react';
import { useParams } from 'react-router-dom';
import EmployeeLayout from '../../components/layout/EmployeeLayout';

const SurveyResponse: React.FC = () => {
  const { id } = useParams();

  return (
    <EmployeeLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Survey Response</h1>
          <p className="mt-2 text-gray-600">Please complete the survey below.</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="space-y-6">
            {/* Survey content will be populated dynamically based on the survey ID */}
            <p className="text-gray-700">Loading survey {id}...</p>
          </div>
        </div>
      </div>
    </EmployeeLayout>
  );
};

export default SurveyResponse;