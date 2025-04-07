
import Navbar from '@/components/layout/Navbar';
import { useEffect } from 'react';
// import Navbar from '@/components/Navbar';

const Pricing = () => {
  useEffect(() => {
    document.title = 'Pricing | Percy';
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-black">
      <Navbar />
      <div className="pt-24 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-gradient">Pricing Plans</h1>
          <p className="text-xl text-gray-400">Choose the plan that's right for you</p>
        </div>
        
        <div className="flex justify-center">
          <p className="text-gray-400">Pricing page content would go here</p>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
