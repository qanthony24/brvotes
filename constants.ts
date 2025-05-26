
import { Office, Cycle, SurveyQuestion, Candidate, OfficeElectionResults, BallotMeasure } from './types';

// Utility to format election date string into a user-friendly name
export const formatElectionName = (electionDate: string, baseName?: string): string => {
  try {
    const date = new Date(electionDate + 'T00:00:00'); // Ensure local timezone interpretation
    const namePart = baseName ? baseName.split(' ')[1] : "Election"; // e.g. General from "2026 General"
    return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} ${namePart}`;
  } catch (e) {
    console.error("Error formatting election date:", electionDate, e);
    return baseName || electionDate; // Fallback
  }
};

const RAW_DATA = {
  "offices": [
    { "id": 1, "name": "Mayor-President", "slug": "mayor-president" },
    { "id": 2, "name": "State Representative", "slug": "state-representative" },
    { "id": 3, "name": "City Court Judge", "slug": "city-court-judge" }
  ],
  "cycles": [
    {
      "id": 1,
      "name": "2026 General", // Base name
      "slug": "2026-general",
      "electionDate": "2026-11-06",
      "evStart": "2026-10-23",
      "evEnd": "2026-11-01"
    },
    {
      "id": 2,
      "name": "2025 Municipal", // Base name
      "slug": "2025-municipal",
      "electionDate": "2025-11-05",
      "evStart": "2025-10-20",
      "evEnd": "2025-11-03"
    },
    { // Adding a past election for testing archiving
      "id": 3,
      "name": "2024 Primary", // Base name
      "slug": "2024-primary",
      "electionDate": "2024-03-05",
      "evStart": "2024-02-15",
      "evEnd": "2024-03-01"
    }
  ],
  "surveyQuestions": [
    { "key": "why_running", "question": "Why are you running?" },
    { "key": "top_priority", "question": "What is your top priority if elected?" },
    { "key": "experience", "question": "What experience qualifies you for this office?" }
  ],
  "candidates": [
    {
      "id": 1, "firstName": "John", "lastName": "Smith", "slug": "john-smith", "photoUrl": "https://picsum.photos/seed/johnsmith/200/200", "party": "Democratic", "officeId": 1, "cycleId": 1, "website": "https://johnsmithforbr.com", "email": "john@smithcampaign.org", "phone": "225-555-0101", "socialLinks": { "facebook": "https://facebook.com/jsmith", "twitter": "https://twitter.com/jsmith", "instagram": "" }, "bio": "John Smith has served 8 years on the City Council and is running to bring transparency to local government.", "mailingAddress": "123 Government St.\nBaton Rouge, LA 70801", "surveyResponses": { "why_running": "I want to ensure every voice is heard in City Hall.", "top_priority": "Balancing the city budget without cutting essential services.", "experience": "Two terms as Councilman, former finance committee chair." }, "ballotOrder": 1, "isIncumbent": true
    },
    {
      "id": 2, "firstName": "Jane", "lastName": "Doe", "slug": "jane-doe", "photoUrl": "https://picsum.photos/seed/janedoe/200/200", "party": "Republican", "officeId": 2, "cycleId": 1, "website": "", "email": "jane@doeforstate.com", "phone": "225-555-0202", "socialLinks": { "facebook": "https://facebook.com/janedoe", "twitter": "", "instagram": "https://instagram.com/janedoe" }, "bio": "A lifelong educator, Jane Doe has spent 15 years improving public schools in EBR Parish.", "mailingAddress": "PO Box 456\nBaton Rouge, LA 70802", "surveyResponses": { "why_running": "To put education and families first in the legislature.", "top_priority": "Increase teacher pay and reduce classroom sizes.", "experience": "School board president, curriculum developer." }, "ballotOrder": 1, "isIncumbent": false
    },
    {
      "id": 3, "firstName": "Frank", "lastName": "Lucas", "slug": "frank-lucas", "photoUrl": "https://picsum.photos/seed/franklucas/200/200", "party": "Democratic", "officeId": 1, "cycleId": 2, "website": "https://lucas4mayor.com", "email": "contact@anderson2024.org", "phone": "", "socialLinks": { "facebook": "", "twitter": "https://twitter.com/lucas4mayor", "instagram": "" }, "bio": "Frank Lucas is a small-business owner and civic volunteer with a vision for safer streets.", "mailingAddress": "", "surveyResponses": { "why_running": "To bring real economic development to neighborhoods.", "top_priority": "Strengthen public safety and neighborhood policing.", "experience": "Former Chamber of Commerce president." }, "ballotOrder": 1, "isIncumbent": false
    },
    {
      "id": 4, "firstName": "Frankie", "lastName": "Lucas", "slug": "frankie-lucas", "photoUrl": "https://picsum.photos/seed/frankielucas/200/200", "party": "Republican", "officeId": 3, "cycleId": 2, "website": "", "email": "quentin@qanderson.com", "phone": "225-555-0303", "socialLinks": { "facebook": "https://facebook.com/frankielucas", "twitter": "", "instagram": "" }, "bio": "Frankie Lucas has been a public defender for 12 years and seeks to reform our criminal justice system.", "mailingAddress": "789 Justice Ave.\nBaton Rouge, LA 70803", "surveyResponses": { "why_running": "To ensure equal justice for all residents.", "top_priority": "Reduce case backlogs and modernize the courts.", "experience": "Senior public defender, legal aid board member." }, "ballotOrder": 1, "isIncumbent": true
    },
    {
      "id": 5, "firstName": "Alice", "lastName": "Johnson", "slug": "alice-johnson", "photoUrl": "https://picsum.photos/seed/alicejohnson/200/200", "party": "Independent", "officeId": 1, "cycleId": 1, "website": "https://aliceforpeople.com", "email": "contact@aliceforpeople.com", "phone": "225-555-0404", "socialLinks": { "twitter": "https://twitter.com/aliceforpeople" }, "bio": "Alice Johnson is a community organizer focused on sustainable development and local empowerment.", "mailingAddress": "456 Community Way\nBaton Rouge, LA 70805", "surveyResponses": { "why_running": "To bring a fresh perspective and community-driven solutions to city hall.", "top_priority": "Investing in green infrastructure and supporting small businesses.", "experience": "10 years as director of a local non-profit, extensive grant writing and project management." }, "ballotOrder": 2, "isIncumbent": false
    },
    { // Candidate for the past election
      "id": 6, "firstName": "Peter", "lastName": "Pan", "slug": "peter-pan", "photoUrl": "https://picsum.photos/seed/peterpan/200/200", "party": "Green", "officeId": 2, "cycleId": 3, "website": "https://neverland.com", "email": "peter@neverland.com", "phone": "225-555-0505", "bio": "Peter Pan believes in eternal youth and fiscal responsibility.", "surveyResponses": { "why_running": "To never grow up the budget deficit.", "top_priority": "More pixie dust for local parks.", "experience": "Leader of the Lost Boys." }, "ballotOrder": 1, "isIncumbent": false
    },
    { // Another candidate for the past election (cycleId 3), same office as Peter Pan (officeId 2)
      "id": 7, "firstName": "Wendy", "lastName": "Darling", "slug": "wendy-darling", "photoUrl": "https://picsum.photos/seed/wendydarling/200/200", "party": "Independent", "officeId": 2, "cycleId": 3, "website": "https://wendycares.org", "email": "wendy@darling.com", "phone": "225-555-0606", "bio": "Wendy Darling is focused on community storytelling and local arts.", "surveyResponses": { "why_running": "To bring more imagination to the State Capitol.", "top_priority": "Funding for public libraries and arts programs.", "experience": "Community volunteer and advocate." }, "ballotOrder": 2, "isIncumbent": false
    },
    { // Candidate for past election (cycleId 3), different office (Mayor-President, officeId 1)
        "id": 8, "firstName": "Captain", "lastName": "Hook", "slug": "captain-hook", "photoUrl": "https://picsum.photos/seed/captainhook/200/200", "party": "Republican", "officeId": 1, "cycleId": 3, "website": "https://hookformayor.com", "email": "captain@hook.com", "phone": "225-555-0707", "bio": "Captain Hook promises strong leadership and a firm hand on the city's tiller.", "surveyResponses": { "why_running": "To restore order and discipline to city government.", "top_priority": "Cracking down on crocodiles in the city's waterways.", "experience": "Years of maritime command experience." }, "ballotOrder": 1, "isIncumbent": false
    }
  ],
  "ballotMeasures": [
    {
      "id": 101,
      "slug": "library-funding-2026",
      "title": "Proposition L: Library System Millage Renewal",
      "electionDate": "2026-11-06",
      "ballotLanguage": "Shall the Parish of East Baton Rouge continue to levy a special tax of 2.5 mills on all property subject to taxation in the Parish for a period of ten (10) years, beginning with the year 2027 and ending with the year 2036, for the purpose of acquiring, constructing, improving, maintaining and operating public libraries in the Parish, including the purchase of books, periodicals, and equipment, and providing library services to the public?",
      "laymansExplanation": "This measure asks voters if they want to continue an existing property tax that funds the public library system. The tax rate and purpose remain the same.",
      "yesVoteMeans": "You agree to continue the existing 2.5 mills property tax for ten more years to fund public libraries.",
      "noVoteMeans": "You want to discontinue this 2.5 mills property tax, which would reduce funding for public libraries."
    },
    {
      "id": 102,
      "slug": "parks-bond-2025",
      "title": "Parks and Recreation Bond Issue",
      "electionDate": "2025-11-05",
      "ballotLanguage": "Shall the Parish of East Baton Rouge incur debt and issue bonds in an amount not to exceed Fifty Million Dollars ($50,000,000), to run not exceeding twenty (20) years from date thereof, with interest at a rate not exceeding the maximum allowed by law, for the purpose of acquiring, constructing, and improving public parks, recreational facilities, and green spaces, including the acquisition of land and equipment therefor?",
      "laymansExplanation": "This measure asks voters to approve the parish taking on up to $50 million in debt (by selling bonds) to pay for new and improved parks and recreation facilities. This debt would be paid back over up to 20 years, likely through property taxes.",
      "yesVoteMeans": "You authorize the parish to borrow up to $50 million for parks and recreation projects, which will be repaid with interest over time.",
      "noVoteMeans": "You do not want the parish to borrow money for these parks and recreation projects at this time."
    },
     {
      "id": 103,
      "slug": "school-safety-2024",
      "title": "School Safety Enhancement Millage",
      "electionDate": "2024-03-05", // Past election
      "ballotLanguage": "Shall the School Board of East Baton Rouge Parish levy an additional tax of 1.0 mill on all property subject to taxation in the Parish for a period of five (5) years, beginning with the year 2024, for the purpose of funding school safety enhancements, including but not limited to security personnel, equipment, and mental health support services in public schools?",
      "laymansExplanation": "This measure proposed a new 1.0 mill property tax for five years specifically to improve safety and security in public schools.",
      "yesVoteMeans": "You supported a new 1.0 mill property tax for five years to fund school safety initiatives.",
      "noVoteMeans": "You opposed this new 1.0 mill property tax for school safety initiatives."
    }
  ]
};

export const OFFICES_DATA: Office[] = RAW_DATA.offices;
export const BALLOT_MEASURES_DATA: BallotMeasure[] = RAW_DATA.ballotMeasures;

// Sort cycles by electionDate: upcoming ones first, then past ones, most recent first for both groups.
const today = new Date();
today.setHours(0,0,0,0); // Normalize today's date

export const CYCLES_DATA: Cycle[] = RAW_DATA.cycles
  .map(cycle => ({
    ...cycle,
    // The name property will now store the formatted name for display convenience
    // name: formatElectionName(cycle.electionDate, cycle.name) 
    // Decided to format on-the-fly in components to keep original name if needed elsewhere.
  }))
  .sort((a, b) => {
    const dateA = new Date(a.electionDate);
    const dateB = new Date(b.electionDate);
    // If both are future or both are past, sort by date (most recent/upcoming first)
    if ((dateA >= today && dateB >= today) || (dateA < today && dateB < today)) {
      return dateB.getTime() - dateA.getTime(); // Descending for future, also descending for past (most recent past)
    }
    // If one is future and other is past, future comes first
    return dateA >= today ? -1 : 1;
  });


export const SURVEY_QUESTIONS_DATA: SurveyQuestion[] = RAW_DATA.surveyQuestions;
export const CANDIDATES_DATA: Candidate[] = RAW_DATA.candidates.map(c => ({
    ...c,
    photoUrl: c.photoUrl || `https://picsum.photos/seed/${c.slug}/200/200`,
    isIncumbent: c.isIncumbent || false,
}));

