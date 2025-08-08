import React from "react";
import TypewriterText from "@/components/TypewriterText";

const heroImage = "/lovable-uploads/AppLogo.png";

const words = [
  "Comida?",
  "Cine?",
  "Golf?",
  "Copas?",
  "Viaje?",
  "Fiesta?",
  "Padel?",
  "Cerves?",
  "Cena?",
];

const Hero: React.FC = () => {
  return (
    <div className="flex items-center justify-center gap-3 md:gap-4">
      <div className="flex flex-col items-end text-right">
        <h1 className="font-chewy font-bold text-5xl md:text-6xl mb-1 text-brand leading-tight">
          Te Renta
        </h1>
        <TypewriterText
          words={words}
          typingSpeed={120}
          deleteSpeed={80}
          pauseMs={1200}
          showCursor={false}
          className="text-2xl md:text-3xl text-typewriter font-montserrat font-bold text-right"
        />
      </div>
      <img
        src={heroImage}
        alt="Te Renta app logo"
        className="w-28 h-28 md:w-32 md:h-32 object-contain drop-shadow-lg"
        loading="eager"
      />
    </div>
  );
};

export default Hero;
