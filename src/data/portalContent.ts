export const adminMetrics = [
  {
    label: "Agendamentos hoje",
    value: "18",
    detail: "+4 em relacao a ontem",
  },
  {
    label: "Confirmados",
    value: "14",
    detail: "taxa de confirmacao em 78%",
  },
  {
    label: "Novos leads",
    value: "11",
    detail: "vindos da landing e do WhatsApp",
  },
  {
    label: "Receita estimada",
    value: "2.480$",
    detail: "considerando os horarios ja fechados",
  },
] as const;

export const adminAppointments = [
  {
    time: "09:00",
    client: "Mariana Costa",
    service: "Botox",
    status: "Confirmado",
  },
  {
    time: "10:30",
    client: "Fernanda Rocha",
    service: "Limpeza de pele",
    status: "Em analise",
  },
  {
    time: "13:00",
    client: "Camila Souza",
    service: "Bioestimulador",
    status: "Confirmado",
  },
  {
    time: "15:30",
    client: "Paula Mendes",
    service: "Peeling facial",
    status: "Aguardando retorno",
  },
] as const;

export const adminLeads = [
  {
    name: "Juliana Alves",
    source: "Landing page",
    intent: "Quero agendar preenchimento labial ainda esta semana.",
  },
  {
    name: "Bianca Lima",
    source: "WhatsApp",
    intent: "Preciso saber valores do plano Plus para a minha operacao.",
  },
  {
    name: "Larissa Dias",
    source: "Instagram",
    intent: "Gostaria de entender como funciona o agendamento automatico.",
  },
] as const;

export const adminIntegrations = [
  "Login com controle de acesso por perfis",
  "Calendario com bloqueio de horarios e reagendamento",
  "Confirmacao automatica por WhatsApp e e-mail",
  "Relatorios de comparecimento, conversao e faturamento",
] as const;

export const bookingAvailability = [
  {
    isoDate: "2026-03-23",
    label: "23 Mar 2026",
    weekday: "Seg",
    dayNumber: 23,
    slots: ["09:00", "10:30", "14:00", "16:30"],
  },
  {
    isoDate: "2026-03-24",
    label: "24 Mar 2026",
    weekday: "Ter",
    dayNumber: 24,
    slots: ["09:30", "11:00", "15:00", "18:00"],
  },
  {
    isoDate: "2026-03-26",
    label: "26 Mar 2026",
    weekday: "Qui",
    dayNumber: 26,
    slots: ["08:30", "10:00", "13:30", "17:00"],
  },
  {
    isoDate: "2026-03-27",
    label: "27 Mar 2026",
    weekday: "Sex",
    dayNumber: 27,
    slots: ["09:00", "12:00", "14:30", "16:00"],
  },
  {
    isoDate: "2026-03-30",
    label: "30 Mar 2026",
    weekday: "Seg",
    dayNumber: 30,
    slots: ["09:00", "10:30", "15:30"],
  },
  {
    isoDate: "2026-03-31",
    label: "31 Mar 2026",
    weekday: "Ter",
    dayNumber: 31,
    slots: ["09:30", "13:00", "17:30"],
  },
] as const;
