
import React, { useState, FormEvent, useRef, useEffect, useMemo } from 'react';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ChatMessage, GroundingMetadata, GroundingChunk, Cycle } from '../types';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { PaperAirplaneIcon, QuestionMarkCircleIcon, CalendarDaysIcon, MapPinIcon, LifebuoyIcon } from '@heroicons/react/24/outline';
import { getAllCycles, getFormattedElectionName } from '../services/dataService'; // Using getAllCycles

const ElectionInfoPage: React.FC = () => {
  const [question, setQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [groundingChunks, setGroundingChunks] = useState<GroundingChunk[]>([]);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const allElectionEvents = useMemo(() => getAllCycles(), []); // getAllCycles returns sorted: upcoming first

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    const userMessage: ChatMessage = { role: 'user', text: question };
    setChatHistory(prev => [...prev, userMessage]);
    setQuestion('');
    setIsLoading(true);
    setError(null);
    setGroundingChunks([]);

    try {
      const apiKey = process.env.API_KEY;
      if (!apiKey) {
        throw new Error("API key is not configured.");
      }
      const ai = new GoogleGenAI({ apiKey });
      
      const useSearch = question.toLowerCase().includes("recent") || 
                        question.toLowerCase().includes("latest") ||
                        question.toLowerCase().includes("current events") ||
                        question.toLowerCase().includes("news") ||
                        question.toLowerCase().includes("who won") ||
                        question.toLowerCase().includes("olympics 2024");

      const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-04-17',
        contents: `You are an AI assistant for voters in East Baton Rouge Parish. Provide helpful, concise, and neutral information. ${question}`,
        config: useSearch ? { tools: [{googleSearch: {}}] } : {},
      });

      const modelResponseText = response.text;
      const modelMessage: ChatMessage = { role: 'model', text: modelResponseText };
      setChatHistory(prev => [...prev, modelMessage]);

      const metadata = response.candidates?.[0]?.groundingMetadata as GroundingMetadata | undefined;
      if (metadata?.groundingChunks) {
        setGroundingChunks(metadata.groundingChunks);
      }

    } catch (err: any) {
      console.error("Gemini API error:", err);
      setError(err.message || "Failed to get response from AI. Please try again.");
      const errorMessage: ChatMessage = { role: 'model', text: "Sorry, I couldn't process your request at the moment." };
      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Display info for the most immediate upcoming election, or most recent past if none upcoming
  const relevantElection: Cycle | null = allElectionEvents.length > 0 ? allElectionEvents[0] : null;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow-xl rounded-lg p-6 md:p-10 border border-brand-light-blue-grey">
        <h1 className="text-3xl font-bold text-brand-dark-blue mb-8 text-center">Election Information & Q&A</h1>

        <div className="mb-10 grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoCard title="Key Election Dates" icon={<CalendarDaysIcon className="h-8 w-8 text-brand-red" />}>
                {relevantElection ? (
                    <>
                        <p><strong>{getFormattedElectionName(relevantElection)}</strong></p>
                        <p>Election Day: {new Date(relevantElection.electionDate  + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        <p>Early Voting: {new Date(relevantElection.evStart  + 'T00:00:00').toLocaleDateString()} - {new Date(relevantElection.evEnd  + 'T00:00:00').toLocaleDateString()}</p>
                    </>
                ) : <p>Election dates will be updated soon.</p>}
                <p className="mt-2 text-sm"><em>(Dates are for example purposes. Always check official sources.)</em></p>
            </InfoCard>
            <InfoCard title="Polling Place Info" icon={<MapPinIcon className="h-8 w-8 text-brand-red" />}>
                <p>Find your official polling place by visiting the <a href="https://www.sos.la.gov/ElectionsAndVoting/Pages/OnlineVoterRegistration.aspx" target="_blank" rel="noopener noreferrer" className="text-brand-red hover:underline">Louisiana Secretary of State website</a> or <a href="https://voterportal.sos.la.gov/" target="_blank" rel="noopener noreferrer" className="text-brand-red hover:underline">GeauxVote.com</a>.</p>
                <p className="mt-2 text-sm">You can also ask the AI assistant below for general guidance.</p>
            </InfoCard>
            <InfoCard title="Voter Resources" icon={<LifebuoyIcon className="h-8 w-8 text-brand-red" />}>
                 <ul className="list-disc list-inside space-y-1">
                    <li><a href="https://www.sos.la.gov/" target="_blank" rel="noopener noreferrer" className="text-brand-red hover:underline">Louisiana Secretary of State</a></li>
                    <li><a href="https://www.ebrclerkofcourt.org/elections/" target="_blank" rel="noopener noreferrer" className="text-brand-red hover:underline">EBR Clerk of Court (Elections)</a></li>
                    <li><a href="https://www.vote.org/" target="_blank" rel="noopener noreferrer" className="text-brand-red hover:underline">Vote.org (Non-partisan)</a></li>
                 </ul>
            </InfoCard>
             <InfoCard title="Voting Reminders" icon={<CalendarDaysIcon className="h-8 w-8 text-brand-red" />}>
                <p>Stay tuned for features to help you set reminders for important election dates!</p>
                <p className="mt-2 text-sm">(For now, manually add dates to your personal calendar.)</p>
            </InfoCard>
        </div>

        <div className="mt-10 border-t border-brand-light-blue-grey pt-8">
          <h2 className="text-2xl font-semibold text-brand-dark-blue mb-2 flex items-center">
            <QuestionMarkCircleIcon className="h-8 w-8 mr-3 text-brand-red"/>
            Ask BRVotes AI
          </h2>
          <p className="text-brand-medium-blue mb-4">Have questions about voting, candidates, or election processes in East Baton Rouge Parish? Ask our AI assistant.</p>
          
          <div 
            ref={chatContainerRef}
            className="h-96 border border-brand-light-blue-grey rounded-lg p-4 mb-4 overflow-y-auto bg-brand-off-white space-y-3"
            aria-live="polite"
          >
            {chatHistory.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xl px-4 py-2 rounded-xl shadow ${
                  msg.role === 'user' 
                  ? 'bg-brand-dark-blue text-white' 
                  : 'bg-white text-brand-dark-blue border border-brand-light-blue-grey'
                }`}>
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            ))}
            {isLoading && <div className="flex justify-center"><LoadingSpinner size="sm" /></div>}
             {error && <div className="text-brand-red p-2 bg-red-100 rounded-md text-sm">{error}</div>}
          </div>

          {groundingChunks.length > 0 && (
            <div className="mb-4 p-3 bg-brand-off-white border border-brand-light-blue-grey rounded-md">
              <h4 className="font-semibold text-sm text-brand-dark-blue mb-1">Information possibly sourced from:</h4>
              <ul className="list-disc list-inside text-xs text-brand-medium-blue space-y-0.5">
                {groundingChunks.map((chunk, idx) => 
                  chunk.web && <li key={idx}><a href={chunk.web.uri} target="_blank" rel="noopener noreferrer" className="text-brand-red hover:underline">{chunk.web.title || chunk.web.uri}</a></li>
                )}
              </ul>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex items-center space-x-3">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g., How do I register to vote?"
              className="flex-grow p-3 border border-brand-light-blue-grey rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent outline-none transition text-brand-dark-blue"
              aria-label="Ask a question about elections"
              disabled={isLoading}
            />
            <button 
              type="submit" 
              className="bg-brand-red hover:bg-opacity-80 hover:bg-brand-red text-white font-semibold p-3 rounded-lg disabled:bg-brand-light-blue-grey transition-colors flex items-center justify-center"
              disabled={isLoading || !question.trim()}
              aria-label="Send question"
            >
              <PaperAirplaneIcon className="h-5 w-5" />
            </button>
          </form>
          <p className="text-xs text-brand-medium-blue mt-2">AI responses are for informational purposes and may not always be accurate or complete. Always verify critical information with official sources.</p>
        </div>
      </div>
    </div>
  );
};

interface InfoCardProps {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
}
const InfoCard: React.FC<InfoCardProps> = ({ title, icon, children }) => {
    return (
        <div className="bg-brand-off-white p-6 rounded-lg shadow-md border border-brand-light-blue-grey">
            <div className="flex items-center mb-3">
                {icon}
                <h3 className="text-xl font-semibold text-brand-dark-blue ml-3">{title}</h3>
            </div>
            <div className="text-brand-medium-blue text-sm space-y-1">
                {children}
            </div>
        </div>
    );
}

export default ElectionInfoPage;
