
import React, { useState, useEffect, createContext, useContext, ReactNode, useCallback, useMemo } from 'react';
import { BallotEntry, BallotArchive, CandidateSelection, MeasureStance, Cycle, ReminderSettings } from '../types';
import { getAllCycles } from '../services/dataService'; // To determine default election

interface BallotContextType {
  currentElectionEntries: BallotEntry[];
  selectedElectionDate: string | null;
  setSelectedElectionDate: (electionDate: string | null) => void;
  archivedElectionDates: string[]; 
  definedElectionEventDates: Cycle[]; 
  
  addCandidateSelection: (candidateId: number, officeId: number, electionDate: string) => void;
  removeCandidateSelection: (officeId: number, electionDate: string) => void;
  isCandidateSelected: (candidateId: number, officeId: number, electionDate: string) => boolean;
  
  setMeasureStance: (measureId: number, vote: 'support' | 'oppose', electionDate: string) => void;
  removeMeasureStance: (measureId: number, electionDate: string) => void;
  getSelectedMeasureStance: (measureId: number, electionDate: string) => 'support' | 'oppose' | null;

  clearBallotForElection: (electionDate: string) => void;
  isElectionPast: (electionDate: string) => boolean;

  // Reminder System
  setElectionReminder: (electionDate: string, settings: ReminderSettings | null) => void;
  getElectionReminder: (electionDate: string) => ReminderSettings | null;
}

const BallotContext = createContext<BallotContextType | undefined>(undefined);
const BALLOT_ARCHIVE_LOCAL_STORAGE_KEY = 'brVotesBallotArchive';
const REMINDERS_ARCHIVE_LOCAL_STORAGE_KEY = 'brVotesRemindersArchive';

const getDefaultElectionDate = (allCycles: Cycle[], archivedBallotDates: string[], archivedReminderDates: string[]): string | null => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const allKnownDates = Array.from(new Set([
    ...allCycles.map(c => c.electionDate), 
    ...archivedBallotDates,
    ...archivedReminderDates
  ]));

  if (allKnownDates.length === 0) return null;

  const sortedUniqueDates = allKnownDates.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  
  const upcomingOrCurrent = sortedUniqueDates.find(dateStr => new Date(dateStr) >= today);
  if (upcomingOrCurrent) return upcomingOrCurrent;
  
  // If all dates are past, return the most recent past date
  const pastDates = sortedUniqueDates.filter(dateStr => new Date(dateStr) < today).sort((a,b) => new Date(b).getTime() - new Date(a).getTime());
  return pastDates.length > 0 ? pastDates[0] : null;
};

