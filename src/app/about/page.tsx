"use client";
import { Card, CardBody, CardHeader } from "@heroui/react";
import { Orbitron } from "next/font/google";
import { useI18n } from "@/lib/i18n/context";

const orbitron = Orbitron({ subsets: ["latin"] });

export default function About() {
  const { t } = useI18n();

  const features = [
    { icon: "🎯", titleKey: "about.f1Title", descKey: "about.f1Desc" },
    { icon: "⚡", titleKey: "about.f2Title", descKey: "about.f2Desc" },
    { icon: "🏆", titleKey: "about.f3Title", descKey: "about.f3Desc" },
    { icon: "📚", titleKey: "about.f4Title", descKey: "about.f4Desc" },
    { icon: "👥", titleKey: "about.f5Title", descKey: "about.f5Desc" },
    { icon: "🎓", titleKey: "about.f6Title", descKey: "about.f6Desc" },
  ];

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h1 className={`text-5xl font-bold text-white mb-4 ${orbitron.className}`}>
            <span className="text-zerogreen">{">"}</span> {t("about.title")}
          </h1>
          <p className="text-gray-400 text-xl max-w-3xl mx-auto">
            {t("about.subtitle")}
          </p>
        </div>

        <div className="mb-16">
          <Card className="bg-gradient-to-br from-zerogreen/5 to-transparent border-2 border-zerogreen/30">
            <CardBody className="p-8">
              <h2 className={`text-3xl font-bold text-white mb-6 ${orbitron.className}`}>
                <span className="text-zerogreen">◆</span> {t("about.ourMission")}
              </h2>
              <p className="text-gray-300 text-lg leading-relaxed mb-4">
                {t("about.missionText1")}
              </p>
              <p className="text-gray-300 text-lg leading-relaxed mb-4">
                {t("about.missionText2")}
              </p>
              <p className="text-gray-300 text-lg leading-relaxed">
                {t("about.missionText3")}
              </p>
            </CardBody>
          </Card>
        </div>

        <div className="mb-16">
          <h2 className={`text-3xl font-bold text-white text-center mb-8 ${orbitron.className}`}>
            <span className="text-zerogreen">{">"}</span> {t("about.platformFeatures")}
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
                    {t(feature.titleKey)}
                  </h3>
                  <p className="text-gray-400">{t(feature.descKey)}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>

        <div className="mb-16">
          <h2 className={`text-3xl font-bold text-white text-center mb-8 ${orbitron.className}`}>
            <span className="text-zerogreen">{">"}</span> {t("about.howItWorks")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-br from-blue-500/10 to-transparent border-2 border-blue-500/30">
              <CardHeader className="pb-0 pt-6 px-6">
                <h3 className={`text-2xl font-bold text-blue-400 ${orbitron.className}`}>
                  📅 {t("about.w1Title")}
                </h3>
              </CardHeader>
              <CardBody className="px-6 pb-6">
                <ul className="space-y-2 text-gray-300">
                  {["about.w1l1","about.w1l2","about.w1l3","about.w1l4"].map((key) => (
                    <li key={key} className="flex items-start gap-2">
                      <span className="text-zerogreen mt-1">▸</span>
                      <span>{t(key)}</span>
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/10 to-transparent border-2 border-purple-500/30">
              <CardHeader className="pb-0 pt-6 px-6">
                <h3 className={`text-2xl font-bold text-purple-400 ${orbitron.className}`}>
                  ⚡ {t("about.w2Title")}
                </h3>
              </CardHeader>
              <CardBody className="px-6 pb-6">
                <ul className="space-y-2 text-gray-300">
                  {["about.w2l1","about.w2l2","about.w2l3"].map((key) => (
                    <li key={key} className="flex items-start gap-2">
                      <span className="text-zerogreen mt-1">▸</span>
                      <span>{t(key)}</span>
                    </li>
                  ))}
                  <li className="pl-6 text-yellow-400 font-bold">{t("about.w2l4")}</li>
                </ul>
              </CardBody>
            </Card>
          </div>
        </div>



        <div className="text-center">
          <Card className="bg-gradient-to-r from-zerogreen/10 via-transparent to-purple-500/10 border-2 border-zerogreen/30">
            <CardBody className="p-8">
              <h2 className={`text-3xl font-bold text-white mb-4 ${orbitron.className}`}>
                {t("about.readyToHack")}
              </h2>
              <p className="text-gray-400 text-lg mb-6">
                {t("about.readySubtitle")}
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <a
                  href="/signup"
                  className="px-8 py-3 bg-zerogreen text-black font-bold rounded hover:bg-zerogreen/90 transition-all duration-300"
                >
                  {t("about.createAccount")}
                </a>
                <a
                  href="/challenges"
                  className="px-8 py-3 bg-transparent border-2 border-zerogreen text-zerogreen font-bold rounded hover:bg-zerogreen/10 transition-all duration-300"
                >
                  {t("about.viewChallenges")}
                </a>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
