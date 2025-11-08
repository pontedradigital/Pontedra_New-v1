export const assistentePontedraBase = {
  saudacao: [
    "Olá! 👋 Sou a Assistente Pontedra. Como posso ajudar hoje?",
    "Oi! 😊 Aqui é a Assistente Pontedra, posso te ajudar com agendamentos ou informações sobre serviços."
  ],

  duvidas: {
    horario: "Os atendimentos estão disponíveis de segunda a sexta, das 8h às 18h. Quer que eu veja o próximo horário livre pra você?",
    servicos: "Oferecemos serviços personalizados. Posso te mostrar os serviços disponíveis ou agendar um agora mesmo?",
    pagamento: "Aceitamos pagamento via Pix, cartão e transferência bancária. Deseja visualizar o resumo financeiro?"
  },

  agendamento: {
    inicio: "Perfeito! Para agendar, me informe o nome do serviço e o dia desejado. 😉",
    prompt_servico: "Claro! Para qual serviço você gostaria de agendar? Me diga o nome do serviço. 📝",
    prompt_data_hora: (serviceName: string) => `Ótimo! E qual dia e horário você prefere para o serviço de ${serviceName}? Por exemplo: 'amanhã às 10h' ou '25/12 às 14h'. ⏰`,
    confirmacao: (servico: string, data: string, hora: string) =>
      `Confirme, por favor: deseja agendar o serviço **${servico}** para o dia **${data}** às **${hora}**?`,
    sucesso: (servico: string, data: string, hora: string) =>
      `✅ Agendamento confirmado! O serviço **${servico}** foi marcado para **${data}** às **${hora}**. Um lembrete será enviado automaticamente.`,
    erro_servico_nao_encontrado: "Não encontrei este serviço. Por favor, escolha um dos nossos serviços: Corte de Cabelo Masculino, Manicure e Pedicure, Massagem Relaxante, Coloração Feminina ou Limpeza de Pele. 🧐",
    erro_data_hora_invalida: "Não consegui entender a data ou hora. Por favor, tente novamente com um formato como 'amanhã às 14h' ou '25/12 às 10h'. 📅",
    erro_agendamento_generico: "Desculpe, não consegui registrar seu agendamento. 😔 Por favor, tente novamente."
  },

  promocoes: "Sim! 🎉 A Assistente Pontedra identificou que o serviço de Manicure e Pedicure está com 10% de desconto essa semana. Deseja aproveitar?",
  
  suporte_humano: "Sem problemas! Um de nossos atendentes será notificado para te ajudar. Enquanto isso, posso te ajudar com alguma dúvida sobre serviços? 🧑‍💻",

  agendamento_existente: (serviceName: string, date: string, time: string) => `Seu próximo agendamento é para '${serviceName}' em ${date} às ${time}. Status: Confirmado. 🗓️`,
  sem_agendamento_futuro: "Você não tem agendamentos futuros registrados. Que tal agendar um novo serviço? 🗓️",

  cancelar_agendamento_prompt: "Para cancelar um agendamento, por favor, acesse a página 'Meus Agendamentos' ou informe o ID do agendamento que deseja cancelar. (Funcionalidade simulada) ❌",
  reagendar_prompt: "Para reagendar, por favor, acesse a página 'Meus Agendamentos' e selecione a opção de reagendamento. (Funcionalidade simulada) 🔄",

  agradecimento: "De nada! 😊 Se precisar de mais alguma coisa, é só chamar.",
  despedida: "Até mais! 👋 Tenha um ótimo dia.",

  fallback: [
    "Desculpe, não entendi. Pode reformular a pergunta? 😅",
    "Hmm… acho que não captei direito. Pode tentar de outra forma?",
    "Não encontrei uma resposta para isso, mas posso chamar alguém da equipe se desejar."
  ]
};