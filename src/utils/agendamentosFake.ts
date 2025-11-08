export const registrarAgendamento = (servico: string, data: string, hora: string, clientEmail: string) => {
  const novos = JSON.parse(localStorage.getItem("agendamentosPontedra") || "[]");
  const newAppointment = { servico, data, hora, clientEmail, criadoEm: new Date().toISOString() };
  novos.push(newAppointment);
  localStorage.setItem("agendamentosPontedra", JSON.stringify(novos));
  console.log("✅ Novo agendamento registrado:", newAppointment);
};