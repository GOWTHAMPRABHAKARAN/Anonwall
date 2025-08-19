import { Card, CardContent } from "@/components/ui/card"
import { MessageSquare, Shield, Users, Zap, Lock, QrCode, Trash2, FileText } from "lucide-react"
import AnimateOnScroll from "@/components/animate-on-scroll"

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="space-y-16">
        {/* Hero Section */}
        <AnimateOnScroll className="text-center space-y-6">
          <h1 className="text-5xl font-bold text-white tracking-tight">About AnonWall</h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Create anonymous discussion spaces where authentic conversations happen. Share thoughts freely, gather
            honest feedback, and build communities without barriers.
          </p>
        </AnimateOnScroll>

        {/* What is AnonWall */}
        <section className="space-y-6">
          <AnimateOnScroll>
            <h2 className="text-3xl font-semibold text-white text-center">What is AnonWall?</h2>
          </AnimateOnScroll>
          <AnimateOnScroll delayMs={80}>
            <Card className="bg-gray-900/50 border-gray-800">
              <CardContent className="p-8">
                <p className="text-gray-300 text-lg leading-relaxed text-center">
                  AnonWall is a platform that enables anonymous discussions through customizable "walls" - digital spaces
                  where people can share thoughts, feedback, and ideas without revealing their identity. Perfect for
                  honest conversations, feedback collection, and community building.
                </p>
              </CardContent>
            </Card>
          </AnimateOnScroll>
        </section>

        {/* Key Features */}
        <section className="space-y-8">
          <AnimateOnScroll>
            <h2 className="text-3xl font-semibold text-white text-center">Key Features</h2>
          </AnimateOnScroll>
          <div className="grid gap-6 md:grid-cols-2">
            {[
              { Icon: MessageSquare, title: "Anonymous Posting", desc: "Share thoughts without revealing identity. No profiles, no judgment." },
              { Icon: Lock, title: "Public & Private Walls", desc: "Create open discussions or PIN-protected private spaces." },
              { Icon: QrCode, title: "QR Code Sharing", desc: "Easy access through QR codes - bridge physical and digital spaces." },
              { Icon: Trash2, title: "Moderation Control", desc: "Wall creators can moderate content and maintain healthy discussions." },
            ].map(({ Icon, title, desc }, i) => (
              <AnimateOnScroll key={title} delayMs={i * 80} className="flex items-start space-x-4">
                <div className="bg-purple-600/90 p-3 rounded-lg shadow-md shadow-purple-900/20">
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
                  <p className="text-gray-400">{desc}</p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </section>

        {/* How it Works */}
        <section className="space-y-8">
          <AnimateOnScroll>
            <h2 className="text-3xl font-semibold text-white text-center">How It Works</h2>
          </AnimateOnScroll>
          <div className="space-y-6">
            {[
              { step: 1, title: "Create a Wall", desc: "Set up your discussion space in seconds - choose public or private." },
              { step: 2, title: "Share & Invite", desc: "Share the link or QR code with your audience or community." },
              { step: 3, title: "Collect & Engage", desc: "Receive anonymous posts and foster authentic conversations." },
            ].map((s, i) => (
              <AnimateOnScroll key={s.step} delayMs={i * 90} className="flex items-center space-x-6">
                <div className="bg-purple-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold">
                  {s.step}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">{s.title}</h3>
                  <p className="text-gray-400">{s.desc}</p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </section>

        {/* Use Cases */}
        <section className="space-y-8">
          <AnimateOnScroll>
            <h2 className="text-3xl font-semibold text-white text-center">Perfect For</h2>
          </AnimateOnScroll>
          <div className="grid gap-6 md:grid-cols-3">
            {[{ Icon: Users, t: "Team Feedback", d: "Honest retrospectives and anonymous team feedback sessions." },
              { Icon: Shield, t: "Safe Discussions", d: "Mental health support groups and sensitive topic discussions." },
              { Icon: Zap, t: "Event Engagement", d: "Conference Q&A, workshop feedback, and event interactions." },
            ].map(({ Icon, t, d }, i) => (
              <AnimateOnScroll key={t} delayMs={i * 100}>
                <Card className="bg-gray-900/50 border-gray-800 text-center p-6">
                  <Icon className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">{t}</h3>
                  <p className="text-gray-400 text-sm">{d}</p>
                </Card>
              </AnimateOnScroll>
            ))}
          </div>
        </section>

        {/* Privacy & Security */}
        <section className="space-y-6">
          <AnimateOnScroll>
            <h2 className="text-3xl font-semibold text-white text-center">Privacy & Security</h2>
          </AnimateOnScroll>
          <AnimateOnScroll delayMs={80}>
            <Card className="bg-gray-900/50 border-gray-800">
              <CardContent className="p-8 space-y-4">
                <div className="flex items-center space-x-3">
                  <Shield className="h-6 w-6 text-purple-400" />
                  <span className="text-white font-semibold">Anonymous by Design</span>
                </div>
                <p className="text-gray-300">
                  No personal information is collected from posts. Your identity remains completely private.
                </p>
                <div className="flex items-center space-x-3">
                  <Lock className="h-6 w-6 text-purple-400" />
                  <span className="text-white font-semibold">Secure Infrastructure</span>
                </div>
                <p className="text-gray-300">Built with enterprise-grade security using Supabase with Row Level Security policies.</p>
              </CardContent>
            </Card>
          </AnimateOnScroll>
        </section>

        {/* Community Guidelines CTA */}
        <section className="space-y-6">
          <AnimateOnScroll>
            <h2 className="text-3xl font-semibold text-white text-center">Community Guidelines</h2>
          </AnimateOnScroll>
          <AnimateOnScroll delayMs={80}>
            <Card className="bg-gray-900/50 border-gray-800">
              <CardContent className="p-8">
                <div className="flex items-center justify-center space-x-4 mb-6">
                  <FileText className="h-8 w-8 text-purple-400" />
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-white mb-2">Respectful Discussions</h3>
                    <p className="text-gray-300">Learn about our community standards and guidelines for maintaining healthy, respectful anonymous discussions.</p>
                  </div>
                </div>
                <div className="text-center">
                  <a href="/guidelines" className="inline-flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                    <FileText className="h-5 w-5" />
                    <span>View Community Guidelines</span>
                  </a>
                </div>
              </CardContent>
            </Card>
          </AnimateOnScroll>
        </section>

        {/* CTA */}
        <AnimateOnScroll className="text-center space-y-6 py-8">
          <h2 className="text-3xl font-semibold text-white">Ready to Start?</h2>
          <p className="text-gray-400 text-lg">Create your first wall and experience anonymous discussions.</p>
          <div className="flex justify-center space-x-4">
            <a href="/create-wall" className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors">Create Wall</a>
            <a href="/public-walls" className="border border-gray-600 hover:border-gray-500 text-white px-8 py-3 rounded-lg font-semibold transition-colors">Browse Walls</a>
          </div>
        </AnimateOnScroll>

        {/* Footer Section */}
        <footer className="border-t border-gray-800 pt-12 pb-8">
          <AnimateOnScroll className="text-center space-y-6">
            <div className="flex items-center justify-center space-x-2">
              <span className="text-gray-400">Made with</span>
              <span className="text-red-500 text-xl animate-pulse">❤️</span>
              <span className="text-gray-400">by the AnonWall team</span>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <a href="/guidelines" className="text-gray-400 hover:text-purple-400 transition-colors">Community Guidelines</a>
              <a href="/public-walls" className="text-gray-400 hover:text-purple-400 transition-colors">Public Walls</a>
              <a href="/create-wall" className="text-gray-400 hover:text-purple-400 transition-colors">Create Wall</a>
              <a href="/my-walls" className="text-gray-400 hover:text-purple-400 transition-colors">My Walls</a>
            </div>
            <div className="text-gray-500 text-sm">© 2025 All rights reserved to AnonWall</div>
            <div className="text-xs text-gray-600 max-w-2xl mx-auto">
              <p>AnonWall is committed to providing a safe, anonymous platform for meaningful discussions. Your privacy and security are our top priorities.</p>
            </div>
          </AnimateOnScroll>
        </footer>
      </div>
    </div>
  )
}
