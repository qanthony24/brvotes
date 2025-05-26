
import React from 'react';
import { Link } from 'react-router-dom';
import { Candidate, Office, Cycle, ViewMode } from '../../types';
import { getOfficeById, getCycleById, getFormattedElectionName } from '../../services/dataService';
import { UserCircleIcon, BuildingOffice2Icon, CalendarDaysIcon, ArrowRightIcon, CheckBadgeIcon } from '@heroicons/react/24/outline';

interface CandidateCardProps {
  candidate: Candidate;
  viewMode: ViewMode;
  onToggleCandidateBallotStatus: (candidate: Candidate, electionDate: string) => void; // Renamed for clarity
  isCandidateSelected: (candidateId: number, officeId: number, electionDate: string) => boolean; // Renamed
}

const getPartyAbbreviation = (party: string): string => {
  if (!party) return '';
  const lowerParty = party.toLowerCase();
  if (lowerParty.startsWith('dem')) return 'D';
  if (lowerParty.startsWith('rep')) return 'R';
  if (lowerParty.startsWith('ind')) return 'I';
  if (lowerParty.startsWith('gre')) return 'G';
  if (lowerParty.startsWith('oth')) return 'O';
  return party.charAt(0).toUpperCase(); // Fallback to first letter
};

const CandidateCard: React.FC<CandidateCardProps> = ({ candidate, viewMode, onToggleCandidateBallotStatus, isCandidateSelected }) => {
  const office = getOfficeById(candidate.officeId);
  const cycle = getCycleById(candidate.cycleId); 
  const electionDate = cycle?.electionDate; 
  const formattedElectionName = getFormattedElectionName(cycle);


  const fullName = `${candidate.firstName} ${candidate.lastName}`;
  const selectedForBallot = electionDate ? isCandidateSelected(candidate.id, candidate.officeId, electionDate) : false; // Updated

  const cardBaseClasses = "bg-white shadow-lg rounded-lg overflow-hidden transition-all duration-300 hover:shadow-xl border border-brand-light-blue-grey";
  
  const incumbentBadge = candidate.isIncumbent ? (
    <span className="ml-2 text-xs font-semibold text-white bg-brand-red px-2 py-0.5 rounded-full inline-flex items-center">
      <CheckBadgeIcon className="h-3 w-3 mr-1" />
      Incumbent
    </span>
  ) : null;

  const handleBallotButtonClick = () => {
    if (electionDate) {
      onToggleCandidateBallotStatus(candidate, electionDate); // Use the renamed prop
    } else {
      console.warn("Cannot add to ballot: election date unknown for candidate", candidate);
    }
  }

  if (viewMode === ViewMode.GRID) {
    return (
      <div className={`${cardBaseClasses} flex flex-col`}>
        <Link to={`/candidate/${candidate.id}`} className="block hover:opacity-90 transition-opacity">
          <img 
            src={candidate.photoUrl || `https://picsum.photos/seed/${candidate.slug}/400/300`} 
            alt={fullName} 
            className="w-full h-48 object-cover" 
            onError={(e) => (e.currentTarget.src = 'https://picsum.photos/400/300?grayscale')}
          />
        </Link>
        <div className="p-6 flex flex-col flex-grow">
          <Link to={`/candidate/${candidate.id}`} className="hover:text-brand-red transition-colors">
            <h3 className="text-xl font-semibold text-brand-dark-blue mb-1">
              {fullName} 
              {incumbentBadge}
            </h3>
          </Link>
          <p className="text-sm text-brand-medium-blue mb-1 flex items-center"><BuildingOffice2Icon className="h-4 w-4 mr-2 text-brand-medium-blue" />{office?.name || 'N/A'}</p>
          <p className="text-sm text-brand-medium-blue mb-1 flex items-center"><CalendarDaysIcon className="h-4 w-4 mr-2 text-brand-medium-blue" />{formattedElectionName}</p>
          <p className="text-sm text-brand-medium-blue mb-3">{candidate.party}</p>
          <div className="mt-auto space-y-2">
            <Link
              to={`/candidate/${candidate.id}`}
              className="w-full flex items-center justify-center bg-brand-red hover:bg-opacity-80 hover:bg-brand-red text-white font-semibold py-2 px-4 rounded-md transition duration-150 ease-in-out text-sm"
            >
              View Profile <ArrowRightIcon className="h-4 w-4 ml-2" />
            </Link>
            <button
              onClick={handleBallotButtonClick}
              disabled={!electionDate}
              className={`w-full font-semibold py-2 px-4 rounded-md transition duration-150 ease-in-out text-sm ${
                selectedForBallot 
                ? 'bg-brand-medium-blue hover:bg-opacity-80 hover:bg-brand-medium-blue text-white' 
                : 'bg-brand-dark-blue hover:bg-opacity-80 hover:bg-brand-dark-blue text-white'
              } ${!electionDate ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {selectedForBallot ? 'Remove from Ballot' : 'Add to Ballot'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // LIST View
  const partyAbbreviation = getPartyAbbreviation(candidate.party);
  return (
    <div className={`${cardBaseClasses} flex flex-col sm:flex-row items-start sm:items-center`}>
      <div className="p-4 sm:p-6 flex-grow w-full">
        <Link to={`/candidate/${candidate.id}`} className="hover:text-brand-red transition-colors">
          <h3 className="text-xl font-semibold text-brand-dark-blue mb-1">
            {fullName} 
            {partyAbbreviation && <span className="text-brand-medium-blue font-normal ml-1">({partyAbbreviation})</span>}
            {incumbentBadge}
          </h3>
        </Link>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 text-sm mb-3">
          <p className="text-brand-medium-blue flex items-center"><BuildingOffice2Icon className="h-4 w-4 mr-2 text-brand-medium-blue" />{office?.name || 'N/A'}</p>
          <p className="text-brand-medium-blue flex items-center"><CalendarDaysIcon className="h-4 w-4 mr-2 text-brand-medium-blue" />{formattedElectionName}</p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 space-y-2 sm:space-y-0 mt-2">
          <Link
            to={`/candidate/${candidate.id}`}
            className="flex items-center justify-center bg-brand-red hover:bg-opacity-80 hover:bg-brand-red text-white font-semibold py-2 px-4 rounded-md transition duration-150 ease-in-out text-sm"
          >
            View Profile <ArrowRightIcon className="h-4 w-4 ml-2" />
          </Link>
          <button
            onClick={handleBallotButtonClick}
            disabled={!electionDate}
            className={`w-full sm:w-auto font-semibold py-2 px-4 rounded-md transition duration-150 ease-in-out text-sm ${
              selectedForBallot 
              ? 'bg-brand-medium-blue hover:bg-opacity-80 hover:bg-brand-medium-blue text-white' 
              : 'bg-brand-dark-blue hover:bg-opacity-80 hover:bg-brand-dark-blue text-white'
            } ${!electionDate ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {selectedForBallot ? 'Remove from My Ballot' : 'Add to My Ballot'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CandidateCard;
