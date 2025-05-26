import React from 'react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  return (
    <header className="bg-brand-off-white shadow-md fixed top-0 left-0 w-full z-50 print:hidden h-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center h-full">
        <Link to="/" className="flex items-center">
          <span className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            <span className="text-brand-dark-blue">BR</span>
            <span className="text-brand-red">VOTES</span>
          </span>
        </Link>
        {/* Additional header content can go here if needed, but logo is centered */}
      </div>
    </header>
  );
};

export default Header;