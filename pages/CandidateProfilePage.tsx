
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Candidate, SurveyQuestion, Cycle, CandidateSelection } from '../types'; // CandidateSelection instead of BallotItem
import { getCandidateById, getOfficeById, getCycleById, getSurveyQuestions, getFormattedElectionName } from '../services/dataService';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { ArrowLeftIcon, BuildingOffice2Icon, CalendarDaysIcon, GlobeAltIcon, EnvelopeIcon, PhoneIcon, UserGroupIcon, PlusCircleIcon, MinusCircleIcon, ScaleIcon, CheckBadgeIcon } from '@heroicons/react/24/outline';
import { useBallot } from '../hooks/useBallot';

// SVG Icon Components for Social Media
const FacebookIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878V15.89H8.322V12.88h2.116v-2.2c0-2.085 1.262-3.223 3.138-3.223.891 0 1.658.067 1.881.097v2.713h-1.602c-1.012 0-1.208.481-1.208 1.186v1.555H16.3l-.356 3.01H13.05v6.008C18.343 21.128 22 16.991 22 12z"/>
  </svg>
);

const XIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const InstagramIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948s.014 3.667.072 4.947c.2 4.359 2.618 6.78 6.98 6.98 1.281.059 1.689.073 4.948.073s3.667-.014 4.947-.072c4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.947s-.014-3.667-.072-4.947c-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.948-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4s1.791-4 4-4c2.209 0 4 1.79 4 4s-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const YouTubeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 2.183c-5.403 0-9.791 4.388-9.791 9.791s4.388 9.791 9.791 9.791 9.791-4.388 9.791-9.791S17.403 2.183 12 2.183zm0 17.582c-4.293 0-7.791-3.498-7.791-7.791s3.498-7.791 7.791-7.791 7.791 3.498 7.791 7.791-3.498 7.791-7.791 7.791zm-2.012-10.747L14.562 12l-4.574 2.965z"/>
  </svg>
);

const TikTokIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 0 .17.01.23.05.27.18.38.5.39.81v10.2c-.01.3-.15.58-.38.75-.23.17-.5.26-.78.25-.91-.01-1.83-.01-2.74-.01v4.51c0 1.03-.31 2.05-.93 2.95-.62.89-1.53 1.5-2.58 1.77-.04.01-.07.02-.11.02-.9.01-1.8-.01-2.7-.05-.23-.01-.45-.1-.65-.24-.23-.17-.37-.45-.38-.73v-1.8c.01-.3.15-.58.38-.75.23-.17.5-.26.78-.25.82.01 1.63.01 2.45.01V5.55c0-1.03.31-2.05.93-2.95.62-.89 1.53-1.5 2.58-1.77.04-.01.07-.02.11-.02z"/>
  </svg>
);

