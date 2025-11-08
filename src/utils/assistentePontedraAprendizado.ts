export const atualizarBaseDeConhecimento = (entrada: string, respostaGerada: string) => {
  try {
    const historico =
      JSON.parse(localStorage.getItem("assistentePontedraAprendizado") || "[]");

    historico.push({
      entrada,
      respostaGerada,
      data: new Date().toISOString(),
    });

    localStorage.setItem(
      "assistentePontedraAprendizado",
      JSON.stringify(historico)
    );

    console.log("🧠 Base de aprendizado atualizada:", entrada);
  } catch (error) {
    console.error("Erro ao atualizar aprendizado:", error);
  }
};

export const analisarPadroes = () => {
  const historico: { entrada: string; respostaGerada: string; data: string }[] =
    JSON.parse(localStorage.getItem("assistentePontedraAprendizado") || "[]");

  if (historico.length < 3) return [];

  const padroes: { [key: string]: number } = {};
  historico.forEach((h) => {
    const palavrasChave = h.entrada.toLowerCase().split(/\s+/).filter(word => word.length > 2);
    palavrasChave.forEach(palavraChave => {
      if (!padroes[palavraChave]) padroes[palavraChave] = 0;
      padroes[palavraChave]++;
    });
  });

  const maisFrequentes = Object.entries(padroes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([palavra]) => palavra);

  return maisFrequentes;
};