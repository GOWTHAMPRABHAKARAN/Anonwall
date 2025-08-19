"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, Users, MessageSquare, AlertTriangle, CheckCircle, XCircle, Flag, Heart } from "lucide-react"
import AnimateOnScroll from "@/components/animate-on-scroll"

export function CommunityGuidelines() {
  const guidelines = [
    {
      icon: <Heart className="h-5 w-5" />,
      title: "Be Respectful",
      description: "Treat all community members with respect and kindness, even when disagreeing.",
      examples: {
        good: ["Constructive criticism", "Polite disagreement", "Helpful suggestions"],
        bad: ["Personal attacks", "Harassment", "Discriminatory language"],
      },
    },
    {
      icon: <MessageSquare className="h-5 w-5" />,
      title: "Stay On Topic",
      description: "Keep discussions relevant to the wall's purpose and avoid derailing conversations.",
      examples: {
        good: ["Relevant responses", "Thoughtful questions", "Related experiences"],
        bad: ["Off-topic spam", "Unrelated promotions", "Random conversations"],
      },
    },
    {
      icon: <Shield className="h-5 w-5" />,
      title: "No Harmful Content",
      description: "Avoid sharing content that could harm others or violate laws.",
      examples: {
        good: ["Constructive feedback", "Educational content", "Supportive messages"],
        bad: ["Threats or violence", "Illegal activities", "Harmful instructions"],
      },
    },
    {
      icon: <Users className="h-5 w-5" />,
      title: "Protect Privacy",
      description: "Don't share personal information about yourself or others without consent.",
      examples: {
        good: ["General experiences", "Anonymous stories", "Public information"],
        bad: ["Personal addresses", "Phone numbers", "Private details"],
      },
    },
  ]

  const consequences = [
    {
      level: "Warning",
      color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
      description: "First-time minor violations receive a warning and content removal.",
    },
    {
      level: "Content Removal",
      color: "bg-orange-500/20 text-orange-400 border-orange-500/50",
      description: "Inappropriate content is automatically removed after community reports.",
    },
    {
      level: "Temporary Block",
      color: "bg-red-500/20 text-red-400 border-red-500/50",
      description: "Repeated violations may result in temporary posting restrictions.",
    },
    {
      level: "Permanent Ban",
      color: "bg-gray-500/20 text-gray-400 border-gray-500/50",
      description: "Severe or repeated violations result in permanent access removal.",
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <AnimateOnScroll className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">Community Guidelines</h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Our guidelines help create a safe, respectful environment for anonymous discussions. Please read and follow
          these rules to maintain a positive community experience.
        </p>
      </AnimateOnScroll>

      {/* Core Principles */}
      <AnimateOnScroll>
        <Card className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border-purple-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Shield className="h-6 w-6 text-purple-400" />
              Core Principles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-white mb-2">Anonymity with Responsibility</h3>
                <p className="text-gray-300">
                  While you can post anonymously, you're still responsible for your words and their impact on others.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">Community Self-Moderation</h3>
                <p className="text-gray-300">
                  Help maintain quality by reporting inappropriate content and engaging constructively.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </AnimateOnScroll>

      {/* Detailed Guidelines */}
      <div className="grid gap-6">
        {guidelines.map((guideline, index) => (
          <AnimateOnScroll key={index} delayMs={index * 80}>
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-white">
                  <div className="p-2 bg-purple-600/20 rounded-lg text-purple-400">{guideline.icon}</div>
                  {guideline.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-300">{guideline.description}</p>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="flex items-center gap-2 font-medium text-green-400 mb-2">
                      <CheckCircle className="h-4 w-4" />
                      Encouraged
                    </h4>
                    <ul className="space-y-1">
                      {guideline.examples.good.map((example, i) => (
                        <li key={i} className="text-sm text-gray-300 flex items-center gap-2">
                          <div className="w-1 h-1 bg-green-400 rounded-full" />
                          {example}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="flex items-center gap-2 font-medium text-red-400 mb-2">
                      <XCircle className="h-4 w-4" />
                      Not Allowed
                    </h4>
                    <ul className="space-y-1">
                      {guideline.examples.bad.map((example, i) => (
                        <li key={i} className="text-sm text-gray-300 flex items-center gap-2">
                          <div className="w-1 h-1 bg-red-400 rounded-full" />
                          {example}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </AnimateOnScroll>
        ))}
      </div>

      {/* Reporting System */}
      <AnimateOnScroll>
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-white">
              <Flag className="h-6 w-6 text-orange-400" />
              Reporting System
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-300">Help us maintain community standards by reporting content that violates these guidelines.</p>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-900 rounded-lg">
                <Flag className="h-8 w-8 text-orange-400 mx-auto mb-2" />
                <h4 className="font-medium text-white mb-1">Report Content</h4>
                <p className="text-sm text-gray-400">Click the report button on any post that violates guidelines</p>
              </div>
              <div className="text-center p-4 bg-gray-900 rounded-lg">
                <Users className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                <h4 className="font-medium text-white mb-1">Community Review</h4>
                <p className="text-sm text-gray-400">Multiple reports trigger automatic content review</p>
              </div>
              <div className="text-center p-4 bg-gray-900 rounded-lg">
                <Shield className="h-8 w-8 text-green-400 mx-auto mb-2" />
                <h4 className="font-medium text-white mb-1">Automatic Action</h4>
                <p className="text-sm text-gray-400">Content is removed after reaching the report threshold</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </AnimateOnScroll>

      {/* Consequences */}
      <AnimateOnScroll>
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-white">
              <AlertTriangle className="h-6 w-6 text-yellow-400" />
              Consequences for Violations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {consequences.map((consequence, index) => (
                <div key={index} className="flex items-center gap-4 p-3 bg-gray-900 rounded-lg">
                  <Badge className={consequence.color}>{consequence.level}</Badge>
                  <p className="text-gray-300 flex-1">{consequence.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </AnimateOnScroll>

      {/* Community Values */}
      <AnimateOnScroll>
        <Card className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border-purple-500/20">
          <CardContent className="p-6 text-center">
            <h3 className="text-xl font-semibold text-white mb-4">Our Community Values</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="space-y-2">
                <Heart className="h-6 w-6 text-pink-400 mx-auto" />
                <h4 className="font-medium text-white">Empathy</h4>
                <p className="text-gray-300">Understanding and respecting different perspectives</p>
              </div>
              <div className="space-y-2">
                <Shield className="h-6 w-6 text-blue-400 mx-auto" />
                <h4 className="font-medium text-white">Safety</h4>
                <p className="text-gray-300">Creating secure spaces for honest expression</p>
              </div>
              <div className="space-y-2">
                <Users className="h-6 w-6 text-green-400 mx-auto" />
                <h4 className="font-medium text-white">Inclusion</h4>
                <p className="text-gray-300">Welcoming all voices and experiences</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </AnimateOnScroll>
    </div>
  )
}