const CandidateProfilePage: React.FC = () => {
  const { candidateId } = useParams<{ candidateId: string }>();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [candidateCycle, setCandidateCycle] = useState<Cycle | null>(null);
  const [loading, setLoading] = useState(true);
  const { 
    addCandidateSelection, 
    removeCandidateSelection, 
    isCandidateSelected, 
    isElectionPast 
  } = useBallot();

  useEffect(() => {
    if (candidateId) {
      const id = parseInt(candidateId);
      const fetchedCandidate = getCandidateById(id);
      setCandidate(fetchedCandidate);
      if (fetchedCandidate) {
        const cycle = getCycleById(fetchedCandidate.cycleId);
        setCandidateCycle(cycle);
      }
    }
    setLoading(false);
  }, [candidateId]);

  if (loading) return <LoadingSpinner size="lg" />;
  if (!candidate || !candidateCycle) return <div className="text-center py-10 text-brand-red">Candidate or election information not found.</div>;

  const office = getOfficeById(candidate.officeId);
  const surveyQuestions = getSurveyQuestions();
  
  const electionDate = candidateCycle.electionDate;
  const selectedForBallot = isCandidateSelected(candidate.id, candidate.officeId, electionDate);
  const electionIsPastForCandidate = isElectionPast(electionDate);
  const formattedElectionDisplayName = getFormattedElectionName(candidateCycle);

  const handleBallotAction = () => {
    if (electionIsPastForCandidate) return; 

    if (selectedForBallot) {
      removeCandidateSelection(candidate.officeId, electionDate);
    } else {
      addCandidateSelection(candidate.id, candidate.officeId, electionDate);
    }
  };
  
  const fullName = `${candidate.firstName} ${candidate.lastName}`;
  const incumbentBadge = candidate.isIncumbent ? (
    <span className="ml-3 text-sm font-semibold text-white bg-brand-red px-2.5 py-1 rounded-full inline-flex items-center align-middle">
      <CheckBadgeIcon className="h-4 w-4 mr-1.5" />
      Incumbent
    </span>
  ) : null;

  const socialLinksExist = candidate.socialLinks && Object.values(candidate.socialLinks).some(link => link);

  return (
    <div className="bg-white shadow-xl rounded-lg p-6 md:p-10 max-w-4xl mx-auto border border-brand-light-blue-grey">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 inline-flex items-center text-brand-dark-blue hover:text-brand-red transition-colors font-medium"
      >
        <ArrowLeftIcon className="h-5 w-5 mr-2" />
        Back
      </button>

      <div className="flex flex-col md:flex-row items-center md:items-start mb-8">
        <img
          src={candidate.photoUrl || `https://picsum.photos/seed/${candidate.slug}/200/200`}
          alt={fullName}
          className="w-40 h-40 rounded-full object-cover border-4 border-brand-medium-blue shadow-md mb-4 md:mb-0 md:mr-8"
          onError={(e) => (e.currentTarget.src = 'https://picsum.photos/200/200?grayscale')}
        />
        <div className="text-center md:text-left">
          <h1 className="text-4xl font-bold text-brand-dark-blue">
            {fullName}
            {incumbentBadge}
          </h1>
          <p className="text-xl text-brand-medium-blue mt-1">{candidate.party}</p>
          <p className="text-lg text-brand-medium-blue mt-2 flex items-center justify-center md:justify-start">
            <BuildingOffice2Icon className="h-5 w-5 mr-2 text-brand-medium-blue" /> {office?.name || 'N/A'}
          </p>
          <p className="text-lg text-brand-medium-blue mt-1 flex items-center justify-center md:justify-start">
            <CalendarDaysIcon className="h-5 w-5 mr-2 text-brand-medium-blue" /> {formattedElectionDisplayName}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <button
          onClick={handleBallotAction}
          disabled={electionIsPastForCandidate}
          className={`w-full flex items-center justify-center font-semibold py-3 px-4 rounded-md transition duration-150 ease-in-out text-white text-lg ${
            electionIsPastForCandidate
            ? 'bg-gray-400 cursor-not-allowed'
            : selectedForBallot 
              ? 'bg-brand-medium-blue hover:bg-opacity-80 hover:bg-brand-medium-blue' 
              : 'bg-brand-dark-blue hover:bg-opacity-80 hover:bg-brand-dark-blue'
          }`}
        >
          {selectedForBallot ? <MinusCircleIcon className="h-6 w-6 mr-2" /> : <PlusCircleIcon className="h-6 w-6 mr-2" />}
          {electionIsPastForCandidate ? 'Election Past' : (selectedForBallot ? 'Remove from My Ballot' : 'Add to My Ballot')}
        </button>
        <Link
          to={`/compare?officeId=${candidate.officeId}&cycleId=${candidate.cycleId}&candidate1Id=${candidate.id}`}
          className="w-full flex items-center justify-center bg-brand-red hover:bg-opacity-80 hover:bg-brand-red text-white font-semibold py-3 px-4 rounded-md transition duration-150 ease-in-out text-lg"
        >
         <ScaleIcon className="h-6 w-6 mr-2" /> Compare Candidates
        </Link>
      </div>
      
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-brand-dark-blue mb-3 border-b border-brand-light-blue-grey pb-2">Biography</h2>
        <p className="text-brand-dark-blue whitespace-pre-line leading-relaxed">{candidate.bio || 'No biography provided.'}</p>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-brand-dark-blue mb-4 border-b border-brand-light-blue-grey pb-2">Survey Responses</h2>
        {surveyQuestions.length > 0 ? (
          <div className="space-y-6">
            {surveyQuestions.map((sq) => (
              <div key={sq.key} className="bg-brand-off-white p-4 rounded-md shadow-sm border border-brand-light-blue-grey">
                <h3 className="text-lg font-semibold text-brand-dark-blue">{sq.question}</h3>
                <p className="text-brand-medium-blue mt-1 whitespace-pre-line">
                  {candidate.surveyResponses?.[sq.key] || <span className="italic">No response provided.</span>}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-brand-medium-blue italic">No survey questions available for this election.</p>
        )}
      </div>
      
      <div>
        <h2 className="text-2xl font-semibold text-brand-dark-blue mb-3 border-b border-brand-light-blue-grey pb-2">Contact Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-brand-medium-blue mb-4">
          {candidate.website && (
            <p className="flex items-center"><GlobeAltIcon className="h-5 w-5 mr-2 text-brand-medium-blue" /><a href={candidate.website} target="_blank" rel="noopener noreferrer" className="text-brand-red hover:underline break-all">{candidate.website}</a></p>
          )}
          {candidate.email && (
            <p className="flex items-center"><EnvelopeIcon className="h-5 w-5 mr-2 text-brand-medium-blue" /><a href={`mailto:${candidate.email}`} className="text-brand-red hover:underline break-all">{candidate.email}</a></p>
          )}
          {candidate.phone && (
            <p className="flex items-center"><PhoneIcon className="h-5 w-5 mr-2 text-brand-medium-blue" />{candidate.phone}</p>
          )}
        </div>
        
        {socialLinksExist && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold text-brand-dark-blue mb-2">Social Media</h3>
            <div className="flex space-x-4">
              {candidate.socialLinks?.facebook && (
                <a href={candidate.socialLinks.facebook} target="_blank" rel="noopener noreferrer" aria-label={`${candidate.firstName} ${candidate.lastName} Facebook`} className="text-brand-medium-blue hover:text-brand-red transition-colors">
                  <FacebookIcon className="w-6 h-6" />
                </a>
              )}
              {candidate.socialLinks?.twitter && ( 
                <a href={candidate.socialLinks.twitter} target="_blank" rel="noopener noreferrer" aria-label={`${candidate.firstName} ${candidate.lastName} X Profile`} className="text-brand-medium-blue hover:text-brand-red transition-colors">
                  <XIcon className="w-6 h-6" />
                </a>
              )}
              {candidate.socialLinks?.instagram && (
                <a href={candidate.socialLinks.instagram} target="_blank" rel="noopener noreferrer" aria-label={`${candidate.firstName} ${candidate.lastName} Instagram`} className="text-brand-medium-blue hover:text-brand-red transition-colors">
                  <InstagramIcon className="w-6 h-6" />
                </a>
              )}
              {candidate.socialLinks?.youtube && (
                <a href={candidate.socialLinks.youtube} target="_blank" rel="noopener noreferrer" aria-label={`${candidate.firstName} ${candidate.lastName} YouTube`} className="text-brand-medium-blue hover:text-brand-red transition-colors">
                  <YouTubeIcon className="w-6 h-6" />
                </a>
              )}
              {candidate.socialLinks?.tiktok && (
                <a href={candidate.socialLinks.tiktok} target="_blank" rel="noopener noreferrer" aria-label={`${candidate.firstName} ${candidate.lastName} TikTok`} className="text-brand-medium-blue hover:text-brand-red transition-colors">
                  <TikTokIcon className="w-6 h-6" />
                </a>
              )}
            </div>
          </div>
        )}
         {candidate.mailingAddress && (
            <div className="mt-6">
                 <h3 className="text-lg font-semibold text-brand-dark-blue mb-1">Mailing Address</h3>
                 <p className="text-brand-medium-blue whitespace-pre-line">{candidate.mailingAddress}</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default CandidateProfilePage;