export const PARTIES = ["Democratic", "Republican", "Independent", "Green", "Other"];


// Mock Election Results Data
// Keyed by electionDate, then by officeId
interface RawElectionResult {
  officeId: number;
  candidateResults: {
    candidateId: number; // Corresponds to Candidate.id
    votes: number;
    isWinner: boolean;
  }[];
}

interface RawElectionResultsByDate {
  [electionDate: string]: RawElectionResult[];
}

const RAW_ELECTION_RESULTS_DATA: RawElectionResultsByDate = {
  "2024-03-05": [ // For the "2024 Primary" (cycleId: 3)
    {
      officeId: 2, // State Representative
      candidateResults: [
        { candidateId: 6, votes: 4500, isWinner: false }, // Peter Pan
        { candidateId: 7, votes: 5500, isWinner: true }   // Wendy Darling
      ]
    },
    {
      officeId: 1, // Mayor-President
      candidateResults: [
        { candidateId: 8, votes: 12000, isWinner: true } // Captain Hook
        // Add another candidate if desired for this office in this election
      ]
    }
    // Add results for other offices in the 2024-03-05 election if needed
  ]
  // Add results for other past election dates if you have more
};

// Processed election results - this would typically come from a backend or be processed once
// For now, we process it here.
export const ELECTION_RESULTS_DATA: OfficeElectionResults[] = [];

