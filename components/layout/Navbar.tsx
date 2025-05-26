
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { DocumentTextIcon, ScaleIcon, InformationCircleIcon, HomeIcon, DocumentCheckIcon, UserCircleIcon } from '@heroicons/react/24/outline';

const StickyFooterNav: React.FC = () => {
  const location = useLocation();
  const isMyBallotActive = location.pathname === '/my-ballot';

  return (
    <nav className="fixed bottom-0 left-0 w-full z-40 bg-brand-dark-blue text-brand-off-white shadow-t-lg border-t border-brand-medium-blue h-16 print:hidden">
      <div className="container mx-auto flex justify-around items-center h-full">
        <NavLink to="/" icon={<HomeIcon className="h-5 w-5 mb-0.5" />}>Candidates</NavLink>
        <NavLink to="/ballot-measures" icon={<DocumentCheckIcon className="h-5 w-5 mb-0.5" />}>Measures</NavLink>
        
        {/* My Ballot Button - Consistently styled as active, slightly enlarged, and protruding */}
        <Link
          to="/my-ballot"
          className="relative bottom-1 flex flex-col items-center justify-center px-4 py-2 h-full text-xs font-medium focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-brand-dark-blue focus:ring-brand-red transition-colors duration-150 ease-in-out bg-brand-red text-white rounded-t-md" // Added relative, bottom-1 and rounded-t-md
          aria-current={isMyBallotActive ? 'page' : undefined} 
        >
          <DocumentTextIcon className="h-6 w-6 mb-0.5 text-white" /> {/* Icon h-5 w-5 to h-6 w-6 */}
          <span>My Ballot</span>
        </Link>
        
        <NavLink to="/compare" icon={<ScaleIcon className="h-5 w-5 mb-0.5" />}>Compare</NavLink>
        <NavLink to="/election-info" icon={<InformationCircleIcon className="h-5 w-5 mb-0.5" />}>Info</NavLink>
      </div>
    </nav>
  );
};

interface NavLinkProps {
  to: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

const NavLink: React.FC<NavLinkProps> = ({ to, children, icon }) => {
  const location = useLocation();
  const isActive = location.pathname === to || 
                   (to === "/ballot-measures" && location.pathname.startsWith("/ballot-measure/")) ||
                   (to === "/" && location.pathname.startsWith("/candidate")); 


  return (
    <Link 
      to={to} 
      className={`flex flex-col items-center justify-center flex-1 px-1 py-2 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-brand-red focus:ring-opacity-50 h-full
                  ${isActive ? 'text-white bg-black bg-opacity-20' : 'text-brand-light-blue-grey hover:bg-black hover:bg-opacity-10 hover:text-brand-off-white'}`}
      aria-current={isActive ? 'page' : undefined}
    >
      {icon}
      {children}
    </Link>
  );
}

export default StickyFooterNav;
