import React from 'react';
import { Ticket } from 'lucide-react';

const Logo: React.FC = () => {
  return (
    <div className="flex items-center">
      <Ticket className="text-purple-600 h-8 w-8 mr-2" />
      <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-purple-400">
        TicketWise
      </span>
    </div>
  );
};

export default Logo;