for (const electionDate in RAW_ELECTION_RESULTS_DATA) {
  const officeResultsForDate = RAW_ELECTION_RESULTS_DATA[electionDate];
  officeResultsForDate.forEach(rawOfficeResult => {
    const office = OFFICES_DATA.find(o => o.id === rawOfficeResult.officeId);
    if (!office) return;

    let totalVotesInOffice = 0;
    rawOfficeResult.candidateResults.forEach(cr => totalVotesInOffice += cr.votes);

    const processedCandidateResults = rawOfficeResult.candidateResults.map(cr => {
      const candidate = CANDIDATES_DATA.find(c => c.id === cr.candidateId);
      return {
        candidateId: cr.candidateId,
        candidateName: candidate ? `${candidate.firstName} ${candidate.lastName}` : 'Unknown Candidate',
        party: candidate ? candidate.party : 'N/A',
        photoUrl: candidate?.photoUrl,
        votes: cr.votes,
        percentage: totalVotesInOffice > 0 ? parseFloat(((cr.votes / totalVotesInOffice) * 100).toFixed(1)) : 0,
        isWinner: cr.isWinner,
      };
    }).sort((a,b) => b.votes - a.votes); // Sort by votes descending

    ELECTION_RESULTS_DATA.push({
      electionDate: electionDate,
      office: office,
      results: processedCandidateResults,
      totalVotesInOffice: totalVotesInOffice,
    });
  });
}
