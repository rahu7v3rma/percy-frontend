import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import RegisterForm from '../components/auth/RegisterForm';
import Navbar from '../components/layout/Navbar';

const Register = () => {
  useEffect(() => {
    document.title = 'Sign Up | Percy';
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-black overflow-hidden">
      <Navbar />
      
      <div className="relative min-h-screen flex flex-col items-center justify-center px-4 sm:px-6">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Large purple gradient blob */}
          <div 
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(138, 43, 226, 0.08) 0%, rgba(0, 0, 0, 0) 70%)',
              filter: 'blur(100px)'
            }}
          />
          
          {/* Smaller accent blobs */}
          <div 
            className="absolute top-1/4 right-1/4 w-[400px] h-[400px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(138, 43, 226, 0.06) 0%, rgba(0, 0, 0, 0) 70%)',
              filter: 'blur(60px)'
            }}
          />
          
          <div 
            className="absolute bottom-1/3 left-1/4 w-[200px] h-[200px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(138, 43, 226, 0.04) 0%, rgba(0, 0, 0, 0) 70%)',
              filter: 'blur(40px)'
            }}
          />
        </div>
        
        <div className="relative z-10 w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="glassmorphism p-8 sm:p-10 rounded-2xl"
          >
            <RegisterForm />
            
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-400">
                Already have an account?{' '}
                <Link to="/login" className="text-opal-400 hover:text-opal-300 transition-colors">
                  Login here
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Register;
