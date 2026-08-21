import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText,
  Search,
  Cpu,
  Shield,
  Folder,
  MessageSquare,
  Upload,
  Zap,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { cn } from '@/lib/utils';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { y: 24, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { duration: 0.5 } },
};

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function Landing() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen w-full bg-[var(--bg)]">
      {/* Navbar */}
      <nav
        className={cn(
          'fixed left-0 right-0 top-0 z-50 transition-all duration-300',
          scrolled ? 'border-b border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur-xl' : 'bg-transparent'
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
          <Logo size="md" />
          <div className="hidden items-center gap-8 md:flex">
            <NavLink href="#features">Features</NavLink>
            <NavLink href="#how">How It Works</NavLink>
            <NavLink href="#use-cases">Use Cases</NavLink>
          </div>
          <div className="hidden items-center gap-3 md:flex">
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>Sign In</Button>
            <Button size="sm" onClick={() => navigate('/signup')}>Get Started</Button>
          </div>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="rounded-lg p-2 text-[var(--text)] md:hidden">
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-[var(--surface)] p-6 pt-20 md:hidden">
          <div className="flex flex-col gap-4 text-lg font-medium text-[var(--text)]">
            <MobileLink href="#features" onClick={() => setMobileOpen(false)}>Features</MobileLink>
            <MobileLink href="#how" onClick={() => setMobileOpen(false)}>How It Works</MobileLink>
            <MobileLink href="#use-cases" onClick={() => setMobileOpen(false)}>Use Cases</MobileLink>
            <hr className="my-2 border-[var(--border)]" />
            <button onClick={() => { setMobileOpen(false); navigate('/login'); }} className="text-left">Sign In</button>
            <button onClick={() => { setMobileOpen(false); navigate('/signup'); }} className="text-left text-forge-500">Get Started</button>
          </div>
        </div>
      )}

      {/* Hero */}
      <section className="relative overflow-hidden px-4 pb-24 pt-36 lg:pt-44">
        <div className="aurora-glow absolute inset-0 opacity-50" />
        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <motion.div initial="hidden" animate="show" variants={container} className="max-w-2xl">
              <motion.div variants={item} className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-1.5 text-sm font-medium text-forge-600 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-mint-500" />
                AI-powered knowledge platform
              </motion.div>
              <motion.h1 variants={item} className="text-4xl font-extrabold leading-tight tracking-tight text-[var(--text)] md:text-5xl lg:text-6xl">
                Turn your documents into an{' '}
                <span className="gradient-text">intelligent knowledge base</span>.
              </motion.h1>
              <motion.p variants={item} className="mt-6 text-lg text-[var(--text-2)] md:text-xl">
                KnowledgeForge brings your documents, search, and AI together so your team can find answers faster and make decisions with confidence.
              </motion.p>
              <motion.div variants={item} className="mt-8 flex flex-wrap items-center gap-4">
                <Button size="lg" onClick={() => navigate('/signup')}>Start Building</Button>
                <Button size="lg" variant="outline" onClick={() => navigate('/login')}>Explore Knowledge</Button>
              </motion.div>
              <motion.p variants={item} className="mt-4 text-sm text-[var(--text-2)]">No credit card required.</motion.p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative hidden lg:block"
            >
              <HeroVisual />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="border-y border-[var(--border)] bg-[var(--surface)] px-4 py-12">
        <div className="mx-auto max-w-7xl text-center">
          <p className="text-sm font-medium text-[var(--text-2)]">Built for teams that work with knowledge</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {['Engineering', 'Research', 'Operations', 'Product', 'Customer Support', 'Legal', 'Finance', 'Education'].map((t) => (
              <span key={t} className="rounded-full border border-[var(--border)] bg-[var(--bg)] px-4 py-1.5 text-sm font-medium text-[var(--text)]">
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="relative px-4 py-24" id="problem">
        <div className="mx-auto max-w-7xl text-center">
          <motion.h2 initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeIn} className="text-3xl font-bold text-[var(--text)] md:text-4xl">
            Your knowledge is everywhere.
          </motion.h2>
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={container}
            className="mt-10 flex flex-wrap justify-center gap-4"
          >
            {['PDFs', 'Documents', 'Spreadsheets', 'Research', 'Internal guides', 'Product documentation'].map((t) => (
              <motion.div
                key={t}
                variants={item}
                className="flex h-24 w-36 flex-col items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm"
              >
                <FileText className="mb-2 h-6 w-6 text-[var(--text-2)]" />
                <span className="text-sm font-medium text-[var(--text)]">{t}</span>
              </motion.div>
            ))}
          </motion.div>
          <motion.div initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} className="mx-auto my-12 h-1 w-24 gradient-bg rounded-full" />
          <motion.p initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeIn} className="text-2xl font-semibold text-[var(--text)]">
            KnowledgeForge brings it together.
          </motion.p>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-24" id="features">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold text-[var(--text)] md:text-4xl">Everything you need to work with knowledge</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <FeatureCard key={i} {...f} />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-[var(--surface)] px-4 py-24" id="how">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold text-[var(--text)] md:text-4xl">How KnowledgeForge works</h2>
          </div>
          <div className="grid gap-8 md:grid-cols-4">
            {steps.map((s, i) => (
              <StepCard key={i} index={i + 1} {...s} />
            ))}
          </div>
        </div>
      </section>

      {/* AI Visual */}
      <section className="px-4 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-[var(--text)] md:text-4xl">Ask your knowledge anything</h2>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl"
          >
            <div className="border-b border-[var(--border)] p-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full gradient-bg" />
                <div>
                  <p className="text-sm font-medium text-[var(--text)]">Enterprise deployment requirements?</p>
                  <p className="text-xs text-[var(--text-2)]">Workspace: Engineering</p>
                </div>
              </div>
            </div>
            <div className="space-y-4 p-6">
              <div className="ml-auto max-w-2xl rounded-2xl rounded-tr-sm bg-[var(--surface-2)] p-4 text-sm text-[var(--text)]">
                What are the main requirements in our enterprise deployment guide?
              </div>
              <div className="mr-auto max-w-2xl rounded-2xl rounded-tl-sm border border-[var(--border)] bg-[var(--bg)] p-4 text-sm text-[var(--text)]">
                <p className="mb-3">Based on your deployment documentation, the main requirements are:</p>
                <ul className="ml-4 list-disc space-y-1 text-[var(--text-2)]">
                  <li>Minimum 8 vCPU and 32 GB RAM</li>
                  <li>Ubuntu 22.04 LTS or RHEL 9</li>
                  <li>PostgreSQL 15+ and Redis 7+</li>
                  <li>TLS 1.3 enabled for all external traffic</li>
                </ul>
                <div className="mt-4 flex flex-wrap gap-2">
                  <SourcePill name="deployment-guide.pdf" />
                  <SourcePill name="enterprise-architecture.docx" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="bg-[var(--surface)] px-4 py-24" id="use-cases">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold text-[var(--text)] md:text-4xl">Use cases</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {useCases.map((u, i) => (
              <UseCaseCard key={i} {...u} />
            ))}
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="px-4 py-24" id="security">
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="text-3xl font-bold text-[var(--text)] md:text-4xl">Your knowledge stays organized and controlled</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {['Workspace isolation', 'Authenticated access', 'Secure API architecture', 'Scoped knowledge retrieval', 'Protected user sessions', 'Document-level boundaries'].map((s, i) => (
              <div key={i} className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 text-left">
                <Shield className="h-5 w-5 text-mint-500" />
                <span className="text-sm font-medium text-[var(--text)]">{s}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden px-4 py-24">
        <div className="aurora-glow absolute inset-0 opacity-60" />
        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-[var(--text)] md:text-5xl">Build your intelligent knowledge base.</h2>
          <p className="mt-4 text-lg text-[var(--text-2)]">Start for free. No credit card required.</p>
          <div className="mt-8 flex justify-center">
            <Button size="lg" onClick={() => navigate('/signup')}>Get Started</Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] bg-[var(--surface)] px-4 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
            <div>
              <Logo size="sm" className="mb-4" />
              <p className="text-sm text-[var(--text-2)]">Your knowledge. Searchable. Understandable. Intelligent.</p>
            </div>
            <FooterColumn title="Product" links={['Features', 'Pricing', 'Security']} />
            <FooterColumn title="Resources" links={['Documentation', 'Help Center', 'API']} />
            <FooterColumn title="Company" links={['About', 'Contact', 'Privacy', 'Terms']} />
          </div>
          <div className="mt-12 text-center text-sm text-[var(--text-2)]">© {new Date().getFullYear()} KnowledgeForge. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}

const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a href={href} className="text-sm font-medium text-[var(--text-2)] transition-colors hover:text-[var(--text)]">
    {children}
  </a>
);

