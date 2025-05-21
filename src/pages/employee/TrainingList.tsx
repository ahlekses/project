import React from 'react';
import { EmployeeLayout } from '../../components/layout/EmployeeLayout';

const TrainingList = () => {
  return (
    <EmployeeLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Trainings</h1>
        <div className="bg-white shadow rounded-lg">
          <div className="p-6">
            {/* Training list content will be implemented later */}
            <p className="text-gray-600">Your assigned trainings will appear here.</p>
          </div>
        </div>
      </div>
    </EmployeeLayout>
  );
};

export default TrainingList;