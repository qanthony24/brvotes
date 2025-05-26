
import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BallotMeasure, Cycle } from '../types';
import { getAllBallotMeasures, getAllCycles, getFormattedElectionName, getFormattedElectionNameFromDate } from '../services/dataService';
import { DocumentCheckIcon, InformationCircleIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';
import { useBallot } from '../hooks/useBallot'; // To get default selected election

const BallotMeasuresListPage: React.FC = () => {
  const [measures, setMeasures] = useState<BallotMeasure[]>([]);
  const [allElectionEvents, setAllElectionEvents] = useState<Cycle[]>([]);
  const { selectedElectionDate: defaultSelectedElectionDate } = useBallot();
  const [selectedElectionFilter, setSelectedElectionFilter] = useState<string>('');

  useEffect(() => {
    setMeasures(getAllBallotMeasures());
    setAllElectionEvents(getAllCycles()); // Sorted: upcoming first, then past
    if (defaultSelectedElectionDate) {
        setSelectedElectionFilter(defaultSelectedElectionDate);
    }
  }, [defaultSelectedElectionDate]);

  const filteredMeasures = useMemo(() => {
    if (!selectedElectionFilter) {
      return measures; // Show all if no filter or "All Elections"
    }
    return measures.filter(measure => measure.electionDate === selectedElectionFilter);
  }, [measures, selectedElectionFilter]);
  
  const currentFilteredElectionName = selectedElectionFilter
    ? getFormattedElectionNameFromDate(selectedElectionFilter)
    : "All Elections";

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow-xl rounded-lg p-6 md:p-10 border border-brand-light-blue-grey">
        <div className="text-center mb-10">
          <DocumentCheckIcon className="h-16 w-16 text-brand-red mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-brand-dark-blue">Ballot Measures</h1>
          <p className="text-brand-medium-blue mt-2">Review propositions and other measures on the ballot.</p>
        </div>

        {/* Election Filter */}
        <div className="mb-8 max-w-md mx-auto">
          <label htmlFor="election-filter" className="block text-sm font-medium text-brand-dark-blue mb-1">
            Filter by Election:
          </label>
          <select
            id="election-filter"
            value={selectedElectionFilter}
            onChange={(e) => setSelectedElectionFilter(e.target.value)}
            className="mt-1 block w-full py-2 px-3 border border-brand-light-blue-grey bg-white rounded-md shadow-sm focus:outline-none focus:ring-brand-red focus:border-brand-red sm:text-sm text-brand-dark-blue"
          >
            <option value="">All Elections</option>
            {allElectionEvents.map((event) => (
              <option key={event.electionDate} value={event.electionDate}>
                {getFormattedElectionName(event)} {isElectionPast(event.electionDate) ? "(Past)" : ""}
              </option>
            ))}
          </select>
        </div>
        
        {filteredMeasures.length > 0 ? (
          <div className="space-y-6">
            {filteredMeasures.map(measure => (
              <Link 
                key={measure.id} 
                to={`/ballot-measure/${measure.id}`} 
                className="block bg-brand-off-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-brand-light-blue-grey hover:border-brand-red"
              >
                <h2 className="text-xl font-semibold text-brand-dark-blue mb-1">{measure.title}</h2>
                <p className="text-sm text-brand-medium-blue flex items-center">
                  <CalendarDaysIcon className="h-4 w-4 mr-2 text-brand-medium-blue" />
                  {getFormattedElectionNameFromDate(measure.electionDate)} {isElectionPast(measure.electionDate) ? <span className="ml-2 text-xs font-semibold text-gray-500">(Past Election)</span> : ""}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <InformationCircleIcon className="h-16 w-16 text-brand-light-blue-grey mx-auto mb-4" />
            <p className="text-xl text-brand-medium-blue">
              No ballot measures found {selectedElectionFilter ? `for ${currentFilteredElectionName}` : 'matching your criteria'}.
            </p>
            {selectedElectionFilter && (
                <p className="text-brand-light-blue-grey">Try selecting "All Elections" or a different election.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function (can be moved to useBallot or dataService if used elsewhere consistently)
const isElectionPast = (electionDate: string): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(electionDate + 'T00:00:00') < today;
};

export default BallotMeasuresListPage;
