import React from "react";
import TypewriterText from "@/components/TypewriterText";

const teRentaIcon = "/lovable-uploads/a878b72e-05fa-459d-a514-06cf3eca6f6c.png";

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
    <div className="flex items-center gap-4 justify-center md:justify-start">
      <img
        src={teRentaIcon}
        alt="Te Renta hand icon"
        className="w-24 h-24 md:w-28 md:h-28 object-contain drop-shadow-lg"
      />
      <div className="flex flex-col items-start text-left">
        <h1 className="text-4xl md:text-5xl font-bold mb-2 text-brand leading-tight">
          Te Renta
        </h1>
        <TypewriterText words={words} className="text-2xl md:text-3xl text-typewriter" />
      </div>
    </div>
  );
};

export default Hero;
