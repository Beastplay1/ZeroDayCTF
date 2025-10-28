"use client";
import { Card, CardBody, CardHeader } from "@heroui/react";
import { Orbitron } from "next/font/google";

const orbitron = Orbitron({ subsets: ["latin"] });

export default function About() {
  const features = [
    {
      icon: "🎯",
      title: "7-Day Challenges",
      description: "Battle proven CTF challenges from real competitions. First blood gets bonus points!"
    },
    {
      icon: "⚡",
      title: "24-Hour Unique",
      description: "Fresh AI-generated and exclusive challenges daily. Top 3 solvers earn massive bonuses!"
    },
    {
      icon: "🏆",
      title: "Competitive Ranking",
      description: "Climb the global leaderboard. Track your progress with detailed stats and achievements."
    },
    {
      icon: "📚",
      title: "All Categories",
      description: "Web, Crypto, Pwn, Reverse Engineering, Forensics, Mobile, Hardware, OSINT, and more!"
    },
    {
      icon: "🔥",
      title: "Streak System",
      description: "Build your solving streak and maintain momentum with daily challenges."
    },
    {
      icon: "🎓",
      title: "Learn & Grow",
      description: "Progress from beginner to elite with challenges ranging from Easy to Insane difficulty."
    }
  ];

  const stats = [
    { number: "10,000+", label: "Active Hackers" },
    { number: "500+", label: "Challenges" },
    { number: "24/7", label: "New Content" },
    { number: "100+", label: "Countries" }
  ];

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h1 className={`text-5xl font-bold text-white mb-4 ${orbitron.className}`}>
            <span className="text-zerogreen">{'>'}</span> About ZeroDayCTF
          </h1>
          <p className="text-gray-400 text-xl max-w-3xl mx-auto">
            The ultimate cybersecurity challenge platform where hackers learn, compete, and evolve
          </p>
        </div>

        <div className="mb-16">
          <Card className="bg-gradient-to-br from-zerogreen/5 to-transparent border-2 border-zerogreen/30">
            <CardBody className="p-8">
              <h2 className={`text-3xl font-bold text-white mb-6 ${orbitron.className}`}>
                <span className="text-zerogreen">◆</span> Our Mission
              </h2>
              <p className="text-gray-300 text-lg leading-relaxed mb-4">
                ZeroDayCTF is a cutting-edge Capture The Flag platform designed to challenge and elevate cybersecurity
                enthusiasts worldwide. We curate real challenges from past CTF tournaments sourced from CTFtime and other
                prestigious platforms, giving you the opportunity to solve authentic security puzzles.
              </p>
              <p className="text-gray-300 text-lg leading-relaxed mb-4">
                Our unique approach combines <span className="text-zerogreen font-bold">7-day challenges</span> from real
                CTF competitions with <span className="text-purple-400 font-bold">24-hour exclusive challenges</span> that
                are either AI-generated or crafted by our community of expert hackers.
              </p>
              <p className="text-gray-300 text-lg leading-relaxed">
                Whether you're a beginner taking your first steps into cybersecurity or an elite hacker looking for the
                next challenge, ZeroDayCTF provides a competitive environment to test your skills, learn new techniques,
                and climb the global leaderboard.
              </p>
            </CardBody>
          </Card>
        </div>

        <div className="mb-16">
          <h2 className={`text-3xl font-bold text-white text-center mb-8 ${orbitron.className}`}>
            <span className="text-zerogreen">{'>'}</span> Platform Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="bg-[#0f0f0f] border border-zerogreen/30 hover:border-zerogreen hover:shadow-lg hover:shadow-zerogreen/20 transition-all duration-300"
              >
                <CardBody className="p-6">
                  <div className="text-5xl mb-4">{feature.icon}</div>
                  <h3 className={`text-xl font-bold text-white mb-2 ${orbitron.className}`}>
                    {feature.title}
                  </h3>
                  <p className="text-gray-400">{feature.description}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>

        <div className="mb-16">
          <h2 className={`text-3xl font-bold text-white text-center mb-8 ${orbitron.className}`}>
            <span className="text-zerogreen">{'>'}</span> How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-br from-blue-500/10 to-transparent border-2 border-blue-500/30">
              <CardHeader className="pb-0 pt-6 px-6">
                <h3 className={`text-2xl font-bold text-blue-400 ${orbitron.className}`}>
                  📅 7-Day Challenges
                </h3>
              </CardHeader>
              <CardBody className="px-6 pb-6">
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-zerogreen mt-1">▸</span>
                    <span>Real challenges from past CTF competitions worldwide</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-zerogreen mt-1">▸</span>
                    <span>Available for 7 days with rotating challenges</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-zerogreen mt-1">▸</span>
                    <span>First blood earns bonus points</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-zerogreen mt-1">▸</span>
                    <span>Points based on difficulty and category</span>
                  </li>
                </ul>
              </CardBody>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/10 to-transparent border-2 border-purple-500/30">
              <CardHeader className="pb-0 pt-6 px-6">
                <h3 className={`text-2xl font-bold text-purple-400 ${orbitron.className}`}>
                  ⚡ 24-Hour Unique Challenges
                </h3>
              </CardHeader>
              <CardBody className="px-6 pb-6">
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-zerogreen mt-1">▸</span>
                    <span>AI-generated or community-exclusive challenges</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-zerogreen mt-1">▸</span>
                    <span>Fresh content every 24 hours</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-zerogreen mt-1">▸</span>
                    <span>Top 3 solvers get massive bonuses:</span>
                  </li>
                  <li className="pl-6 text-yellow-400 font-bold">
                    1st: +500 pts | 2nd: +250 pts | 3rd: +50 pts
                  </li>
                </ul>
              </CardBody>
            </Card>
          </div>
        </div>

        <div className="mb-16">
          <h2 className={`text-3xl font-bold text-white text-center mb-8 ${orbitron.className}`}>
            <span className="text-zerogreen">{'>'}</span> By The Numbers
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card
                key={index}
                className="bg-[#0f0f0f] border border-zerogreen/30 hover:border-zerogreen transition-all duration-300"
              >
                <CardBody className="text-center py-8">
                  <div className={`text-4xl font-bold text-zerogreen mb-2 ${orbitron.className}`}>
                    {stat.number}
                  </div>
                  <div className="text-gray-400">{stat.label}</div>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>

        <div className="text-center">
          <Card className="bg-gradient-to-r from-zerogreen/10 via-transparent to-purple-500/10 border-2 border-zerogreen/30">
            <CardBody className="p-8">
              <h2 className={`text-3xl font-bold text-white mb-4 ${orbitron.className}`}>
                Ready to Start Hacking?
              </h2>
              <p className="text-gray-400 text-lg mb-6">
                Join thousands of hackers from around the world and prove your skills
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <a
                  href="/signup"
                  className="px-8 py-3 bg-zerogreen text-black font-bold rounded hover:bg-zerogreen/90 transition-all duration-300"
                >
                  CREATE ACCOUNT
                </a>
                <a
                  href="/challanges"
                  className="px-8 py-3 bg-transparent border-2 border-zerogreen text-zerogreen font-bold rounded hover:bg-zerogreen/10 transition-all duration-300"
                >
                  VIEW CHALLENGES
                </a>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
