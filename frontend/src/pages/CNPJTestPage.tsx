import React from 'react';
import CNPJTest from '../components/CNPJTest';

const CNPJTestPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <CNPJTest />
      </div>
    </div>
  );
};

export default CNPJTestPage;
