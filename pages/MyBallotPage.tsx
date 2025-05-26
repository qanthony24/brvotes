
import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useBallot } from '../hooks/useBallot';
import { getCandidateById, getOfficeById, getFormattedElectionNameFromDate, getResultsForElection, getBallotMeasureById, getBallotMeasuresByElectionDate, getCycleByElectionDate } from '../services/dataService';
import { Candidate, Office, BallotEntry, OfficeElectionResults, BallotMeasure, CandidateSelection, MeasureStance, Cycle, ReminderSettings } from '../types';
import { TrashIcon, UserCircleIcon, ArrowPathIcon, CheckBadgeIcon, ArrowDownTrayIcon, CalendarDaysIcon, LockClosedIcon, ChartBarIcon, InformationCircleIcon, DocumentCheckIcon, HandThumbUpIcon, HandThumbDownIcon, NoSymbolIcon, BellAlertIcon, PencilSquareIcon, CheckCircleIcon as SolidCheckCircleIcon } from '@heroicons/react/24/outline';
import ElectionResultsDisplay from '../components/election/ElectionResultsDisplay'; 
import ReminderSetupModal from '../components/reminders/ReminderSetupModal';

interface PopulatedCandidateEntry {
  candidate: Candidate;
  office: Office;
}

interface PopulatedMeasureEntry {
  measure: BallotMeasure;
  userStance: 'support' | 'oppose' | null;
}

