import { Client, Appointment, Service } from "@/data/mockData";

export const gerarRelatorioInteligente = (
  clientes: Client[],
  agendamentos: Appointment[],
  servicos: Service[]
) => {
  const totalClientes = clientes.length;
  const totalAgendamentos = agendamentos.length;
  const totalServicos = servicos.length;

  const agendamentosPendentes = agendamentos.filter(a => a.status === "pending").length;
  const agendamentosConcluidos = agendamentos.filter(a => a.status === "completed" || a.status === "confirmed").length;

  const taxaConversao = totalAgendamentos
    ? ((agendamentosConcluidos / totalAgendamentos) * 100).toFixed(1)
    : "0";

  const sugestoes = [];

  if (parseFloat(taxaConversao) < 70) {
    sugestoes.push("A taxa de conclusão de serviços pode ser melhorada. Considere enviar lembretes mais frequentes ou ofertas para agendamentos pendentes.");
  }

  if (totalClientes < 10) {
    sugestoes.push("A base de clientes é pequena. Invista em campanhas de aquisição de clientes e programas de indicação.");
  } else if (totalClientes > 50 && totalClientes < 100) {
    sugestoes.push("Sua base de clientes está crescendo! Mantenha o engajamento com conteúdo relevante e promoções exclusivas.");
  }

  if (servicos.length > 0) {
    const servicosDisponiveis = servicos.filter(s => s.availability === "available");
    if (servicosDisponiveis.length > 0) {
      const maisUsado = servicosDisponiveis[Math.floor(Math.random() * servicosDisponiveis.length)];
      sugestoes.push(`O serviço "${maisUsado.name}" está com bom desempenho. Considere destacá-lo em campanhas de marketing.`);
    } else {
      sugestoes.push("Nenhum serviço disponível. Verifique o status dos seus serviços para garantir que os clientes possam agendar.");
    }
  } else {
    sugestoes.push("Nenhum serviço cadastrado. Adicione seus serviços para que os clientes possam agendar.");
  }

  if (agendamentosPendentes > 0) {
    sugestoes.push(`Você tem ${agendamentosPendentes} agendamentos pendentes. Priorize o acompanhamento para convertê-los em confirmados.`);
  }

  const relatorio = {
    dataGeracao: new Date().toLocaleDateString('pt-BR'),
    totalClientes,
    totalAgendamentos,
    totalServicos,
    taxaConversao,
    sugestoes,
  };

  localStorage.setItem("pontedra_relatorio_inteligente", JSON.stringify(relatorio));

  return relatorio;
};

export const obterUltimoRelatorio = () => {
  const relatorio = localStorage.getItem("pontedra_relatorio_inteligente");
  return relatorio ? JSON.parse(relatorio) : null;
};