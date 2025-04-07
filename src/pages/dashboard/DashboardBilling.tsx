
import { useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';

const DashboardBilling = () => {
  useEffect(() => {
    document.title = 'Billing | Percy';
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
          <h1 className="text-3xl font-bold text-gradient">Billing</h1>
        </div>
        
        <div className="max-w-2xl">
          <Card className="backdrop-blur-sm bg-black/30 border border-white/10 overflow-hidden">
            <CardContent className="p-6 space-y-6">
              <div>
                <h2 className="text-xl font-semibold">Current Plan</h2>
                <p className="text-sm text-gray-400">Your Payment History</p>
              </div>
              
              <div>
                <div className="text-2xl font-bold text-gradient">$0/Month</div>
                <div className="text-sm text-gray-400">FREE</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default DashboardBilling;