const MyBallotPage: React.FC = () => {
  const { 
    currentElectionEntries, 
    selectedElectionDate, 
    setSelectedElectionDate,
    archivedElectionDates,
    definedElectionEventDates,
    removeCandidateSelection,
    removeMeasureStance,
    setMeasureStance, 
    clearBallotForElection,
    isElectionPast,
    getSelectedMeasureStance,
    getElectionReminder, // New from hook
    setElectionReminder  // New from hook
  } = useBallot();
  
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);
  const [electionResults, setElectionResults] = useState<OfficeElectionResults[]>([]);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [currentElectionCycleDetails, setCurrentElectionCycleDetails] = useState<Cycle | null>(null);
  const [existingReminder, setExistingReminder] = useState<ReminderSettings | null>(null);


  const allKnownElectionDates = useMemo(() => {
    const datesFromDefinedEvents = definedElectionEventDates.map(c => c.electionDate);
    const uniqueDates = Array.from(new Set([...datesFromDefinedEvents, ...archivedElectionDates]));
    const today = new Date(); today.setHours(0,0,0,0);
    return uniqueDates.sort((a, b) => {
        const dateA = new Date(a);
        const dateB = new Date(b);
        const aIsPast = dateA < today;
        const bIsPast = dateB < today;
        if (aIsPast && !bIsPast) return 1; 
        if (!aIsPast && bIsPast) return -1; 
        if (aIsPast && bIsPast) return dateB.getTime() - dateA.getTime(); 
        // For future dates, sort upcoming first (closer to today)
        if (!aIsPast && !bIsPast) return dateA.getTime() - dateB.getTime();
        return 0; // Should not happen with above logic
    });
  }, [definedElectionEventDates, archivedElectionDates]);

  useEffect(() => {
    if (!selectedElectionDate && allKnownElectionDates.length > 0) {
        // Default to the first one, which should be the most relevant upcoming or most recent past
        setSelectedElectionDate(allKnownElectionDates[0]);
    }
  }, [selectedElectionDate, allKnownElectionDates, setSelectedElectionDate]);

  const currentElectionIsPast = selectedElectionDate ? isElectionPast(selectedElectionDate) : false;

  useEffect(() => {
    if (selectedElectionDate) {
      setCurrentElectionCycleDetails(getCycleByElectionDate(selectedElectionDate));
      setExistingReminder(getElectionReminder(selectedElectionDate));
      if (currentElectionIsPast) {
        const results = getResultsForElection(selectedElectionDate);
        setElectionResults(results);
      } else {
        setElectionResults([]);
      }
    } else {
      setCurrentElectionCycleDetails(null);
      setExistingReminder(null);
      setElectionResults([]);
    }
  }, [selectedElectionDate, currentElectionIsPast, getElectionReminder]);


  const populatedCandidateSelections = useMemo(() => {
    if (!selectedElectionDate) return [];
    return currentElectionEntries
      .filter((entry): entry is CandidateSelection => entry.itemType === 'candidate')
      .map(item => {
        const candidate = getCandidateById(item.candidateId);
        const office = getOfficeById(item.officeId);
        return (candidate && office) ? { candidate, office } as PopulatedCandidateEntry : null;
      })
      .filter(entry => entry !== null) as PopulatedCandidateEntry[];
  }, [currentElectionEntries, selectedElectionDate]);

  const populatedMeasureStances = useMemo(() => {
    if (!selectedElectionDate) return [];
    const measuresForElection = getBallotMeasuresByElectionDate(selectedElectionDate);
    return measuresForElection.map(measure => {
        const userStance = getSelectedMeasureStance(measure.id, selectedElectionDate);
        return { measure, userStance } as PopulatedMeasureEntry;
    });
  }, [currentElectionEntries, selectedElectionDate, getSelectedMeasureStance]);


  const groupedBallotByOffice = populatedCandidateSelections.reduce((acc, entry) => {
    const officeName = entry.office.name;
    if (!acc[officeName]) acc[officeName] = [];
    acc[officeName].push(entry);
    return acc;
  }, {} as Record<string, PopulatedCandidateEntry[]>);

  for (const officeName in groupedBallotByOffice) {
    groupedBallotByOffice[officeName].sort((a, b) => a.candidate.ballotOrder - b.candidate.ballotOrder);
  }
  
  const handleSaveBallot = () => {
    setShowSaveConfirmation(true);
    setTimeout(() => setShowSaveConfirmation(false), 3000);
  };
  
  const handleMeasureStanceChange = (measureId: number, vote: 'support' | 'oppose' | null) => {
    if (!selectedElectionDate || currentElectionIsPast) return;
    if (vote === null) {
        removeMeasureStance(measureId, selectedElectionDate);
    } else {
        setMeasureStance(measureId, vote, selectedElectionDate);
    }
  }

  const handleSaveReminder = (settings: ReminderSettings | null) => {
    if (selectedElectionDate) {
      setElectionReminder(selectedElectionDate, settings);
      setExistingReminder(settings); // Update local state to reflect change immediately
    }
    setIsReminderModalOpen(false);
  };

  if (allKnownElectionDates.length === 0 && currentElectionEntries.length === 0 && !Object.keys(getElectionReminder("")).length) { // crude check for any reminders
    return (
      <div className="text-center py-10">
        <UserCircleIcon className="h-24 w-24 text-brand-light-blue-grey mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-brand-dark-blue mb-4">My Ballot</h1>
        <p className="text-xl text-brand-medium-blue mb-6">You haven't made any selections or set any reminders yet.</p>
        <Link
          to="/"
          className="bg-brand-red hover:bg-opacity-80 hover:bg-brand-red text-white font-semibold py-3 px-6 rounded-md transition duration-150 ease-in-out text-lg"
        >
          Find Candidates
        </Link>
      </div>
    );
  }
  
  const electionDisplayName = selectedElectionDate ? getFormattedElectionNameFromDate(selectedElectionDate) : "Select an Election";

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white shadow-xl rounded-lg p-6 md:p-10 border border-brand-light-blue-grey">
        <h1 className="text-3xl font-bold text-brand-dark-blue mb-4 text-center">My Ballot</h1>
        
        <div className="mb-8">
          <label htmlFor="election-select" className="block text-sm font-medium text-brand-dark-blue mb-1">
            Select Election:
          </label>
          <select
            id="election-select"
            value={selectedElectionDate || ""}
            onChange={(e) => setSelectedElectionDate(e.target.value)}
            className="mt-1 block w-full py-2 px-3 border border-brand-light-blue-grey bg-white rounded-md shadow-sm focus:outline-none focus:ring-brand-red focus:border-brand-red sm:text-sm text-brand-dark-blue"
          >
            <option value="" disabled>-- Select an Election --</option>
            {allKnownElectionDates.map(dateStr => (
              <option key={dateStr} value={dateStr}>
                {getFormattedElectionNameFromDate(dateStr)} {isElectionPast(dateStr) ? "(Past)" : ""}
              </option>
            ))}
          </select>
        </div>

        {selectedElectionDate && (
          <>
            <h2 className="text-2xl font-semibold text-brand-dark-blue border-b-2 border-brand-light-blue-grey pb-2 mb-6 flex items-center justify-between">
              <span>{electionDisplayName}</span>
              {currentElectionIsPast && <span className="text-sm text-brand-medium-blue flex items-center"><LockClosedIcon className="h-4 w-4 mr-1"/>Archived (Read-Only)</span>}
            </h2>

            {currentElectionIsPast && electionResults.length > 0 && (
              <div className="mb-10">
                <div className="flex items-center text-2xl font-semibold text-brand-dark-blue mb-4">
                    <ChartBarIcon className="h-7 w-7 mr-2 text-brand-red" />
                    Official Election Results
                </div>
                {electionResults.map(officeResult => (
                  <ElectionResultsDisplay key={officeResult.office.id} officeResults={officeResult} />
                ))}
              </div>
            )}
            {currentElectionIsPast && electionResults.length === 0 && (
                <div className="mb-8 p-4 bg-brand-off-white rounded-md border border-brand-light-blue-grey text-center">
                    <InformationCircleIcon className="h-8 w-8 mx-auto mb-2 text-brand-medium-blue" />
                    <p className="text-brand-medium-blue">Official results for this past election are not available at this time.</p>
                </div>
            )}

            {/* Candidate Selections */}
            <div className="mt-4">
                <h3 className="text-xl font-semibold text-brand-dark-blue mb-1">
                    {currentElectionIsPast ? "Your Archived Candidate Choices" : "Your Candidate Choices"}
                </h3>
                 <p className="text-sm text-brand-medium-blue mb-6">
                    {currentElectionIsPast 
                        ? "These were your candidate selections for this past election." 
                        : "Manage your candidate selections for the upcoming election below."}
                </p>
                {populatedCandidateSelections.length === 0 ? (
                    <div className="text-center py-6">
                        <UserCircleIcon className="h-16 w-16 text-brand-light-blue-grey mx-auto mb-3" />
                        <p className="text-lg text-brand-medium-blue">
                            {currentElectionIsPast ? "You did not save any candidate selections for this election." : "No candidate selections made yet for this election."}
                        </p>
                        {!currentElectionIsPast && (
                            <Link
                            to="/"
                            className="mt-4 inline-block bg-brand-red hover:bg-opacity-80 hover:bg-brand-red text-white font-semibold py-2 px-4 rounded-md transition duration-150 ease-in-out text-base"
                            >
                            Find Candidates
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="space-y-6">
                    {Object.entries(groupedBallotByOffice).map(([officeName, entries]) => (
                        <div key={officeName} className="mb-2">
                            <h4 className="text-lg font-semibold text-brand-dark-blue mb-3">{officeName}</h4>
                            {entries.map(({ candidate, office }) => (
                                <div key={`${selectedElectionDate}-candidate-${candidate.id}`} className="bg-brand-off-white p-4 rounded-lg shadow-sm flex items-center justify-between transition-all hover:shadow-md border border-brand-light-blue-grey mb-3">
                                <div>
                                    <p className="text-md text-brand-medium-blue">
                                    {candidate.ballotOrder > 0 && <span className="font-semibold mr-1">(#{candidate.ballotOrder})</span>}
                                        {candidate.firstName} {candidate.lastName} ({candidate.party})
                                        {candidate.isIncumbent && (
                                            <span className="ml-2 text-xs font-semibold text-white bg-brand-red px-2 py-0.5 rounded-full inline-flex items-center">
                                                <CheckBadgeIcon className="h-3 w-3 mr-1" />
                                                Incumbent
                                            </span>
                                        )}
                                    </p>
                                    <Link to={`/candidate/${candidate.id}`} className="text-sm text-brand-red hover:underline">View Profile</Link>
                                </div>
                                {!currentElectionIsPast && (
                                    <button
                                        onClick={() => removeCandidateSelection(office.id, selectedElectionDate)}
                                        className="p-2 text-brand-red hover:text-opacity-80 hover:text-brand-red hover:bg-red-100 rounded-full transition-colors"
                                        aria-label={`Remove ${candidate.firstName} ${candidate.lastName} from ballot`}
                                    >
                                        <TrashIcon className="h-6 w-6" />
                                    </button>
                                )}
                                </div>
                            ))}
                        </div>
                    ))}
                    </div>
                )}
            </div>

            {/* Ballot Measures Stances */}
            {populatedMeasureStances.length > 0 && (
                <div className="mt-10 pt-6 border-t border-brand-light-blue-grey">
                    <h3 className="text-xl font-semibold text-brand-dark-blue mb-1">
                        {currentElectionIsPast ? "Your Archived Ballot Measure Stances" : "Your Ballot Measure Stances"}
                    </h3>
                    <p className="text-sm text-brand-medium-blue mb-6">
                        {currentElectionIsPast 
                            ? "These were your stances on ballot measures for this past election." 
                            : "Manage your stances for the upcoming election below."}
                    </p>
                    <div className="space-y-4">
                        {populatedMeasureStances.map(({ measure, userStance }) => (
                            <div key={`${selectedElectionDate}-measure-${measure.id}`} className="bg-brand-off-white p-4 rounded-lg shadow-sm border border-brand-light-blue-grey">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                                    <div>
                                        <p className="font-semibold text-brand-dark-blue">{measure.title}</p>
                                        <Link to={`/ballot-measure/${measure.id}`} className="text-sm text-brand-red hover:underline">View Details</Link>
                                    </div>
                                    <div className="mt-3 sm:mt-0 flex items-center space-x-2">
                                        {currentElectionIsPast ? (
                                            <span className={`px-3 py-1 text-sm font-medium rounded-full
                                                ${userStance === 'support' ? 'bg-green-100 text-green-700' : ''}
                                                ${userStance === 'oppose' ? 'bg-red-100 text-red-700' : ''}
                                                ${!userStance ? 'bg-gray-100 text-gray-700' : ''}`}>
                                                {userStance ? userStance.charAt(0).toUpperCase() + userStance.slice(1) : 'No Stance'}
                                            </span>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => handleMeasureStanceChange(measure.id, 'support')}
                                                    className={`p-2 rounded-full transition-colors ${userStance === 'support' ? 'bg-green-500 text-white ring-2 ring-green-600 ring-offset-1' : 'bg-gray-200 hover:bg-green-100 text-gray-600'}`}
                                                    aria-label={`Support ${measure.title}`}
                                                    title="Support"
                                                >
                                                    <HandThumbUpIcon className="h-5 w-5"/>
                                                </button>
                                                <button
                                                    onClick={() => handleMeasureStanceChange(measure.id, 'oppose')}
                                                    className={`p-2 rounded-full transition-colors ${userStance === 'oppose' ? 'bg-red-500 text-white ring-2 ring-red-600 ring-offset-1' : 'bg-gray-200 hover:bg-red-100 text-gray-600'}`}
                                                    aria-label={`Oppose ${measure.title}`}
                                                    title="Oppose"
                                                >
                                                    <HandThumbDownIcon className="h-5 w-5"/>
                                                </button>
                                                {userStance && (
                                                     <button
                                                        onClick={() => handleMeasureStanceChange(measure.id, null)}
                                                        className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-600 transition-colors"
                                                        aria-label={`Remove stance for ${measure.title}`}
                                                        title="Clear Stance"
                                                    >
                                                        <NoSymbolIcon className="h-5 w-5"/>
                                                    </button>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
          </>
        )}
      </div>

      {selectedElectionDate && (
          <div className="mt-8 flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
            {!currentElectionIsPast && (
                <button
                onClick={handleSaveBallot}
                className="w-full sm:w-auto flex items-center justify-center bg-brand-red hover:bg-opacity-80 hover:bg-brand-red text-white font-semibold py-3 px-6 rounded-md transition duration-150 ease-in-out text-lg"
                >
                <ArrowDownTrayIcon className="h-6 w-6 mr-2" /> Save My Ballot
                </button>
            )}
            {!currentElectionIsPast && currentElectionCycleDetails && (
                <button
                  onClick={() => setIsReminderModalOpen(true)}
                  className={`w-full sm:w-auto flex items-center justify-center font-semibold py-3 px-6 rounded-md transition duration-150 ease-in-out text-lg
                              ${existingReminder ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-brand-dark-blue hover:bg-opacity-80 hover:bg-brand-dark-blue text-white'}`}
                >
                  {existingReminder ? <SolidCheckCircleIcon className="h-6 w-6 mr-2" /> : <BellAlertIcon className="h-6 w-6 mr-2" />}
                  {existingReminder ? 'View/Edit Reminder' : 'Set Reminder'}
                </button>
              )}
            <button
            onClick={() => {
                if (currentElectionIsPast || !selectedElectionDate) return;
                if (window.confirm(`Are you sure you want to clear all your selections and stances for the ${electionDisplayName}? This action cannot be undone.`)) {
                    clearBallotForElection(selectedElectionDate);
                }
            }}
            className={`w-full sm:w-auto flex items-center justify-center font-semibold py-3 px-6 rounded-md transition duration-150 ease-in-out text-lg ${
                currentElectionIsPast || (currentElectionEntries.length === 0 && populatedMeasureStances.every(m => !m.userStance))
                ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                : 'bg-brand-medium-blue hover:bg-opacity-80 hover:bg-brand-medium-blue text-white'
            }`}
            disabled={currentElectionIsPast || (currentElectionEntries.length === 0 && populatedMeasureStances.every(m => !m.userStance))}
            >
            <ArrowPathIcon className="h-6 w-6 mr-2" /> Clear This Election's Ballot
            </button>
        </div>
      )}
      {showSaveConfirmation && (
        <div 
            className="fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-opacity duration-300 ease-in-out"
            role="alert"
        >
            Ballot for {electionDisplayName} saved successfully!
        </div>
      )}
       {isReminderModalOpen && currentElectionCycleDetails && (
        <ReminderSetupModal
          isOpen={isReminderModalOpen}
          onClose={() => setIsReminderModalOpen(false)}
          electionCycle={currentElectionCycleDetails}
          electionDisplayName={electionDisplayName}
          initialReminderSettings={existingReminder}
          onSaveReminder={handleSaveReminder}
        />
      )}
    </div>
  );
};

export default MyBallotPage;
