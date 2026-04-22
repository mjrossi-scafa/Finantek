export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen w-full relative overflow-hidden"
      style={{
        backgroundColor: '#0A0613',
        backgroundImage:
          'radial-gradient(circle at 20% 20%, rgba(139,92,246,0.12) 0%, transparent 40%), radial-gradient(circle at 80% 80%, rgba(132,204,22,0.08) 0%, transparent 40%)',
      }}
    >
      {children}
    </div>
  )
}
