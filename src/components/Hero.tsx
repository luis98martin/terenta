import React from "react";
import TypewriterText from "@/components/TypewriterText";

const heroImage = "/lovable-uploads/87056922-0d10-4a21-b800-6c0afc9337ce.png";

const words = [
  "Comida",
  "Cine",
  "Golf",
  "Copas",
  "Viaje",
  "Fiesta",
  "Padel",
  "Cerves",
  "Cena",
];

const Hero: React.FC = () => {
  return (
    <div className="flex items-center justify-between gap-6 md:gap-8">
      <div className="flex flex-col items-start text-left">
        <h1 className="font-marker text-4xl md:text-5xl mb-2 text-brand leading-tight">
          Te Renta
        </h1>
        <TypewriterText
          words={words}
          typingSpeed={120}
          deleteSpeed={80}
          pauseMs={1200}
          className="text-2xl md:text-3xl text-typewriter font-montserrat font-bold"
        />
      </div>
      <img
        src={heroImage}
        alt="Te Renta planning illustration"
        className="w-28 h-28 md:w-32 md:h-32 object-contain drop-shadow-lg"
        loading="eager"
      />
    </div>
  );
};

export default Hero;
