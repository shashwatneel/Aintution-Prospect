import { useLocation } from "wouter";
import AI_LOGO from "@assets/AI_LOGO_1781758197757.png";
import HERO_DESKTOP from "@assets/Client_Find_Aintution_main_image_1781758213717.png";
import HERO_MOBILE from "@assets/Client_Find_Aintution_main_image_9.16_1781758220281.png";
import { motion } from "framer-motion";

export default function LandingPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdfbfb] to-[#ebedee] overflow-hidden relative">
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-200/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-pink-200/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-20 w-96 h-96 bg-purple-200/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000" />

      <div className="container mx-auto px-4 py-8 relative z-10 flex flex-col items-center">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center mb-12"
        >
          <img src={AI_LOGO} alt="Aintution Prospects Logo" className="w-24 h-24 object-contain mb-4 drop-shadow-xl" />
          <h1 className="text-4xl md:text-6xl font-black text-shimmer tracking-tight">
            Aintution Prospects
          </h1>
        </motion.div>

        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="w-full max-w-5xl mx-auto cursor-pointer group"
          onClick={() => setLocation("/sign-in")}
        >
          <div className="gradient-border p-1 group-hover:scale-[1.02] transition-transform duration-500 ease-out shadow-2xl">
            <div className="glass-panel rounded-2xl overflow-hidden aspect-video relative hidden md:block">
              <img
                src={HERO_DESKTOP}
                alt="App Preview"
                className="w-full h-full object-cover rounded-xl"
              />
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-300 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 bg-white/80 backdrop-blur-md px-6 py-3 rounded-full font-bold text-gray-800 shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                  Click to Get Started
                </div>
              </div>
            </div>
            <div className="glass-panel rounded-2xl overflow-hidden aspect-[9/16] relative md:hidden">
              <img
                src={HERO_MOBILE}
                alt="App Preview"
                className="w-full h-full object-cover rounded-xl"
              />
              <div className="absolute inset-0 bg-white/10 flex items-center justify-center">
                <div className="bg-white/80 backdrop-blur-md px-6 py-3 rounded-full font-bold text-gray-800 shadow-lg">
                  Tap to Start
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
