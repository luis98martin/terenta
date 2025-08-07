import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // For now, redirect to welcome page
    // Later this can check if user is authenticated and redirect accordingly
    navigate("/welcome");
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="animate-bounce-gentle">
        <h1 className="text-4xl font-bold text-foreground">
          Te<span className="text-accent">Renta</span>?
        </h1>
      </div>
    </div>
  );
};

export default Index;
