import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import EmployeeLayout from '../../components/layout/EmployeeLayout';
import api from '../../services/api';

interface Question {
  id: number;
  text: string;
  type: string;
  options: string[] | null;
  is_required: boolean;
  order: number;
}

interface SurveyAssignment {
  id: number;
  survey_details: {
    id: number;
    title: string;
    description: string;
    category: string;
  };
  due_date: string | null;
  is_completed: boolean;
}

const SurveyResponse: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [assignment, setAssignment] = useState<SurveyAssignment | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [responses, setResponses] = useState<Record<number, any>>({});

  useEffect(() => {
    fetchSurveyDetails();
  }, [id]);

  const fetchSurveyDetails = async () => {
    try {
      const [assignmentRes, surveyRes] = await Promise.all([
        api.get(`/surveys/assignments/${id}/`),
        api.get(`/surveys/forms/${id}/`)
      ]);

      setAssignment(assignmentRes.data);
      setQuestions(surveyRes.data.questions);
    } catch (error) {
      console.error('Error fetching survey details:', error);
      toast.error('Failed to load survey');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResponseChange = (questionId: number, value: any) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required questions
    const unansweredRequired = questions
      .filter(q => q.is_required && !responses[q.id]);

    if (unansweredRequired.length > 0) {
      toast.error('Please answer all required questions');
      return;
    }

    setIsSaving(true);

    try {
      const formattedResponses = Object.entries(responses).map(([questionId, answer]) => ({
        question_id: parseInt(questionId),
        answer
      }));

      await api.post(`/surveys/forms/${assignment?.survey_details.id}/submit/`, {
        assignment_id: assignment?.id,
        responses: formattedResponses
      });

      toast.success('Survey submitted successfully');
      navigate('/employee');
    } catch (error) {
      console.error('Error submitting survey:', error);
      toast.error('Failed to submit survey');
    } finally {
      setIsSaving(false);
    }
  };

  const renderQuestion = (question: Question) => {
    switch (question.type) {
      case 'TEXT':
        return (
          <input
            type="text"
            value={responses[question.id] || ''}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
            placeholder="Your answer"
          />
        );

      case 'TEXTAREA':
        return (
          <textarea
            value={responses[question.id] || ''}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
            placeholder="Your answer"
          />
        );

      case 'RADIO':
        return (
          <div className="mt-2 space-y-2">
            {question.options?.map((option, index) => (
              <label key={index} className="flex items-center">
                <input
                  type="radio"
                  name={`question_${question.id}`}
                  value={option}
                  checked={responses[question.id] === option}
                  onChange={(e) => handleResponseChange(question.id, e.target.value)}
                  className="border-gray-300 text-amber-600 focus:ring-amber-500"
                />
                <span className="ml-2 text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'CHECKBOX':
        return (
          <div className="mt-2 space-y-2">
            {question.options?.map((option, index) => (
              <label key={index} className="flex items-center">
                <input
                  type="checkbox"
                  value={option}
                  checked={(responses[question.id] || []).includes(option)}
                  onChange={(e) => {
                    const currentValues = responses[question.id] || [];
                    const newValues = e.target.checked
                      ? [...currentValues, option]
                      : currentValues.filter((v: string) => v !== option);
                    handleResponseChange(question.id, newValues);
                  }}
                  className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                />
                <span className="ml-2 text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'DROPDOWN':
        return (
          <select
            value={responses[question.id] || ''}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
          >
            <option value="">Select an option</option>
            {question.options?.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'RATING':
        return (
          <div className="mt-2 flex space-x-4">
            {[1, 2, 3, 4, 5].map((rating) => (
              <label key={rating} className="flex flex-col items-center">
                <input
                  type="radio"
                  name={`question_${question.id}`}
                  value={rating}
                  checked={responses[question.id] === rating}
                  onChange={(e) => handleResponseChange(question.id, parseInt(e.target.value))}
                  className="sr-only"
                />
                <span
                  className={`w-10 h-10 flex items-center justify-center rounded-full border-2 cursor-pointer
                    ${responses[question.id] === rating
                      ? 'bg-amber-500 text-white border-amber-500'
                      : 'border-gray-300 hover:border-amber-500'
                    }`}
                >
                  {rating}
                </span>
              </label>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <EmployeeLayout title="Loading Survey...">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        </div>
      </EmployeeLayout>
    );
  }

  if (!assignment) {
    return (
      <EmployeeLayout title="Survey Not Found">
        <div className="p-6">
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Survey not found</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>The requested survey could not be found or you don't have permission to access it.</p>
                </div>
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => navigate('/employee')}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200"
                  >
                    Return to Dashboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </EmployeeLayout>
    );
  }

  return (
    <EmployeeLayout title="Survey Response">
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <button
            onClick={() => navigate('/employee')}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Dashboard
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">
              {assignment.survey_details.title}
            </h1>
            {assignment.survey_details.description && (
              <p className="mt-2 text-gray-600">
                {assignment.survey_details.description}
              </p>
            )}
            {assignment.due_date && (
              <p className="mt-2 text-sm text-amber-600">
                Due by: {new Date(assignment.due_date).toLocaleDateString()}
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-8">
              {questions.map((question) => (
                <div key={question.id} className="border-b border-gray-200 pb-6 last:border-0">
                  <label className="block">
                    <span className="text-gray-700 font-medium">
                      {question.text}
                      {question.is_required && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </span>
                    {renderQuestion(question)}
                  </label>
                </div>
              ))}
            </div>

            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className={`flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500
                  ${isSaving ? 'opacity-75 cursor-not-allowed' : ''}`}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Submit Survey
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </EmployeeLayout>
  );
};

export default SurveyResponse;