export const BallotProvider = ({ children }: { children: ReactNode }): JSX.Element => {
  const [ballotArchive, setBallotArchive] = useState<BallotArchive>(() => {
    try {
      const archive = window.localStorage.getItem(BALLOT_ARCHIVE_LOCAL_STORAGE_KEY);
      return archive ? JSON.parse(archive) : {};
    } catch (error) {
      console.error("Error reading ballot archive from localStorage", error);
      return {};
    }
  });

  const [remindersArchive, setRemindersArchive] = useState<Record<string, ReminderSettings>>(() => {
    try {
      const archive = window.localStorage.getItem(REMINDERS_ARCHIVE_LOCAL_STORAGE_KEY);
      return archive ? JSON.parse(archive) : {};
    } catch (error) {
      console.error("Error reading reminders archive from localStorage", error);
      return {};
    }
  });

  const definedElectionEvents = getAllCycles();
  const [selectedElectionDate, setSelectedElectionDateState] = useState<string | null>(() => 
    getDefaultElectionDate(definedElectionEvents, Object.keys(ballotArchive), Object.keys(remindersArchive))
  );

  useEffect(() => {
    try {
      window.localStorage.setItem(BALLOT_ARCHIVE_LOCAL_STORAGE_KEY, JSON.stringify(ballotArchive));
    } catch (error) {
      console.error("Error saving ballot archive to localStorage", error);
    }
  }, [ballotArchive]);

  useEffect(() => {
    try {
      window.localStorage.setItem(REMINDERS_ARCHIVE_LOCAL_STORAGE_KEY, JSON.stringify(remindersArchive));
    } catch (error) {
      console.error("Error saving reminders archive to localStorage", error);
    }
  }, [remindersArchive]);

  const setSelectedElectionDate = (electionDate: string | null) => {
    setSelectedElectionDateState(electionDate);
  };
  
  const currentElectionEntries = useMemo(() => {
    return selectedElectionDate ? ballotArchive[selectedElectionDate] || [] : [];
  }, [ballotArchive, selectedElectionDate]);

  const archivedElectionDates = useMemo(() => {
    const ballotDates = Object.keys(ballotArchive).filter(dateKey => ballotArchive[dateKey] && ballotArchive[dateKey].length > 0);
    const reminderDates = Object.keys(remindersArchive).filter(dateKey => remindersArchive[dateKey]);
    return Array.from(new Set([...ballotDates, ...reminderDates]));
  }, [ballotArchive, remindersArchive]);

  // --- Candidate Functions ---
  const addCandidateSelection = useCallback((candidateId: number, officeId: number, electionDate: string) => {
    setBallotArchive(prevArchive => {
      const entriesForDate = prevArchive[electionDate] ? [...prevArchive[electionDate]] : [];
      const otherEntries = entriesForDate.filter(
        entry => entry.itemType !== 'candidate' || (entry.itemType === 'candidate' && entry.officeId !== officeId)
      );
      const newSelection: CandidateSelection = { itemType: 'candidate', candidateId, officeId };
      return {
        ...prevArchive,
        [electionDate]: [...otherEntries, newSelection]
      };
    });
  }, []);

  const removeCandidateSelection = useCallback((officeId: number, electionDate: string) => {
    setBallotArchive(prevArchive => {
      const entriesForDate = prevArchive[electionDate];
      if (!entriesForDate) return prevArchive;
      const updatedEntries = entriesForDate.filter(
        entry => entry.itemType === 'measure' || (entry.itemType === 'candidate' && entry.officeId !== officeId)
      );
      if (updatedEntries.length === 0 && entriesForDate.length > 0 && !remindersArchive[electionDate]) { 
        const { [electionDate]: _, ...restOfArchive } = prevArchive;
        return restOfArchive;
      }
      return { ...prevArchive, [electionDate]: updatedEntries };
    });
  }, [remindersArchive]);

  const isCandidateSelected = useCallback((candidateId: number, officeId: number, electionDate: string): boolean => {
    const entriesForDate = ballotArchive[electionDate];
    if (!entriesForDate) return false;
    return entriesForDate.some(entry => 
      entry.itemType === 'candidate' && 
      entry.candidateId === candidateId && 
      entry.officeId === officeId
    );
  }, [ballotArchive]);

  // --- Measure Functions ---
  const setMeasureStance = useCallback((measureId: number, vote: 'support' | 'oppose', electionDate: string) => {
    setBallotArchive(prevArchive => {
      const entriesForDate = prevArchive[electionDate] ? [...prevArchive[electionDate]] : [];
      const otherEntries = entriesForDate.filter(
        entry => entry.itemType !== 'measure' || (entry.itemType === 'measure' && entry.measureId !== measureId)
      );
      const newStance: MeasureStance = { itemType: 'measure', measureId, vote };
      return {
        ...prevArchive,
        [electionDate]: [...otherEntries, newStance]
      };
    });
  }, []);

  const removeMeasureStance = useCallback((measureId: number, electionDate: string) => {
    setBallotArchive(prevArchive => {
      const entriesForDate = prevArchive[electionDate];
      if (!entriesForDate) return prevArchive;
      const updatedEntries = entriesForDate.filter(
        entry => entry.itemType === 'candidate' || (entry.itemType === 'measure' && entry.measureId !== measureId)
      );
       if (updatedEntries.length === 0 && entriesForDate.length > 0 && !remindersArchive[electionDate]) { 
        const { [electionDate]: _, ...restOfArchive } = prevArchive;
        return restOfArchive;
      }
      return { ...prevArchive, [electionDate]: updatedEntries };
    });
  }, [remindersArchive]);

  const getSelectedMeasureStance = useCallback((measureId: number, electionDate: string): 'support' | 'oppose' | null => {
    const entriesForDate = ballotArchive[electionDate];
    if (!entriesForDate) return null;
    const measureEntry = entriesForDate.find(entry => entry.itemType === 'measure' && entry.measureId === measureId) as MeasureStance | undefined;
    return measureEntry ? measureEntry.vote : null;
  }, [ballotArchive]);

  // --- General Ballot Functions ---
  const clearBallotForElection = useCallback((electionDate: string) => {
    setBallotArchive(prevArchive => {
      const { [electionDate]: _, ...restOfArchive } = prevArchive;
      return restOfArchive;
    });
    if (selectedElectionDate === electionDate && !remindersArchive[electionDate]) {
        const newBallotArchiveKeys = Object.keys(ballotArchive).filter(key => key !== electionDate);
        setSelectedElectionDateState(getDefaultElectionDate(definedElectionEvents, newBallotArchiveKeys, Object.keys(remindersArchive)));
    }
  }, [selectedElectionDate, ballotArchive, definedElectionEvents, remindersArchive]);

  const isElectionPast = useCallback((electionDate: string): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    return new Date(electionDate + 'T00:00:00') < today;
  }, []);

  // --- Reminder Functions ---
  const setElectionReminder = useCallback((electionDate: string, settings: ReminderSettings | null) => {
    setRemindersArchive(prevArchive => {
      const newArchive = { ...prevArchive };
      if (settings === null) {
        delete newArchive[electionDate];
         // If we delete a reminder for an election date that also has no ballot entries, ensure it's removed from default selection pool
        if (selectedElectionDate === electionDate && (!ballotArchive[electionDate] || ballotArchive[electionDate].length === 0)) {
            const newReminderArchiveKeys = Object.keys(newArchive);
            setSelectedElectionDateState(getDefaultElectionDate(definedElectionEvents, Object.keys(ballotArchive), newReminderArchiveKeys));
        }
      } else {
        newArchive[electionDate] = settings;
      }
      return newArchive;
    });
  }, [selectedElectionDate, ballotArchive, definedElectionEvents]);


  const getElectionReminder = useCallback((electionDate: string): ReminderSettings | null => {
    return remindersArchive[electionDate] || null;
  }, [remindersArchive]);


  return React.createElement(
    BallotContext.Provider,
    { 
      value: { 
        currentElectionEntries,
        selectedElectionDate,
        setSelectedElectionDate,
        archivedElectionDates,
        definedElectionEventDates: definedElectionEvents,
        addCandidateSelection, 
        removeCandidateSelection, 
        isCandidateSelected,
        setMeasureStance,
        removeMeasureStance,
        getSelectedMeasureStance,
        clearBallotForElection,
        isElectionPast,
        setElectionReminder,
        getElectionReminder
      } 
    },
    children
  );
};

export const useBallot = (): BallotContextType => {
  const context = useContext<BallotContextType | undefined>(BallotContext);
  if (context === undefined) {
    throw new Error('useBallot must be used within a BallotProvider');
  }
  return context;
};
