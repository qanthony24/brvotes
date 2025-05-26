
import { Candidate, Office, Cycle, SurveyQuestion, OfficeElectionResults, BallotMeasure } from '../types';
import { 
    CANDIDATES_DATA, 
    OFFICES_DATA, 
    CYCLES_DATA, 
    SURVEY_QUESTIONS_DATA, 
    ELECTION_RESULTS_DATA, // Import mock results
    BALLOT_MEASURES_DATA, // Import ballot measures
    formatElectionName as formatNameUtil 
} from '../constants';

export const getAllCandidates = (): Candidate[] => {
  return CANDIDATES_DATA;
};

export const getCandidateById = (id: number): Candidate | null => {
  return CANDIDATES_DATA.find(candidate => candidate.id === id) || null;
};

export const getCandidatesByOfficeAndCycle = (officeId: number, cycleId: number): Candidate[] => {
  // cycleId here is the numeric ID of the Cycle/ElectionEvent
  return CANDIDATES_DATA.filter(c => c.officeId === officeId && c.cycleId === cycleId);
};

export const getAllOffices = (): Office[] => {
  return OFFICES_DATA;
};

export const getOfficeById = (id: number): Office | null => {
  return OFFICES_DATA.find(office => office.id === id) || null;
};

export const getAllCycles = (): Cycle[] => {
  // CYCLES_DATA is already sorted in constants.ts
  return CYCLES_DATA;
};

export const getCycleById = (id: number): Cycle | null => {
  // id here is the numeric ID of the Cycle/ElectionEvent
  return CYCLES_DATA.find(cycle => cycle.id === id) || null;
};

export const getCycleByElectionDate = (electionDate: string): Cycle | null => {
  return CYCLES_DATA.find(cycle => cycle.electionDate === electionDate) || null;
};

export const getSurveyQuestions = (): SurveyQuestion[] => {
  return SURVEY_QUESTIONS_DATA;
};

export const getSurveyQuestionByKey = (key: string): SurveyQuestion | null => {
    return SURVEY_QUESTIONS_DATA.find(sq => sq.key === key) || null;
};

// --- Ballot Measures ---
export const getAllBallotMeasures = (): BallotMeasure[] => {
  return BALLOT_MEASURES_DATA;
};

export const getBallotMeasureById = (id: number): BallotMeasure | null => {
  return BALLOT_MEASURES_DATA.find(measure => measure.id === id) || null;
};

export const getBallotMeasuresByElectionDate = (electionDate: string): BallotMeasure[] => {
  return BALLOT_MEASURES_DATA.filter(measure => measure.electionDate === electionDate);
};


// Helper function to get the display name for an election, using its date and original name.
export const getFormattedElectionName = (cycle: Cycle | null): string => {
  if (!cycle) return 'N/A';
  return formatNameUtil(cycle.electionDate, cycle.name);
};

// Helper function to get the display name for an election by its date string
export const getFormattedElectionNameFromDate = (electionDate: string | null): string => {
    if (!electionDate) return 'N/A';
    const cycle = getCycleByElectionDate(electionDate);
    return cycle ? formatNameUtil(cycle.electionDate, cycle.name) : formatNameUtil(electionDate, "Election");
};

/**
 * Fetches all election results for a specific election date.
 */
export const getResultsForElection = (electionDate: string): OfficeElectionResults[] => {
  return ELECTION_RESULTS_DATA.filter(result => result.electionDate === electionDate);
};
