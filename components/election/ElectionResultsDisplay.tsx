
import React from 'react';
import { Link } from 'react-router-dom';
import { OfficeElectionResults, ElectionResultCandidate } from '../../types';
import { CheckCircleIcon, TrophyIcon } from '@heroicons/react/24/solid'; // Solid for winner

interface ElectionResultsDisplayProps {
  officeResults: OfficeElectionResults;
}

const ElectionResultsDisplay: React.FC<ElectionResultsDisplayProps> = ({ officeResults }) => {
  const { office, results, totalVotesInOffice } = officeResults;

  // Determine a good max bar width, e.g., if highest percentage is low, still make it look substantial
  const maxPercentageInResults = results.reduce((max, r) => Math.max(max, r.percentage), 0);
  // If max is very low (e.g. < 20%), we might want to scale up bars for visual effect,
  // but for simplicity, we'll use direct percentage for width for now.

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border border-brand-light-blue-grey mb-6">
      <h3 className="text-2xl font-semibold text-brand-dark-blue mb-4">{office.name} - Results</h3>
      {results.length === 0 ? (
        <p className="text-brand-medium-blue italic">No results available for this office.</p>
      ) : (
        <ul className="space-y-5">
          {results.map((resCandidate: ElectionResultCandidate) => (
            <li key={resCandidate.candidateId} className="border-b border-brand-off-white pb-4 last:border-b-0 last:pb-0">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-1">
                <div className="flex items-center mb-2 sm:mb-0">
                    <img 
                        src={resCandidate.photoUrl || `https://picsum.photos/seed/${resCandidate.candidateName.replace(/\s+/g, '')}/40/40`} 
                        alt={resCandidate.candidateName} 
                        className="w-10 h-10 rounded-full mr-3 object-cover border border-brand-light-blue-grey"
                        onError={(e) => (e.currentTarget.src = 'https://picsum.photos/40/40?grayscale')}
                    />
                    <div>
                        <Link to={`/candidate/${resCandidate.candidateId}`} className="font-semibold text-brand-dark-blue hover:text-brand-red text-lg">
                            {resCandidate.candidateName}
                        </Link>
                        <span className="text-sm text-brand-medium-blue ml-2">({resCandidate.party})</span>
                    </div>
                </div>
                {resCandidate.isWinner && (
                  <span className="text-xs sm:text-sm font-bold text-green-600 bg-green-100 px-3 py-1 rounded-full flex items-center self-start sm:self-center">
                    <TrophyIcon className="h-4 w-4 mr-1.5" />
                    Winner
                  </span>
                )}
              </div>
              
              <div className="flex items-center mb-1">
                <div className="w-full bg-brand-off-white rounded-full h-6 mr-3 relative border border-brand-light-blue-grey">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ease-out ${resCandidate.isWinner ? 'bg-green-500' : 'bg-brand-medium-blue'}`}
                    style={{ width: `${Math.max(resCandidate.percentage, 2)}%` }} // Ensure a minimum visible width
                    role="progressbar"
                    aria-valuenow={resCandidate.percentage}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${resCandidate.candidateName} vote percentage`}
                  >
                     <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-xs font-medium text-white leading-none">
                        {resCandidate.percentage}%
                     </span>
                  </div>
                </div>
              </div>
               <p className="text-xs text-right text-brand-medium-blue">
                    {resCandidate.votes.toLocaleString()} votes
                </p>
            </li>
          ))}
        </ul>
      )}
       {totalVotesInOffice > 0 && (
          <p className="text-sm text-brand-medium-blue mt-4 pt-3 border-t border-brand-off-white">
            Total Votes Cast in Office: {totalVotesInOffice.toLocaleString()}
          </p>
        )}
    </div>
  );
};

export default ElectionResultsDisplay;
