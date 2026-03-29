import React from 'react';
import { Share } from 'lucide-react';

const ShareTab: React.FC = () => {
  return (
    <div className="p-10 text-center flex flex-col items-center justify-center h-full box-border">
      <Share size={48} className="text-gray-500 mb-4" />
      <h3 className="m-0 mb-2 text-lg text-gray-900 font-semibold">Share Feature</h3>
      <p className="m-0 text-gray-500 text-sm leading-relaxed">Coming soon! Share your links with others.</p>
    </div>
  );
};

export default ShareTab;