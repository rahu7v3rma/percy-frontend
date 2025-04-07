
import { useEffect } from 'react';
// import DashboardLayout from '@/components/DashboardLayout';
import { User } from 'lucide-react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/layout/DashboardLayout';

const DashboardNotifications = () => {
  useEffect(() => {
    document.title = 'Notifications | Percy';
  }, []);

  return (
    <DashboardLayout>
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-6"
      >
        <div>
          <div className="text-xs uppercase text-gray-500 mb-1">PERSONAL</div>
          <h1 className="text-3xl font-bold text-gradient">Notifications</h1>
        </div>
        
        <div className="space-y-4">
          {/* Notification Item */}
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="flex items-start gap-4 p-4 rounded-lg bg-black/30 backdrop-blur-sm border border-white/10"
          >
            <div className="mt-1 bg-opal-500/20 p-2 rounded-full">
              <User size={16} className="text-opal-300" />
            </div>
            <div>
              <p className="text-sm text-gray-200">
                Your video Hello just got its first viewer
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default DashboardNotifications;
