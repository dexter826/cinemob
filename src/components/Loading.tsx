import React from 'react';
import { Loader } from 'lucide-react';

const Loading: React.FC = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center text-primary">
      <Loader className="animate-spin" size={40} />
    </div>
  );
};

export default Loading;
