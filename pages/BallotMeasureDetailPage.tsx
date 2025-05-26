
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { BallotMeasure } from '../types';
import { getBallotMeasureById, getFormattedElectionNameFromDate } from '../services/dataService';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useBallot } from '../hooks/useBallot';
import { ArrowLeftIcon, DocumentTextIcon, ChatBubbleLeftEllipsisIcon, CheckCircleIcon, XCircleIcon, QuestionMarkCircleIcon, HandThumbUpIcon, HandThumbDownIcon, NoSymbolIcon } from '@heroicons/react/24/outline';

const BallotMeasureDetailPage: React.FC = () => {
  const { measureId } = useParams<{ measureId: string }>();
  const navigate = useNavigate();
  const [measure, setMeasure] = useState<BallotMeasure | null>(null);
  const [loading, setLoading] = useState(true);

  const { 
    setMeasureStance, 
    removeMeasureStance, 
    getSelectedMeasureStance, 
    isElectionPast 
  } = useBallot();

  useEffect(() => {
    if (measureId) {
      const id = parseInt(measureId);
      const fetchedMeasure = getBallotMeasureById(id);
      setMeasure(fetchedMeasure);
    }
    setLoading(false);
  }, [measureId]);

  if (loading) return <LoadingSpinner size="lg" />;
  if (!measure) return <div className="text-center py-10 text-brand-red">Ballot measure not found.</div>;

  const electionIsPastForMeasure = isElectionPast(measure.electionDate);
  const currentStance = getSelectedMeasureStance(measure.id, measure.electionDate);
  const formattedElectionName = getFormattedElectionNameFromDate(measure.electionDate);

  const handleStanceSelection = (vote: 'support' | 'oppose' | null) => {
    if (electionIsPastForMeasure) return;
    if (vote === null) {
      removeMeasureStance(measure.id, measure.electionDate);
    } else {
      setMeasureStance(measure.id, vote, measure.electionDate);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 inline-flex items-center text-brand-dark-blue hover:text-brand-red transition-colors font-medium"
      >
        <ArrowLeftIcon className="h-5 w-5 mr-2" />
        Back to Measures List
      </button>

      <div className="bg-white shadow-xl rounded-lg p-6 md:p-10 border border-brand-light-blue-grey">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-brand-dark-blue mb-2">{measure.title}</h1>
          <p className="text-lg text-brand-medium-blue">
            For {formattedElectionName} {electionIsPastForMeasure && <span className="text-sm font-semibold text-gray-500">(Past Election)</span>}
          </p>
        </header>

        {!electionIsPastForMeasure && (
          <div className="mb-8 p-4 bg-brand-off-white rounded-lg border border-brand-light-blue-grey">
            <h2 className="text-xl font-semibold text-brand-dark-blue mb-3">Your Stance:</h2>
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 space-y-3 sm:space-y-0">
              <button
                onClick={() => handleStanceSelection('support')}
                disabled={electionIsPastForMeasure}
                className={`flex-1 flex items-center justify-center py-3 px-4 rounded-md text-lg font-semibold transition-colors border-2
                  ${currentStance === 'support' ? 'bg-green-500 text-white border-green-600 ring-2 ring-green-500 ring-offset-1' : 'bg-white hover:bg-green-50 text-green-600 border-green-500'}
                  ${electionIsPastForMeasure ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <HandThumbUpIcon className="h-6 w-6 mr-2" /> Support
              </button>
              <button
                onClick={() => handleStanceSelection('oppose')}
                disabled={electionIsPastForMeasure}
                className={`flex-1 flex items-center justify-center py-3 px-4 rounded-md text-lg font-semibold transition-colors border-2
                  ${currentStance === 'oppose' ? 'bg-red-500 text-white border-red-600 ring-2 ring-red-500 ring-offset-1' : 'bg-white hover:bg-red-50 text-red-600 border-red-500'}
                  ${electionIsPastForMeasure ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <HandThumbDownIcon className="h-6 w-6 mr-2" /> Oppose
              </button>
              {currentStance && (
                <button
                  onClick={() => handleStanceSelection(null)}
                  disabled={electionIsPastForMeasure}
                  className={`flex items-center justify-center py-3 px-4 rounded-md text-base font-semibold transition-colors border-2 bg-white hover:bg-gray-100 text-gray-600 border-gray-400
                    ${electionIsPastForMeasure ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title="Clear Stance"
                >
                   <NoSymbolIcon className="h-5 w-5 mr-2" /> Clear
                </button>
              )}
            </div>
            {electionIsPastForMeasure && <p className="text-sm text-gray-500 mt-2 italic">Voting has ended for this measure.</p>}
          </div>
        )}
        
        {electionIsPastForMeasure && currentStance && (
             <div className="mb-8 p-4 bg-brand-off-white rounded-lg border border-brand-light-blue-grey">
                <h2 className="text-xl font-semibold text-brand-dark-blue mb-2">Your Archived Stance:</h2>
                 <p className={`text-lg font-medium py-2 px-4 rounded-md inline-block
                    ${currentStance === 'support' ? 'bg-green-100 text-green-700' : ''}
                    ${currentStance === 'oppose' ? 'bg-red-100 text-red-700' : ''}
                 `}>
                    You chose to {currentStance === 'support' ? 'Support' : 'Oppose'} this measure.
                 </p>
             </div>
        )}
         {electionIsPastForMeasure && !currentStance && (
             <div className="mb-8 p-4 bg-brand-off-white rounded-lg border border-brand-light-blue-grey">
                <h2 className="text-xl font-semibold text-brand-dark-blue mb-2">Your Archived Stance:</h2>
                 <p className="text-lg text-gray-600 py-2 px-4 rounded-md inline-block bg-gray-100">
                    No stance was recorded for this measure.
                 </p>
             </div>
        )}


        <section className="mb-6">
          <h3 className="text-xl font-semibold text-brand-dark-blue mb-2 flex items-center">
            <DocumentTextIcon className="h-6 w-6 mr-2 text-brand-medium-blue" /> Official Ballot Language
          </h3>
          <p className="text-brand-dark-blue whitespace-pre-line leading-relaxed p-4 bg-gray-50 rounded-md border border-gray-200">{measure.ballotLanguage}</p>
        </section>

        <section className="mb-6">
          <h3 className="text-xl font-semibold text-brand-dark-blue mb-2 flex items-center">
            <ChatBubbleLeftEllipsisIcon className="h-6 w-6 mr-2 text-brand-medium-blue" /> In other words...
          </h3>
          <p className="text-brand-dark-blue whitespace-pre-line leading-relaxed">{measure.laymansExplanation}</p>
        </section>

        <section className="mb-6">
          <h3 className="text-xl font-semibold text-brand-dark-blue mb-2 flex items-center">
            <CheckCircleIcon className="h-6 w-6 mr-2 text-green-500" /> A YES vote means:
          </h3>
          <p className="text-brand-dark-blue whitespace-pre-line leading-relaxed">{measure.yesVoteMeans}</p>
        </section>

        <section>
          <h3 className="text-xl font-semibold text-brand-dark-blue mb-2 flex items-center">
            <XCircleIcon className="h-6 w-6 mr-2 text-red-500" /> A NO vote means:
          </h3>
          <p className="text-brand-dark-blue whitespace-pre-line leading-relaxed">{measure.noVoteMeans}</p>
        </section>
      </div>
    </div>
  );
};

export default BallotMeasureDetailPage;
