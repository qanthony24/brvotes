
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Office, Cycle, ViewMode, Candidate } from '../../types';
// FIX: Import PARTIES from constants
import { OFFICES_DATA, PARTIES } from '../../constants'; // CYCLES_DATA removed, will get from hook or props if needed for default
import { getAllCandidates, getAllCycles, getFormattedElectionName, getCycleByElectionDate } from '../../services/dataService';
import { MagnifyingGlassIcon, FunnelIcon, ListBulletIcon, Squares2X2Icon, UserCircleIcon } from '@heroicons/react/24/outline';

interface FilterControlsProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedOffice: string; // office ID as string
  setSelectedOffice: (officeId: string) => void;
  selectedElectionDate: string; // electionDate string
  setSelectedElectionDate: (electionDate: string) => void;
  selectedParty: string;
  setSelectedParty: (party: string) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

const FilterControls: React.FC<FilterControlsProps> = ({
  searchTerm, setSearchTerm,
  selectedOffice, setSelectedOffice,
  selectedElectionDate, setSelectedElectionDate,
  selectedParty, setSelectedParty,
  viewMode, setViewMode
}) => {
  const [allCandidates, setAllCandidates] = useState<Candidate[]>([]);
  const [allElectionEvents, setAllElectionEvents] = useState<Cycle[]>([]);
  const [suggestedCandidates, setSuggestedCandidates] = useState<Candidate[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setAllCandidates(getAllCandidates());
    setAllElectionEvents(getAllCycles()); // These are sorted: upcoming first, then past
  }, []);

  useEffect(() => {
    if (searchTerm.trim().length > 0) {
      const filtered = allCandidates.filter(candidate =>
        `${candidate.firstName} ${candidate.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setSuggestedCandidates(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setSuggestedCandidates([]);
      setShowSuggestions(false);
    }
  }, [searchTerm, allCandidates]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSuggestionClick = (candidate: Candidate) => {
    setSearchTerm(`${candidate.firstName} ${candidate.lastName}`);
    setShowSuggestions(false);
    navigate(`/candidate/${candidate.id}`);
  };

  return (
    <div className="mb-8 p-6 bg-white shadow-md rounded-lg border border-brand-light-blue-grey">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
        {/* Search Term */}
        <div ref={searchContainerRef} className="relative">
          <label htmlFor="search" className="block text-sm font-medium text-brand-dark-blue mb-1">Search by Name/Keyword</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-brand-light-blue-grey" />
            </div>
            <input
              type="text"
              id="search"
              className="focus:ring-brand-red focus:border-brand-red block w-full pl-10 sm:text-sm border-brand-light-blue-grey rounded-md py-2 text-brand-dark-blue"
              placeholder="e.g. John Doe"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => { if (suggestedCandidates.length > 0) setShowSuggestions(true);}}
              autoComplete="off"
            />
          </div>
          {showSuggestions && suggestedCandidates.length > 0 && (
            <ul className="absolute z-10 w-full bg-white border border-brand-light-blue-grey rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg">
              {suggestedCandidates.map(candidate => (
                <li
                  key={candidate.id}
                  className="px-4 py-2 hover:bg-brand-off-white cursor-pointer flex items-center"
                  onClick={() => handleSuggestionClick(candidate)}
                  onMouseDown={(e) => e.preventDefault()}
                >
                  <img 
                    src={candidate.photoUrl || `https://picsum.photos/seed/${candidate.slug}/40/40`} 
                    alt={`${candidate.firstName} ${candidate.lastName}`} 
                    className="w-8 h-8 rounded-full mr-3 object-cover"
                    onError={(e) => (e.currentTarget.src = 'https://picsum.photos/40/40?grayscale')}
                  />
                  <div>
                    <span className="font-medium text-brand-dark-blue">{candidate.firstName} {candidate.lastName}</span>
                    <span className="text-xs text-brand-medium-blue ml-2">({candidate.party})</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Office Filter */}
        <div>
          <label htmlFor="office" className="block text-sm font-medium text-brand-dark-blue mb-1">Office</label>
          <select
            id="office"
            className="mt-1 block w-full py-2 px-3 border border-brand-light-blue-grey bg-white rounded-md shadow-sm focus:outline-none focus:ring-brand-red focus:border-brand-red sm:text-sm text-brand-dark-blue"
            value={selectedOffice}
            onChange={(e) => setSelectedOffice(e.target.value)}
          >
            <option value="">All Offices</option>
            {OFFICES_DATA.map((office) => (
              <option key={office.id} value={office.id.toString()}>{office.name}</option>
            ))}
          </select>
        </div>

        {/* Election Filter (formerly Cycle) */}
        <div>
          <label htmlFor="electionDate" className="block text-sm font-medium text-brand-dark-blue mb-1">Election</label>
          <select
            id="electionDate"
            className="mt-1 block w-full py-2 px-3 border border-brand-light-blue-grey bg-white rounded-md shadow-sm focus:outline-none focus:ring-brand-red focus:border-brand-red sm:text-sm text-brand-dark-blue"
            value={selectedElectionDate}
            onChange={(e) => setSelectedElectionDate(e.target.value)}
          >
            <option value="">All Elections</option>
            {allElectionEvents.map((event) => (
              <option key={event.electionDate} value={event.electionDate}>
                {getFormattedElectionName(event)}
              </option>
            ))}
          </select>
        </div>
        
        {/* Party Filter */}
        <div>
          <label htmlFor="party" className="block text-sm font-medium text-brand-dark-blue mb-1">Party</label>
          <select
            id="party"
            className="mt-1 block w-full py-2 px-3 border border-brand-light-blue-grey bg-white rounded-md shadow-sm focus:outline-none focus:ring-brand-red focus:border-brand-red sm:text-sm text-brand-dark-blue"
            value={selectedParty}
            onChange={(e) => setSelectedParty(e.target.value)}
          >
            <option value="">All Parties</option>
            {PARTIES.map((party) => (
              <option key={party} value={party}>{party}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="mt-4 flex justify-end items-center">
        <span className="text-sm font-medium text-brand-dark-blue mr-3">View:</span>
        <div className="flex space-x-1">
            <button
                onClick={() => setViewMode(ViewMode.GRID)}
                className={`p-2 rounded-md ${viewMode === ViewMode.GRID ? 'bg-brand-red text-white' : 'bg-brand-light-blue-grey hover:bg-opacity-80 hover:bg-brand-light-blue-grey text-brand-dark-blue'}`}
                aria-label="Grid view"
            >
                <Squares2X2Icon className="h-5 w-5" />
            </button>
            <button
                onClick={() => setViewMode(ViewMode.LIST)}
                className={`p-2 rounded-md ${viewMode === ViewMode.LIST ? 'bg-brand-red text-white' : 'bg-brand-light-blue-grey hover:bg-opacity-80 hover:bg-brand-light-blue-grey text-brand-dark-blue'}`}
                aria-label="List view"
            >
                <ListBulletIcon className="h-5 w-5" />
            </button>
        </div>
      </div>
    </div>
  );
};

export default FilterControls;