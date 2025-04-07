import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';

const Index = () => {
  useEffect(() => {
    document.title = 'Percy | Home';
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-black">
      <Navbar />
      
      <main className="relative pt-24 sm:pt-32 pb-16 px-4 sm:px-6 max-w-7xl mx-auto">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Large gradient blob */}
          <div 
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(138, 43, 226, 0.08) 0%, rgba(0, 0, 0, 0) 70%)',
              filter: 'blur(100px)'
            }}
          />
        </div>
        
        <div className="relative z-10 h-full flex flex-col items-center text-center">
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-white mb-6 animate-slide-down">
            Welcome to <span className="text-gradient">Percy</span>
          </h1>
          
          <p className="text-xl text-gray-300 max-w-2xl mb-10 animate-slide-up">
            A beautiful, minimal application with elegant design and smooth animations
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 animate-fade-in">
            <Button 
              asChild 
              className="bg-opal-500 hover:bg-opal-600 text-white px-8 py-6 button-glow"
              size="lg"
            >
              <Link to="/login">Sign In</Link>
            </Button>
            
            <Button 
              variant="outline" 
              asChild
              className="border-white/20 text-white hover:bg-white/10 px-8 py-6"
              size="lg"
            >
              <Link to="/contact">Learn More</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
