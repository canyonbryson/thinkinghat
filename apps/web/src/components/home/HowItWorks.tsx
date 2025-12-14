"use client";

const steps = [
  {
    number: "01",
    title: "Create a Room",
    description: "Pick a game, choose your mode, and get a unique 4-letter room code.",
    icon: "🎯",
  },
  {
    number: "02",
    title: "Share the Code",
    description: "Friends join from any device—phone, tablet, or computer.",
    icon: "📲",
  },
  {
    number: "03",
    title: "Play Together",
    description: "Solve puzzles, compete for points, and crown a winner!",
    icon: "🏆",
  },
];

const features = [
  {
    icon: "🌐",
    title: "Online Mode",
    description: "Play with friends anywhere in the world",
  },
  {
    icon: "🏠",
    title: "Local Mode",
    description: "Same room, different devices—TV as host screen",
  },
  {
    icon: "🔄",
    title: "Auto-Reconnect",
    description: "Dropped connection? Jump right back in",
  },
  {
    icon: "📊",
    title: "Leaderboards",
    description: "Track your stats and climb the ranks",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 lg:py-32 bg-hat-dark/30">
      <div className="container mx-auto px-6">
        {/* Steps */}
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold">
            How It <span className="text-hat-gold">Works</span>
          </h2>
          <p className="text-xl text-hat-muted">
            Get playing in under 60 seconds
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-24">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-px bg-gradient-to-r from-hat-border to-transparent" />
              )}
              
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-hat-card border border-hat-border text-4xl">
                  {step.icon}
                </div>
                <div className="text-hat-gold font-mono text-sm">{step.number}</div>
                <h3 className="text-2xl font-bold">{step.title}</h3>
                <p className="text-hat-muted">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Features grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="game-card rounded-xl p-6 text-center space-y-3"
            >
              <div className="text-3xl">{feature.icon}</div>
              <h4 className="font-semibold text-lg">{feature.title}</h4>
              <p className="text-sm text-hat-muted">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

