
import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Candidate, Office, Cycle, SurveyQuestion, CandidateSelection } from '../types'; // CandidateSelection
import { 
  getCandidateById, 
  getOfficeById, 
  getCycleById, 
  getSurveyQuestions, 
  getCandidatesByOfficeAndCycle,
  getAllOffices, 
  getAllCycles,
  getFormattedElectionName   
} from '../services/dataService';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useBallot } from '../hooks/useBallot';
import { ArrowLeftIcon, UsersIcon, CheckBadgeIcon, PlusCircleIcon, MinusCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

const CompareCandidatesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [allOfficesData, setAllOfficesData] = useState<Office[]>([]);
  const [allCyclesData, setAllCyclesData] = useState<Cycle[]>([]); 

  const [selectedOfficeIdParam, setSelectedOfficeIdParam] = useState<string>(searchParams.get('officeId') || '');
  const [selectedCycleIdParam, setSelectedCycleIdParam] = useState<string>(searchParams.get('cycleId') || ''); 
  
  const [candidate1Id, setCandidate1Id] = useState<string>(searchParams.get('candidate1Id') || '');
  const [candidate2Id, setCandidate2Id] = useState<string>(searchParams.get('candidate2Id') || '');
  
  const [candidate1, setCandidate1] = useState<Candidate | null>(null);
  const [candidate2, setCandidate2] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(false);

  const { 
    addCandidateSelection, 
    removeCandidateSelection, 
    isCandidateSelected, 
    isElectionPast 
  } = useBallot();

  const surveyQuestions = getSurveyQuestions();
  
  const currentOffice: Office | null = useMemo(() => selectedOfficeIdParam ? getOfficeById(parseInt(selectedOfficeIdParam)) : null, [selectedOfficeIdParam]);
  const currentCycle: Cycle | null = useMemo(() => selectedCycleIdParam ? getCycleById(parseInt(selectedCycleIdParam)) : null, [selectedCycleIdParam]);
  const currentElectionDate: string | null = useMemo(() => currentCycle?.electionDate || null, [currentCycle]);
  const currentElectionIsPast: boolean = useMemo(() => currentElectionDate ? isElectionPast(currentElectionDate) : false, [currentElectionDate, isElectionPast]);


  useEffect(() => {
    setAllOfficesData(getAllOffices());
    setAllCyclesData(getAllCycles()); 
  }, []);

  useEffect(() => {
    const params: Record<string, string> = {};
    if (selectedCycleIdParam) params.cycleId = selectedCycleIdParam; 
    if (selectedOfficeIdParam) params.officeId = selectedOfficeIdParam;
    if (candidate1Id) params.candidate1Id = candidate1Id;
    if (candidate2Id) params.candidate2Id = candidate2Id;
    setSearchParams(params, { replace: true });
  }, [selectedCycleIdParam, selectedOfficeIdParam, candidate1Id, candidate2Id, setSearchParams]);

  useEffect(() => {
    setLoading(true);
    setCandidate1(candidate1Id ? getCandidateById(parseInt(candidate1Id)) : null);
    setLoading(false);
  }, [candidate1Id]);

  useEffect(() => {
    setLoading(true);
    setCandidate2(candidate2Id ? getCandidateById(parseInt(candidate2Id)) : null);
    setLoading(false);
  }, [candidate2Id]);
  
  const availableCandidatesForSelection = useMemo(() => {
    if (selectedOfficeIdParam && selectedCycleIdParam) {
      return getCandidatesByOfficeAndCycle(parseInt(selectedOfficeIdParam), parseInt(selectedCycleIdParam));
    }
    return [];
  }, [selectedOfficeIdParam, selectedCycleIdParam]);

  useEffect(() => {
    if (candidate1Id && !candidate2Id && availableCandidatesForSelection.length === 2) {
      const candidate1Object = getCandidateById(parseInt(candidate1Id));
      if (candidate1Object) {
        const opponent = availableCandidatesForSelection.find(
          (c) => c.id !== candidate1Object.id
        );
        if (opponent) {
          setCandidate2Id(opponent.id.toString());
        }
      }
    }
  }, [candidate1Id, candidate2Id, availableCandidatesForSelection, setCandidate2Id]);


  const handleCycleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCycleIdParam(e.target.value); 
    setSelectedOfficeIdParam(''); 
    setCandidate1Id('');
    setCandidate2Id('');
  };

  const handleOfficeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedOfficeIdParam(e.target.value);
    setCandidate1Id('');
    setCandidate2Id('');
  };
  
  const renderIncumbentBadge = (candidate: Candidate | null, large: boolean = false) => {
    if (candidate?.isIncumbent) {
      return (
        <span className={`ml-2 text-xs font-semibold text-white bg-brand-red px-2 py-0.5 rounded-full inline-flex items-center ${large ? 'text-sm px-2.5 py-1' : ''}`}>
          <CheckBadgeIcon className={`h-3 w-3 mr-1 ${large ? 'h-4 w-4' : ''}`} />
          Incumbent
        </span>
      );
    }
    return null;
  };

  const handleCandidateBallotAction = (candidate: Candidate | null) => {
    if (!candidate || !currentOffice || !currentElectionDate || currentElectionIsPast) return;
    
    if (isCandidateSelected(candidate.id, currentOffice.id, currentElectionDate)) {
      removeCandidateSelection(currentOffice.id, currentElectionDate);
    } else {
      addCandidateSelection(candidate.id, currentOffice.id, currentElectionDate);
    }
  };

  const renderBallotButton = (candidate: Candidate | null) => {
    if (!candidate || !currentOffice || !currentElectionDate) {
      return null;
    }
    const selectedForBallot = isCandidateSelected(candidate.id, currentOffice.id, currentElectionDate);

    return (
      <button
        onClick={() => handleCandidateBallotAction(candidate)}
        disabled={currentElectionIsPast}
        className={`mt-2 w-full sm:w-auto flex items-center justify-center font-semibold py-2 px-4 rounded-md transition duration-150 ease-in-out text-sm text-white ${
          currentElectionIsPast
          ? 'bg-gray-400 cursor-not-allowed'
          : selectedForBallot 
            ? 'bg-brand-medium-blue hover:bg-opacity-80 hover:bg-brand-medium-blue' 
            : 'bg-brand-dark-blue hover:bg-opacity-80 hover:bg-brand-dark-blue'
        }`}
      >
        {selectedForBallot ? <MinusCircleIcon className="h-5 w-5 mr-2" /> : <PlusCircleIcon className="h-5 w-5 mr-2" />}
        {currentElectionIsPast ? 'Election Past' :(selectedForBallot ? 'Remove from Ballot' : 'Add to Ballot')}
      </button>
    );
  }

  const showCandidateSelectors = selectedCycleIdParam && selectedOfficeIdParam;
  const showComparisonTable = candidate1 && candidate2 && showCandidateSelectors;
  const formattedElectionDisplayName = getFormattedElectionName(currentCycle);

  return (
    <div className="max-w-6xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 inline-flex items-center text-brand-dark-blue hover:text-brand-red transition-colors font-medium"
      >
        <ArrowLeftIcon className="h-5 w-5 mr-2" />
        Back
      </button>

      <div className="bg-white shadow-xl rounded-lg p-6 md:p-10 border border-brand-light-blue-grey">
        <h1 className="text-3xl font-bold text-brand-dark-blue mb-8 text-center">Compare Candidates</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label htmlFor="cycle-select" className="block text-sm font-medium text-brand-dark-blue mb-1">
              Select Election
            </label>
            <select
              id="cycle-select"
              value={selectedCycleIdParam}
              onChange={handleCycleChange}
              className="mt-1 block w-full py-2 px-3 border border-brand-light-blue-grey bg-white rounded-md shadow-sm focus:outline-none focus:ring-brand-red focus:border-brand-red sm:text-sm text-brand-dark-blue"
            >
              <option value="">-- Select Election --</option>
              {allCyclesData.map(cycle => (
                <option key={cycle.id} value={cycle.id.toString()}>
                  {getFormattedElectionName(cycle)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="office-select" className="block text-sm font-medium text-brand-dark-blue mb-1">
              Select Office
            </label>
            <select
              id="office-select"
              value={selectedOfficeIdParam}
              onChange={handleOfficeChange}
              disabled={!selectedCycleIdParam}
              className="mt-1 block w-full py-2 px-3 border border-brand-light-blue-grey bg-white rounded-md shadow-sm focus:outline-none focus:ring-brand-red focus:border-brand-red sm:text-sm text-brand-dark-blue disabled:bg-gray-50"
            >
              <option value="">-- Select Office --</option>
              {allOfficesData
                .filter(office => 
                    availableCandidatesForSelection.some(cand => cand.officeId === office.id) 
                )
                .map(office => (
                    <option key={office.id} value={office.id.toString()}>{office.name}</option>
              ))}
            </select>
          </div>
        </div>

        {showCandidateSelectors && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div>
              <label htmlFor="candidate1-select" className="block text-sm font-medium text-brand-dark-blue mb-1">
                Select Candidate 1
              </label>
              <select
                id="candidate1-select"
                value={candidate1Id}
                onChange={(e) => setCandidate1Id(e.target.value)}
                className="mt-1 block w-full py-2 px-3 border border-brand-light-blue-grey bg-white rounded-md shadow-sm focus:outline-none focus:ring-brand-red focus:border-brand-red sm:text-sm text-brand-dark-blue"
              >
                <option value="">-- Select Candidate --</option>
                {availableCandidatesForSelection
                    .filter(c => c.id.toString() !== candidate2Id) 
                    .map(c => (
                        <option key={c.id} value={c.id.toString()}>{c.firstName} {c.lastName} ({c.party})</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="candidate2-select" className="block text-sm font-medium text-brand-dark-blue mb-1">
                Select Candidate 2
              </label>
              <select
                id="candidate2-select"
                value={candidate2Id}
                onChange={(e) => setCandidate2Id(e.target.value)}
                className="mt-1 block w-full py-2 px-3 border border-brand-light-blue-grey bg-white rounded-md shadow-sm focus:outline-none focus:ring-brand-red focus:border-brand-red sm:text-sm text-brand-dark-blue"
              >
                <option value="">-- Select Candidate --</option>
                {availableCandidatesForSelection
                    .filter(c => c.id.toString() !== candidate1Id) 
                    .map(c => (
                        <option key={c.id} value={c.id.toString()}>{c.firstName} {c.lastName} ({c.party})</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {loading && <LoadingSpinner />}

        {!showCandidateSelectors && (
           <div className="text-center py-10">
            <UsersIcon className="h-16 w-16 text-brand-light-blue-grey mx-auto mb-4" />
            <p className="text-xl text-brand-medium-blue">Please select an election and an office to compare candidates.</p>
          </div>
        )}

        {showCandidateSelectors && (!candidate1 || !candidate2) && (
          <div className="text-center py-10">
            <InformationCircleIcon className="h-16 w-16 text-brand-light-blue-grey mx-auto mb-4" />
            <p className="text-xl text-brand-medium-blue">Select two candidates to see a side-by-side comparison.</p>
          </div>
        )}

        {showComparisonTable && (
          <div className="overflow-x-auto">
            <h2 className="text-2xl font-semibold text-brand-dark-blue mb-2">
              Comparison: {currentOffice?.name} - {formattedElectionDisplayName}
            </h2>
            {currentElectionIsPast && <p className="mb-4 text-sm text-brand-medium-blue italic">Note: This is an archived comparison for a past election. Ballot actions are disabled.</p>}
            <table className="min-w-full divide-y divide-brand-light-blue-grey border border-brand-light-blue-grey">
              <thead className="bg-brand-off-white">
                <tr>
                  <th scope="col" className="py-3.5 px-3 text-left text-sm font-semibold text-brand-dark-blue w-1/4 sticky left-0 bg-brand-off-white z-10 border-r border-brand-light-blue-grey">
                    Feature
                  </th>
                  {[candidate1, candidate2].map((candidate, index) => (
                    candidate && (
                      <th key={candidate.id} scope="col" className={`py-3.5 px-4 text-left text-sm font-semibold text-brand-dark-blue ${index === 0 ? 'border-r border-brand-light-blue-grey' : ''}`}>
                        <Link to={`/candidate/${candidate.id}`} className="hover:text-brand-red group">
                            <img src={candidate.photoUrl || `https://picsum.photos/seed/${candidate.slug}/100/100`} alt={`${candidate.firstName} ${candidate.lastName}`} className="h-16 w-16 rounded-full object-cover mx-auto mb-2 border-2 border-brand-medium-blue group-hover:border-brand-red transition-colors"/>
                            {candidate.firstName} {candidate.lastName} {renderIncumbentBadge(candidate)}
                            <p className="text-xs text-brand-medium-blue font-normal">{candidate.party}</p>
                        </Link>
                         {renderBallotButton(candidate)}
                      </th>
                    )
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-light-blue-grey bg-white">
                {surveyQuestions.map(sq => (
                  <tr key={sq.key}>
                    <td className="py-4 px-3 text-sm font-medium text-brand-dark-blue sticky left-0 bg-white z-10 border-r border-brand-light-blue-grey">{sq.question}</td>
                    {[candidate1, candidate2].map((candidate, index) => (
                      <td key={candidate ? candidate.id : `empty-${index}`} className={`py-4 px-4 text-sm text-brand-medium-blue whitespace-pre-line ${index === 0 ? 'border-r border-brand-light-blue-grey' : ''}`}>
                        {candidate?.surveyResponses?.[sq.key] || <span className="italic text-gray-500">No response</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompareCandidatesPage;
