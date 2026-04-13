import { Link } from "wouter";
import { motion } from "framer-motion";
import { Shield, Zap, BarChart3, Activity, Lock, Globe, ArrowRight, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-3xl font-bold text-primary mb-1">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description }: { icon: any; title: string; description: string }) {
  return (
    <motion.div variants={fadeUp} className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-colors">
      <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center mb-4">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <h3 className="text-foreground font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
    </motion.div>
  );
}

function PartnerBadge({ name, role }: { name: string; role: string }) {
  return (
    <div className="flex flex-col items-center gap-1 px-6 py-4 bg-card border border-border rounded-lg">
      <span className="font-semibold text-foreground text-sm">{name}</span>
      <span className="text-xs text-muted-foreground">{role}</span>
    </div>
  );
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Nav */}
      <nav className="border-b border-border sticky top-0 z-50 bg-background/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-primary flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">NexusCore</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-24 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <motion.div
          className="max-w-4xl mx-auto text-center relative"
          initial="hidden"
          animate="show"
          variants={stagger}
        >
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-8">
            <Activity className="w-3 h-3" />
            Production-grade algorithmic trading
          </motion.div>
          <motion.h1 variants={fadeUp} className="text-5xl md:text-6xl font-bold tracking-tight text-foreground leading-tight mb-6">
            Every decision.<br />
            <span className="text-primary">Every millisecond.</span><br />
            Visible.
          </motion.h1>
          <motion.p variants={fadeUp} className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            NexusCore is a command center for algorithmic crypto trading. Real-time risk management, guardian-supervised execution, and explainable routing decisions — all in one platform.
          </motion.p>
          <motion.div variants={fadeUp} className="flex gap-4 justify-center flex-wrap">
            <Link href="/register">
              <Button size="lg" className="gap-2">
                Start Trading <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="gap-2">
                Sign In <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-border bg-card/30">
        <motion.div
          className="max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={stagger}
        >
          <motion.div variants={fadeUp}><Stat value="42ms" label="Avg routing latency" /></motion.div>
          <motion.div variants={fadeUp}><Stat value="98.2%" label="Fill rate on BTCC" /></motion.div>
          <motion.div variants={fadeUp}><Stat value="100%" label="Guardian coverage" /></motion.div>
          <motion.div variants={fadeUp}><Stat value="2" label="Priority exchanges" /></motion.div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-14"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <h2 className="text-3xl font-bold mb-4">Built for serious traders</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Every component of NexusCore is designed for deterministic behavior, risk supremacy, and complete auditability.</p>
          </motion.div>
          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={stagger}
          >
            <FeatureCard icon={Shield} title="Guardian-First Risk Control" description="The guardian layer monitors all activity in real time. Risk policy always takes precedence over strategy — no exceptions." />
            <FeatureCard icon={Zap} title="BTCC & Bitget Execution" description="Native adapters for BTCC and Bitget with smart order routing, reconciliation, and fill-rate monitoring at every step." />
            <FeatureCard icon={BarChart3} title="Live Dashboard" description="Total balance, daily PnL, exposure %, open positions, and routing decisions updated continuously — nothing hidden." />
            <FeatureCard icon={Lock} title="Kill-Switch Enforcement" description="One-click emergency halt across all exchanges. Guardian can trigger automatically when limits are breached." />
            <FeatureCard icon={Activity} title="Explainable Signals" description="Every signal and routing decision includes a plain-language explanation. No black boxes — full auditability." />
            <FeatureCard icon={Globe} title="Market & Education Data" description="Yahoo Finance market data integration and Investopedia education resources — clearly partitioned, zero ambiguity on sourcing." />
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6 bg-card/20 border-y border-border">
        <div className="max-w-5xl mx-auto">
          <motion.div className="text-center mb-14" initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}>
            <h2 className="text-3xl font-bold mb-4">How NexusCore works</h2>
            <p className="text-muted-foreground">Four distinct layers, each with a clear responsibility and clear authority.</p>
          </motion.div>
          <motion.div
            className="grid md:grid-cols-2 gap-6"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={stagger}
          >
            {[
              { step: "01", title: "Registration & Auth", desc: "Secure user registration, role-based access control, and session management. Your credentials never touch third-party auth providers." },
              { step: "02", title: "Architecture & Risk", desc: "The guardian layer defines risk policy and holds supreme authority over all execution decisions. Exposure limits, daily loss caps, and kill-switch logic are enforced unconditionally." },
              { step: "03", title: "Backend & Adapters", desc: "BTCC and Bitget adapters handle order routing, execution, reconciliation, and account data. Smart routing selects the optimal exchange per signal, per moment." },
              { step: "04", title: "Verification & Audit", desc: "Every trade, routing decision, and risk event is logged to an immutable audit trail. Reconciliation reports verify that local records match exchange records." },
            ].map(({ step, title, desc }) => (
              <motion.div key={step} variants={fadeUp} className="flex gap-4 p-6 bg-card border border-border rounded-lg">
                <div className="text-3xl font-bold text-primary/30 font-mono tabular-nums shrink-0">{step}</div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Partners */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div className="text-center mb-10" initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}>
            <h2 className="text-2xl font-bold mb-3">Integrated partners</h2>
            <p className="text-muted-foreground text-sm">Each partner has a clearly defined role. No overlap, no ambiguity.</p>
          </motion.div>
          <motion.div
            className="flex flex-wrap justify-center gap-4"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.div variants={fadeUp}><PartnerBadge name="BTCC" role="Exchange execution" /></motion.div>
            <motion.div variants={fadeUp}><PartnerBadge name="Bitget" role="Exchange execution" /></motion.div>
            <motion.div variants={fadeUp}><PartnerBadge name="Forex.com" role="Broker execution" /></motion.div>
            <motion.div variants={fadeUp}><PartnerBadge name="Yahoo Finance" role="Market data only" /></motion.div>
            <motion.div variants={fadeUp}><PartnerBadge name="Investopedia" role="Education only" /></motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-primary/5 border-t border-border">
        <motion.div
          className="max-w-3xl mx-auto text-center"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeUp}
        >
          <h2 className="text-3xl font-bold mb-4">Ready to trade with precision?</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">Configure your risk mode, connect your exchanges, and go live in minutes. The guardian never sleeps.</p>
          <div className="flex gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="gap-2">Create Account <ArrowRight className="w-4 h-4" /></Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline">Sign In</Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-primary/20 flex items-center justify-center">
              <Zap className="w-3 h-3 text-primary" />
            </div>
            <span className="font-medium text-foreground">NexusCore</span>
            <span>— Algorithmic Crypto Trading Platform</span>
          </div>
          <div className="flex gap-6">
            <Link href="/login" className="hover:text-foreground transition-colors">Sign In</Link>
            <Link href="/register" className="hover:text-foreground transition-colors">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
