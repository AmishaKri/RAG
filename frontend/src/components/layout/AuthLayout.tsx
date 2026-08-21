import { motion } from 'framer-motion';
import { Outlet } from 'react-router-dom';
import { Logo } from '@/components/ui/Logo';
import { Cpu, FileText, MessageSquare, Search } from 'lucide-react';

export const AuthLayout = () => {
  return (
    <div className="min-h-screen w-full bg-[var(--bg)]">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="relative hidden flex-col justify-between overflow-hidden bg-[#080B16] p-10 text-white lg:flex"
        >
          <div className="aurora-glow absolute inset-0 opacity-60" />
          <div className="relative z-10">
            <Logo size="lg" showText />
          </div>
          <div className="relative z-10">
            <h1 className="text-4xl font-bold leading-tight">
              Turn your documents into an{' '}
              <span className="gradient-text">intelligent knowledge base</span>.
            </h1>
            <p className="mt-4 max-w-md text-lg text-slate-300">
              KnowledgeForge brings your documents, search, and AI together so your team can find answers faster.
            </p>
            <div className="mt-10 grid grid-cols-2 gap-4">
              <Feature icon={FileText} text="Document processing" />
              <Feature icon={Search} text="Hybrid search" />
              <Feature icon={MessageSquare} text="AI conversations" />
              <Feature icon={Cpu} text="Source-aware answers" />
            </div>
          </div>
          <div className="relative z-10 text-sm text-slate-400">© KnowledgeForge</div>
        </motion.div>

        <div className="flex items-center justify-center p-6 lg:p-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            <div className="mb-8 flex justify-center lg:hidden">
              <Logo size="md" />
            </div>
            <Outlet />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

const Feature = ({ icon: Icon, text }: { icon: React.ElementType; text: string }) => (
  <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
    <Icon className="h-5 w-5 text-[#22D3EE]" />
    <span className="text-sm font-medium">{text}</span>
  </div>
);
