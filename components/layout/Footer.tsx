
import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-gray-800 text-white py-8 mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p>&copy; {currentYear} East Baton Rouge Parish Voter Education. All rights reserved.</p>
        <p className="text-sm text-gray-400 mt-1">
          This is a fictional application for demonstration purposes.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
