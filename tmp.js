}

function AnimatedLine({ progress }: { progress: MotionValue<string> }) {
  return (
    <div className="absolute top-8 left-0 right-0 h-0.5 bg-[var(--border-default)] hidden lg:block">
      <motion.div
        className="h-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-hover)]"
        style={{ width: progress }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function HeroSection({ user, loading }: { user: UserProfile | null; loading: boolean }) {
  return (
    <AuroraBackground className="min-h-screen">
      {/* Spotlight Effect */}
      <Spotlight className="hidden md:block" fill="var(--accent-subtle)" />
      
      {/* Navigation */}
      <motion.nav 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 left-0 right-0 z-50 py-4 transition-all duration-300"
      >
        <div className="container-main max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)]/70 px-4 shadow-sm backdrop-blur-xl backdrop-saturate-150 supports-[backdrop-filter]:bg-[var(--bg-surface)]/40">
            <div className="flex items-center gap-6">
              <Logo size="sm" />
            </div>

            <div className="flex items-center gap-2.5 sm:gap-4">
              <div className="hidden items-center gap-2 md:flex border-r border-[var(--border-default)] pr-4 mr-1">
                <AccentPicker />
                <ThemeToggle compact />
                <LanguageSwitcher compact />
              </div>
              <div className="flex items-center gap-2 md:hidden">
                 <AccentPicker />
              </div>
              
              {!loading && (
                user ? (
                  <MagneticButton href="/dashboard">
                    <ShimmerButton className="px-5 py-2 text-sm flex items-center justify-center">Dashboard</ShimmerButton>
                  </MagneticButton>
                ) : (
                  <>
                    <MagneticButton href="/login" className="hidden sm:inline-flex">
                      <motion.span
                        className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full px-4 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                        whileHover={{ scale: 1.02 }}
                      >
                        Log in
                      </motion.span>
                    </MagneticButton>
                    <MagneticButton href="/login">
                      <ShimmerButton className="px-5 py-2 text-sm flex items-center justify-center">Get Started</ShimmerButton>
                    </MagneticButton>
                  </>
                )
              )}
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Content */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 pt-16">
        <div className="mx-auto w-full max-w-6xl text-center">
          {/* Floating Badge */}
          <BlurFade delay={0.1}>
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-4 py-2">
              <Sparkles className="h-4 w-4 text-[var(--accent)]" />
              <AnimatedGradientText className="text-sm font-medium">
