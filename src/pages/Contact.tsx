import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';

const Contact = () => {
  useEffect(() => {
    document.title = 'Contact | Percy';
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-black">
      <Navbar />
      <div className="pt-24 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-gradient">Contact Us</h1>
          <p className="text-xl text-gray-400">We'd love to hear from you</p>
        </div>
        
        <div className="flex flex-col items-center justify-center gap-6">
          <p className="text-gray-400 text-center max-w-xl">
            Our contact form is coming soon. In the meantime, check out our dashboard demo below.
          </p>
          
          <Button asChild className="bg-opal-500 hover:bg-opal-600 text-white">
            <Link to="/dashboard">View Dashboard Demo</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Contact;
