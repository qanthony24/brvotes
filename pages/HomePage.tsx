
import React, { useState, useMemo, useEffect } from 'react';
import CandidateCard from '../components/candidates/CandidateCard';
import FilterControls from '../components/candidates/FilterControls';
import { Candidate, ViewMode, Cycle, CandidateSelection } from '../types';
import { getAllCandidates, getCycleById, getCycleByElectionDate, getFormattedElectionName, getFormattedElectionNameFromDate } from '../services/dataService';
import { useBallot } from '../hooks/useBallot';
import { InformationCircleIcon } from '@heroicons/react/24/outline';

const HomePage: React.FC = () => {
  const { 
    addCandidateSelection, 
    removeCandidateSelection, // Changed from removeFromBallot
    isCandidateSelected,    // Changed from isCandidateInBallot
    selectedElectionDate: defaultSelectedElectionDate 
  } = useBallot();

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOffice, setSelectedOffice] = useState(''); 
  const [selectedElectionDateForFilter, setSelectedElectionDateForFilter] = useState<string>(''); 
  const [selectedParty, setSelectedParty] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.GRID);

  useEffect(() => {
    setCandidates(getAllCandidates());
    if (defaultSelectedElectionDate) {
      setSelectedElectionDateForFilter(defaultSelectedElectionDate);
    }
  }, [defaultSelectedElectionDate]);

  const handleCandidateBallotAction = (candidate: Candidate, electionDate: string) => {
    if (isCandidateSelected(candidate.id, candidate.officeId, electionDate)) {
      removeCandidateSelection(candidate.officeId, electionDate);
    } else {
      addCandidateSelection(candidate.id, candidate.officeId, electionDate);
    }
  };

  const filteredCandidates = useMemo(() => {
    return candidates.filter(candidate => {
      const candidateCycle = getCycleById(candidate.cycleId);
      if (!candidateCycle) return false; 

      const electionDateMatch = selectedElectionDateForFilter 
        ? candidateCycle.electionDate === selectedElectionDateForFilter 
        : true;
      const officeMatch = selectedOffice ? candidate.officeId === parseInt(selectedOffice) : true;
      const partyMatch = selectedParty ? candidate.party === selectedParty : true;
      const searchTermMatch = searchTerm 
        ? `${candidate.firstName} ${candidate.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) || 
          candidate.bio.toLowerCase().includes(searchTerm.toLowerCase())
        : true;
      return electionDateMatch && officeMatch && partyMatch && searchTermMatch;
    });
  }, [candidates, searchTerm, selectedOffice, selectedElectionDateForFilter, selectedParty]);

  const currentFilteredElectionName = selectedElectionDateForFilter 
    ? getFormattedElectionNameFromDate(selectedElectionDateForFilter)
    : 'All Elections';

  return (
    <div>
      <FilterControls
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedOffice={selectedOffice}
        setSelectedOffice={setSelectedOffice}
        selectedElectionDate={selectedElectionDateForFilter}
        setSelectedElectionDate={setSelectedElectionDateForFilter}
        selectedParty={selectedParty}
        setSelectedParty={setSelectedParty}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      {filteredCandidates.length > 0 ? (
        <div className={`grid gap-6 ${viewMode === ViewMode.GRID ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
          {filteredCandidates.map(candidate => (
            <CandidateCard 
              key={candidate.id} 
              candidate={candidate} 
              viewMode={viewMode}
              onToggleCandidateBallotStatus={handleCandidateBallotAction} 
              isCandidateSelected={isCandidateSelected}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <InformationCircleIcon className="h-16 w-16 text-brand-light-blue-grey mx-auto mb-4" />
          <p className="text-xl text-brand-medium-blue">No candidates match your current filters.</p>
          <p className="text-brand-light-blue-grey">Try adjusting your search or filter criteria.</p>
        </div>
      )}
    </div>
  );
};

export default HomePage;
