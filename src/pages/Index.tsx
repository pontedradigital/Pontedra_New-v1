import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MadeWithDyad } from "@/components/made-with-dyad";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/landing"); // Redireciona incondicionalmente para a Landing Page
  }, [navigate]);

  // Este conteúdo será visto apenas por um breve momento antes do redirecionamento
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground">
      <div className="text-center">
        <img src="https://qtuctrqomfwvantainjc.supabase.co/storage/v1/object/public/images/pontedra-logo.webp" alt="Pontedra Logo" className="h-20 w-auto mx-auto mb-4" />
        <h1 className="text-4xl font-bold mb-4">Redirecionando...</h1>
        <p className="text-xl text-muted-foreground">Aguarde um momento.</p>
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default Index;