
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import CandidateProfilePage from './pages/CandidateProfilePage';
import CompareCandidatesPage from './pages/CompareCandidatesPage';
import MyBallotPage from './pages/MyBallotPage';
import ElectionInfoPage from './pages/ElectionInfoPage';
import BallotMeasuresListPage from './pages/BallotMeasuresListPage';
import BallotMeasureDetailPage from './pages/BallotMeasureDetailPage';
import Header from './components/layout/Header';
import Navbar from './components/layout/Navbar';
import { BallotProvider } from './hooks/useBallot';

const App: React.FC = () => {
  return (
    <BallotProvider>
      <div className="min-h-screen flex flex-col bg-brand-off-white">
        <Header />
        <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8 pt-20 pb-20"> {/* pt-20 (header h-16 + p-4), pb-20 (footer h-16 + p-4) */}
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/candidate/:candidateId" element={<CandidateProfilePage />} />
            <Route path="/compare" element={<CompareCandidatesPage />} />
            <Route path="/my-ballot" element={<MyBallotPage />} />
            <Route path="/election-info" element={<ElectionInfoPage />} />
            <Route path="/ballot-measures" element={<BallotMeasuresListPage />} />
            <Route path="/ballot-measure/:measureId" element={<BallotMeasureDetailPage />} />
          </Routes>
        </main>
        <Navbar />
      </div>
    </BallotProvider>
  );
};

export default App;