const MobileLink = ({ href, onClick, children }: { href: string; onClick: () => void; children: React.ReactNode }) => (
  <a href={href} onClick={onClick} className="text-[var(--text)]">
    {children}
  </a>
);

const HeroVisual = () => (
  <div className="relative h-[420px] w-full rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-2xl">
    <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-forge-500/10 blur-3xl" />
    <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-[#22D3EE]/10 blur-3xl" />
    <div className="relative z-10 grid h-full grid-cols-2 gap-4">
      <div className="flex flex-col gap-3">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3 shadow-sm">
          <FileText className="mb-2 h-5 w-5 text-forge-500" />
          <p className="text-xs font-medium text-[var(--text)]">deployment-guide.pdf</p>
          <p className="text-[10px] text-[var(--text-2)]">24 chunks indexed</p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3 shadow-sm">
          <Search className="mb-2 h-5 w-5 text-electric-500" />
          <p className="text-xs font-medium text-[var(--text)]">Hybrid search</p>
          <p className="text-[10px] text-[var(--text-2)]">Semantic + keyword</p>
        </div>
      </div>
      <div className="flex flex-col justify-between">
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-lg"
        >
          <div className="mb-2 flex gap-1.5">
            <div className="h-2 w-2 rounded-full bg-rose-500" />
            <div className="h-2 w-2 rounded-full bg-amber-500" />
            <div className="h-2 w-2 rounded-full bg-mint-500" />
          </div>
          <p className="text-xs text-[var(--text)]">How do we deploy the enterprise version?</p>
          <div className="mt-2 h-2 w-3/4 rounded bg-[var(--surface-2)]" />
          <div className="mt-2 h-2 w-1/2 rounded bg-[var(--surface-2)]" />
        </motion.div>
        <div className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs text-[var(--text)]">
          <Cpu className="h-3.5 w-3.5 text-forge-500" />
          AI generating answer...
        </div>
      </div>
    </div>
  </div>
);

const features = [
  { icon: FileText, title: 'Intelligent Document Processing', desc: 'Turn raw documents into searchable knowledge.' },
  { icon: Search, title: 'Hybrid Search', desc: 'Combine semantic understanding with precise keyword retrieval.' },
  { icon: Cpu, title: 'Grounded AI', desc: 'Ask questions and receive answers based on your own knowledge.' },
  { icon: Shield, title: 'Source-Aware Answers', desc: 'See exactly where an answer came from.' },
  { icon: Folder, title: 'Knowledge Workspaces', desc: 'Keep different knowledge domains organized and isolated.' },
  { icon: MessageSquare, title: 'Conversational Intelligence', desc: 'Continue exploring your knowledge through persistent conversations.' },
];

const FeatureCard = ({ icon: Icon, title, desc }: { icon: React.ElementType; title: string; desc: string }) => (
  <motion.div
    whileHover={{ y: -4 }}
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="group rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm transition-shadow hover:shadow-lg"
  >
    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-forge-50 dark:bg-forge-900/20">
      <Icon className="h-5 w-5 text-forge-500" />
    </div>
    <h3 className="text-lg font-semibold text-[var(--text)]">{title}</h3>
    <p className="mt-2 text-sm text-[var(--text-2)]">{desc}</p>
  </motion.div>
);

const steps = [
  { icon: Upload, title: 'Upload', desc: 'Bring your documents into KnowledgeForge.' },
  { icon: Zap, title: 'Process', desc: 'Documents are extracted, chunked and indexed.' },
  { icon: Search, title: 'Search', desc: 'Find relevant knowledge using hybrid retrieval.' },
  { icon: MessageSquare, title: 'Ask', desc: 'Get AI answers grounded in your knowledge.' },
];

const StepCard = ({ index, icon: Icon, title, desc }: { index: number; icon: React.ElementType; title: string; desc: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="relative rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-6"
  >
    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl gradient-bg text-sm font-bold text-white">
      {String(index).padStart(2, '0')}
    </div>
    <Icon className="mb-3 h-6 w-6 text-forge-500" />
    <h3 className="text-lg font-semibold text-[var(--text)]">{title}</h3>
    <p className="mt-2 text-sm text-[var(--text-2)]">{desc}</p>
  </motion.div>
);

const SourcePill = ({ name }: { name: string }) => (
  <div className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-xs text-[var(--text)]">
    <FileText className="h-3 w-3 text-forge-500" />
    {name}
  </div>
);

const useCases = [
  { title: 'Engineering Teams', desc: 'Search technical documentation instantly.' },
  { title: 'Research Teams', desc: 'Turn research documents into an intelligent knowledge base.' },
  { title: 'Operations', desc: 'Centralize internal processes and operational knowledge.' },
  { title: 'Customer Support', desc: 'Find accurate answers from support documentation.' },
  { title: 'Product Teams', desc: 'Make product documentation conversational.' },
  { title: 'Education', desc: 'Turn learning materials into interactive knowledge.' },
];

const UseCaseCard = ({ title, desc }: { title: string; desc: string }) => (
  <motion.div
    whileHover={{ y: -4 }}
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 transition-shadow hover:shadow-lg"
  >
    <h3 className="text-lg font-semibold text-[var(--text)]">{title}</h3>
    <p className="mt-2 text-sm text-[var(--text-2)]">{desc}</p>
    <div className="mt-4 flex items-center text-sm font-medium text-forge-600">
      Learn more <ChevronRight className="ml-1 h-4 w-4" />
    </div>
  </motion.div>
);

const FooterColumn = ({ title, links }: { title: string; links: string[] }) => (
  <div>
    <h4 className="mb-4 text-sm font-semibold text-[var(--text)]">{title}</h4>
    <ul className="space-y-2">
      {links.map((l) => (
        <li key={l}><a href="#" className="text-sm text-[var(--text-2)] hover:text-[var(--text)]">{l}</a></li>
      ))}
    </ul>
  </div>
);
