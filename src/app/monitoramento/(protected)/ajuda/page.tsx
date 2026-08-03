import {
  ArrowRight,
  BookOpenCheck,
  Building2,
  CalendarDays,
  CheckCircle2,
  CircleHelp,
  ClipboardCheck,
  ClipboardList,
  Eye,
  FileSearch,
  Gauge,
  KeyRound,
  ListChecks,
  LockKeyhole,
  MousePointerClick,
  RefreshCw,
  SearchCheck,
  Send,
  ShieldCheck,
  SquarePen,
  UserCog,
  Users,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";

type HelpCard = {
  title: string;
  description: string;
  icon: typeof CircleHelp;
  tone: "blue" | "green" | "amber" | "cyan" | "slate";
};

type AccountCard = {
  name: string;
  simpleName: string;
  description: string;
  canDo: string[];
  icon: typeof Users;
  tone: HelpCard["tone"];
};

type PageGuide = {
  title: string;
  href: Route;
  description: string;
  icon: typeof ClipboardList;
};

type Tutorial = {
  title: string;
  audience: string;
  href: Route;
  icon: typeof CircleHelp;
  tone: HelpCard["tone"];
  steps: string[];
  result: string;
  attention?: string;
};

type Routine = {
  title: string;
  description: string;
  icon: typeof CircleHelp;
  items: string[];
  tone: HelpCard["tone"];
};

const toneClasses: Record<HelpCard["tone"], string> = {
  blue: "border-blue-200 bg-blue-50 text-blue-950",
  green: "border-emerald-200 bg-emerald-50 text-emerald-950",
  amber: "border-amber-200 bg-amber-50 text-amber-950",
  cyan: "border-cyan-200 bg-cyan-50 text-cyan-950",
  slate: "border-slate-200 bg-slate-50 text-slate-950",
};

const howItWorks: HelpCard[] = [
  {
    title: "O sistema é um caderno digital",
    description:
      "Cada unidade registra os números do mês. O sistema guarda tudo com data, usuário e histórico, para ninguém depender de planilha solta.",
    icon: BookOpenCheck,
    tone: "blue",
  },
  {
    title: "Competência é o mês de trabalho",
    description:
      "Quando falamos em competência, pense assim: janeiro, fevereiro, março. Cada mês tem seu próprio preenchimento.",
    icon: ClipboardList,
    tone: "cyan",
  },
  {
    title: "Publicar é entregar a versão final",
    description:
      "Depois que a Vigilância confere, os dados podem ser publicados. O painel executivo usa esses dados já conferidos.",
    icon: CheckCircle2,
    tone: "green",
  },
  {
    title: "Permissão é uma chave",
    description:
      "Cada conta recebe chaves. Uma chave abre usuários, outra abre painéis, outra abre preenchimentos. Sem chave, a tela não aparece.",
    icon: KeyRound,
    tone: "amber",
  },
];

const accounts: AccountCard[] = [
  {
    name: "Administrador",
    simpleName: "Quem cuida da casa inteira",
    description:
      "É a conta que organiza usuários, permissões e configurações. Deve ser usada por pouca gente e com bastante cuidado.",
    canDo: [
      "Criar e ajustar contas",
      "Ver permissões",
      "Consultar auditoria",
      "Acompanhar todo o sistema",
    ],
    icon: ShieldCheck,
    tone: "blue",
  },
  {
    name: "Vigilância",
    simpleName: "Quem acompanha as entregas",
    description:
      "É o perfil que olha se as unidades preencheram, confere o que chegou, devolve quando precisa corrigir e acompanha prazos.",
    canDo: [
      "Ver competências",
      "Acompanhar pendências",
      "Revisar preenchimentos",
      "Orientar as unidades",
    ],
    icon: FileSearch,
    tone: "cyan",
  },
  {
    name: "Gestão ou Secretaria",
    simpleName: "Quem olha o resultado final",
    description:
      "É o perfil para enxergar o município como um todo. Ele deve olhar principalmente dados publicados e consolidados.",
    canDo: [
      "Ver painel executivo",
      "Comparar unidades",
      "Acompanhar indicadores estratégicos",
      "Tomar decisões com dados",
    ],
    icon: Gauge,
    tone: "green",
  },
  {
    name: "Unidade",
    simpleName: "Quem preenche os dados",
    description:
      "É a conta ligada a uma unidade, como PSB, PSE ou Centro POP. Ela registra o movimento mensal do próprio serviço.",
    canDo: [
      "Preencher o mês",
      "Salvar aos poucos",
      "Escrever observações",
      "Enviar para revisão",
    ],
    icon: Building2,
    tone: "amber",
  },
  {
    name: "Consulta",
    simpleName: "Quem só pode olhar",
    description:
      "É a conta para acompanhar informações liberadas, sem mexer nos cadastros nem alterar preenchimentos.",
    canDo: [
      "Consultar telas permitidas",
      "Ler informações",
      "Evitar alterações acidentais",
      "Apoiar acompanhamento",
    ],
    icon: Eye,
    tone: "slate",
  },
];

const flowSteps = [
  "A Vigilância abre ou escolhe a competência do mês.",
  "A unidade preenche seus indicadores e observações.",
  "O sistema salva o trabalho durante o preenchimento.",
  "A unidade envia para revisão quando termina.",
  "A Vigilância confere os dados recebidos.",
  "Se tiver erro, a competência volta para correção.",
  "Se estiver tudo certo, os dados são aprovados e publicados.",
  "Os painéis mostram a situação operacional e, depois, os resultados publicados.",
];

const pageGuides: PageGuide[] = [
  {
    title: "Início",
    href: "/monitoramento/inicio",
    description:
      "É a porta de entrada depois do login. Mostra atalhos, resumo da rede e caminhos principais.",
    icon: Gauge,
  },
  {
    title: "Competências",
    href: "/monitoramento/competencias",
    description:
      "É onde o mês nasce, anda, volta para correção, é revisado e pode ser publicado.",
    icon: ClipboardList,
  },
  {
    title: "Monitoramento",
    href: "/monitoramento/operacional",
    description:
      "Mostra quem entregou, quem está pendente, quem está em revisão e onde há atraso.",
    icon: ClipboardCheck,
  },
  {
    title: "Executivo",
    href: "/monitoramento/executivo",
    description:
      "Mostra os dados publicados para análise da gestão. É a visão do resultado, não do rascunho.",
    icon: Gauge,
  },
  {
    title: "Formulários, Indicadores e Grupos",
    href: "/monitoramento/formularios",
    description:
      "Explicam quais perguntas existem no formulário e como elas ficam separadas em blocos.",
    icon: BookOpenCheck,
  },
  {
    title: "Usuários e Permissões",
    href: "/monitoramento/usuarios",
    description:
      "Servem para organizar quem entra, qual papel a pessoa tem e quais chaves ela recebe.",
    icon: Users,
  },
  {
    title: "Auditoria",
    href: "/monitoramento/auditoria",
    description:
      "É o diário de bordo. Ajuda a saber quem fez uma ação importante e quando ela aconteceu.",
    icon: LockKeyhole,
  },
  {
    title: "Diagnóstico",
    href: "/monitoramento/diagnostico",
    description:
      "Mostra se o ambiente está configurado corretamente para login, permissões e serviços internos.",
    icon: FileSearch,
  },
];

const firstSteps: HelpCard[] = [
  {
    title: "1. Entre com sua conta",
    description:
      "Use o e-mail e a senha combinados. Se for uma senha temporária, trate como provisória e peça orientação para trocar quando necessário.",
    icon: LockKeyhole,
    tone: "blue",
  },
  {
    title: "2. Olhe o menu lateral",
    description:
      "O menu mostra apenas as portas que sua conta pode abrir. Se uma opção não aparece, normalmente é falta de permissão.",
    icon: MousePointerClick,
    tone: "cyan",
  },
  {
    title: "3. Escolha o mês certo",
    description:
      "Antes de preencher ou revisar, confira a unidade, o mês, o ano e a versão do formulário. Esse é o ponto mais importante.",
    icon: CalendarDays,
    tone: "amber",
  },
  {
    title: "4. Salve, revise e só depois envie",
    description:
      "Preencha com calma, observe avisos, escreva explicações quando precisar e envie para revisão apenas quando estiver completo.",
    icon: Send,
    tone: "green",
  },
];

const tutorials: Tutorial[] = [
  {
    title: "Tutorial 1: primeiro acesso",
    audience: "Para qualquer pessoa que acabou de receber uma conta",
    href: "/monitoramento/inicio",
    icon: LockKeyhole,
    tone: "blue",
    steps: [
      "Abra a tela de login e digite seu e-mail exatamente como foi cadastrado.",
      "Digite a senha recebida. Senha diferencia letras maiúsculas, minúsculas, números e símbolos.",
      "Depois de entrar, veja se aparece seu nome ou seu perfil no topo do sistema.",
      "Abra a tela Início e confira quais atalhos aparecem para você.",
      "Se uma tela importante não aparecer, anote o nome da tela e peça revisão de permissão.",
      "Quando terminar de usar, saia pelo botão de logout. Não deixe a sessão aberta em computador compartilhado.",
    ],
    result:
      "Você confirma se sua conta entra, se está ativa e se recebeu as permissões corretas.",
    attention:
      "Se aparecer acesso negado logo no começo, a conta pode estar sem papel, inativa ou sem permissão.",
  },
  {
    title: "Tutorial 2: abrir uma competência mensal",
    audience: "Para Vigilância ou perfil autorizado a abrir preenchimentos",
    href: "/monitoramento/competencias/nova",
    icon: CalendarDays,
    tone: "cyan",
    steps: [
      "Entre em Competências e clique em Nova competência.",
      "Escolha a unidade ou serviço: PSB, PSE ou Centro POP correto.",
      "Escolha a versão do formulário ligada ao mesmo setor da unidade.",
      "Escolha o ano e o mês que serão preenchidos.",
      "Clique em Abrir preenchimento.",
      "Se a competência já existir, o sistema abre a que já estava criada. Se não existir, ele cria uma nova.",
      "Se aparecer erro de formulário incompatível, revise unidade e versão do formulário antes de tentar novamente.",
    ],
    result: "O mês fica pronto para preenchimento, revisão e acompanhamento.",
    attention:
      "Não abra competência de teste em produção. Testes devem ficar em ambiente próprio de testes.",
  },
  {
    title: "Tutorial 3: preencher sem se perder",
    audience: "Para unidade ou pessoa responsável por lançar os dados",
    href: "/monitoramento/competencias",
    icon: SquarePen,
    tone: "green",
    steps: [
      "Entre em Competências e abra o mês da sua unidade.",
      "Leia o cabeçalho para confirmar unidade, mês, ano, status e progresso.",
      "Preencha grupo por grupo, sem pular para o final com pressa.",
      "Quando o campo for número, digite apenas o número que representa aquele atendimento ou situação.",
      "Quando um dado não se aplicar, use a opção apropriada em vez de inventar zero.",
      "Use observações para explicar mudanças grandes, dúvidas ou situações fora do comum.",
      "Veja se o salvamento automático confirmou o registro antes de fechar a página.",
      "Na revisão final, corrija erros impeditivos e justifique alertas quando fizer sentido.",
      "Clique em Enviar revisão somente quando o preenchimento estiver pronto.",
    ],
    result:
      "A competência sai do rascunho e chega para conferência da Vigilância.",
    attention:
      "Número errado com observação bonita continua sendo número errado. Primeiro corrija o dado, depois explique.",
  },
  {
    title: "Tutorial 4: acompanhar pendências",
    audience: "Para Vigilância acompanhar as 15 unidades e os demais serviços",
    href: "/monitoramento/operacional",
    icon: SearchCheck,
    tone: "amber",
    steps: [
      "Abra Monitoramento para ver a situação geral das competências.",
      "Separe mentalmente os status: pendente, em preenchimento, em revisão, devolvida, revisada e publicada.",
      "Procure primeiro unidades sem envio ou com atraso.",
      "Abra a competência quando precisar ver detalhes do progresso e dos avisos.",
      "Se precisar devolver para correção, escreva uma orientação objetiva: diga qual grupo, qual campo e o que precisa ajustar.",
      "Depois da correção, confira novamente antes de liberar a próxima etapa.",
      "Use a tela para orientar contatos e prioridades do dia.",
    ],
    result:
      "A Vigilância sabe quem entregou, quem falta entregar e onde precisa agir primeiro.",
  },
  {
    title: "Tutorial 5: consultar o painel executivo",
    audience: "Para gestão, secretaria e perfis de leitura estratégica",
    href: "/monitoramento/executivo",
    icon: Gauge,
    tone: "slate",
    steps: [
      "Abra Executivo para olhar os dados consolidados.",
      "Lembre que essa tela deve usar dados publicados, não rascunhos.",
      "Confira filtros de mês, setor e unidade antes de interpretar os números.",
      "Compare unidades apenas quando elas estiverem no mesmo contexto de formulário e período.",
      "Use indicadores estratégicos para perceber tendência, alerta ou ponto de atenção.",
      "Quando um número parecer estranho, volte na competência publicada e leia observações antes de concluir.",
    ],
    result:
      "A gestão olha o resultado do município com mais segurança e menos ruído operacional.",
    attention:
      "Dashboard não substitui conferência. Ele resume o que foi publicado.",
  },
  {
    title: "Tutorial 6: entender contas e permissões",
    audience: "Para administrador e responsáveis por acesso",
    href: "/monitoramento/usuarios",
    icon: UserCog,
    tone: "blue",
    steps: [
      "A criação do login começa na área segura de autenticação, onde fica o e-mail de acesso.",
      "No sistema, a tela Usuários mostra os perfis autorizados.",
      "Confira se o usuário está ativo antes de investigar outro problema.",
      "Veja em Permissões quais papéis existem e quais chaves cada papel carrega.",
      "Se a pessoa precisa preencher uma unidade, confirme também o vínculo correto com a unidade.",
      "Se a pessoa só deve consultar, prefira um papel de leitura em vez de dar acesso administrativo.",
      "Use Auditoria para conferir ações importantes quando houver dúvida sobre quem fez algo.",
    ],
    result:
      "Cada pessoa entra só onde precisa, com menos risco de erro ou acesso indevido.",
    attention:
      "Senhas administrativas e chaves sensíveis nunca devem aparecer no navegador nem ser enviadas em conversa comum.",
  },
];

const routines: Routine[] = [
  {
    title: "Rotina diária da Vigilância",
    description: "O que olhar quando abrir o sistema no começo do expediente.",
    icon: SearchCheck,
    tone: "cyan",
    items: [
      "Entrar no sistema e abrir Monitoramento.",
      "Ver quais competências estão pendentes ou atrasadas.",
      "Priorizar unidades que ainda não enviaram nada.",
      "Abrir devolvidas para conferir se houve correção.",
      "Registrar orientações claras quando precisar cobrar ajuste.",
    ],
  },
  {
    title: "Rotina da unidade",
    description: "O caminho mais seguro para preencher o mês sem retrabalho.",
    icon: ListChecks,
    tone: "green",
    items: [
      "Confirmar se está no mês correto.",
      "Preencher um grupo por vez.",
      "Salvar e observar mensagens de erro ou alerta.",
      "Escrever observações quando o número precisar de contexto.",
      "Fazer revisão final antes de enviar.",
    ],
  },
  {
    title: "Rotina de fechamento do mês",
    description: "O que fazer antes de considerar os dados prontos.",
    icon: ClipboardCheck,
    tone: "amber",
    items: [
      "Conferir se todas as unidades esperadas enviaram.",
      "Resolver erros impeditivos antes de publicar.",
      "Checar devoluções ainda abertas.",
      "Publicar apenas dados revisados.",
      "Usar o Executivo depois que os dados estiverem publicados.",
    ],
  },
  {
    title: "Rotina quando algo mudou",
    description: "Como agir quando há correção, republicação ou dúvida.",
    icon: RefreshCw,
    tone: "slate",
    items: [
      "Identificar qual mês e unidade foram afetados.",
      "Abrir a competência correspondente.",
      "Ler histórico, observações e status atual.",
      "Corrigir ou solicitar ajuste com motivo claro.",
      "Revisar novamente antes de usar no painel executivo.",
    ],
  },
];

const goldenRules = [
  "Senha é igual chave de casa: não empreste e não escreva em lugar público.",
  "Antes de preencher, confira se a unidade e o mês estão corretos.",
  "Use observações quando um número precisar de explicação.",
  "Só envie para revisão quando o preenchimento estiver completo.",
  "Só publique dados que já foram conferidos.",
  "Dados de teste devem ficar em ambiente próprio de testes, não na produção.",
];

const troubleshooting = [
  {
    problem: "Não consigo entrar",
    solution:
      "Confira e-mail e senha. Se continuar, peça ao administrador para verificar se sua conta está ativa.",
  },
  {
    problem: "Aparece acesso negado",
    solution:
      "Sua conta não tem a chave daquela tela. Peça revisão do papel ou da permissão.",
  },
  {
    problem: "Não vejo minha unidade",
    solution:
      "A conta pode estar sem vínculo com a unidade correta. A Vigilância ou o administrador deve conferir.",
  },
  {
    problem: "Os dados não aparecem no executivo",
    solution:
      "O dashboard executivo usa dados publicados. Se ainda está em rascunho ou revisão, ele não deve aparecer ali.",
  },
];

const glossary = [
  ["PSB", "Proteção Social Básica: acompanha famílias e o atendimento territorial."],
  [
    "PSE",
    "Proteção Social Especial: atendimento especializado para situações de violação de direitos.",
  ],
  ["Centro POP", "Serviço especializado para população em situação de rua."],
  ["Indicador", "Uma pergunta ou número que ajuda a entender o atendimento."],
  [
    "Observação",
    "Um espaço para explicar algo que o número sozinho não mostra.",
  ],
  [
    "Controle de acesso",
    "Um conjunto de permissões: cada pessoa só enxerga o que está autorizada a ver.",
  ],
];

export default function HelpPage() {
  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[18px] bg-[linear-gradient(135deg,#0f74d8_0%,#0052a3_54%,#0b335f_100%)] text-white shadow-[0_22px_54px_rgba(0,61,122,0.18)]">
        <div className="relative p-6 sm:p-8">
          <div className="pointer-events-none absolute -right-20 -top-28 h-72 w-72 rounded-full border border-white/12" />
          <div className="pointer-events-none absolute right-24 top-8 hidden h-56 w-56 rounded-full border border-white/12 lg:block" />
          <div className="relative z-10 max-w-4xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-blue-800">
              <CircleHelp className="h-4 w-4" aria-hidden="true" />
              Ajuda do sistema
            </span>
            <h1 className="mt-5 text-3xl font-bold leading-[1.15] tracking-normal sm:text-4xl">
              Como o Monitoramento funciona, explicado do jeito mais simples
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-white/88">
              Pense neste sistema como uma mesa organizada: cada pessoa tem uma
              cadeira, cada cadeira tem uma função, e cada dado passa por
              conferência antes de virar informação oficial.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {howItWorks.map((item) => {
          const Icon = item.icon;

          return (
            <article
              className={`rounded-[16px] border p-5 shadow-sm ${toneClasses[item.tone]}`}
              key={item.title}
            >
              <Icon className="h-7 w-7" aria-hidden="true" />
              <h2 className="mt-4 text-base font-semibold">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 opacity-80">
                {item.description}
              </p>
            </article>
          );
        })}
      </section>

      <section className="rounded-[18px] border border-blue-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
            Comece por aqui
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-blue-950">
            Entrei no sistema. O que faço agora?
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            A regra é simples: primeiro confirme quem você é, depois confirme
            onde está, e só então preencha, revise ou consulte.
          </p>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {firstSteps.map((step) => {
            const Icon = step.icon;

            return (
              <article
                className={`rounded-[16px] border p-5 ${toneClasses[step.tone]}`}
                key={step.title}
              >
                <Icon className="h-7 w-7" aria-hidden="true" />
                <h3 className="mt-4 font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 opacity-80">
                  {step.description}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="rounded-[18px] border border-blue-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-2 lg:max-w-4xl">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
            Tutoriais passo a passo
          </p>
          <h2 className="text-2xl font-semibold text-blue-950">
            O que fazer em cada situação
          </h2>
          <p className="text-sm leading-6 text-muted-foreground">
            Use estes tutoriais como uma receita. Leia de cima para baixo,
            execute uma etapa por vez e só avance quando a etapa anterior
            estiver certa.
          </p>
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-2">
          {tutorials.map((tutorial) => {
            const Icon = tutorial.icon;

            return (
              <article
                className={`rounded-[18px] border p-5 shadow-sm ${toneClasses[tutorial.tone]}`}
                key={tutorial.title}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-white/85 shadow-sm">
                      <Icon className="h-6 w-6" aria-hidden="true" />
                    </span>
                    <div>
                      <h3 className="text-lg font-semibold">
                        {tutorial.title}
                      </h3>
                      <p className="mt-1 text-sm font-bold opacity-75">
                        {tutorial.audience}
                      </p>
                    </div>
                  </div>
                  <Link
                    className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-[10px] bg-white px-3 py-2 text-sm font-semibold text-blue-800 shadow-sm transition hover:-translate-y-px hover:text-blue-950"
                    href={tutorial.href}
                  >
                    Abrir tela
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>

                <ol className="mt-5 space-y-3">
                  {tutorial.steps.map((step, index) => (
                    <li
                      className="flex gap-3 rounded-[12px] bg-white/72 p-3 text-sm leading-6 shadow-sm"
                      key={step}
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-700 text-xs font-semibold text-white">
                        {index + 1}
                      </span>
                      <span className="pt-0.5 font-medium">{step}</span>
                    </li>
                  ))}
                </ol>

                <p className="mt-4 rounded-[12px] bg-white/72 p-3 text-sm leading-6">
                  <span className="font-semibold">Resultado esperado: </span>
                  {tutorial.result}
                </p>
                {tutorial.attention ? (
                  <p className="mt-3 rounded-[12px] border border-amber-200 bg-amber-50 p-3 text-sm font-medium leading-6 text-amber-950">
                    <span className="font-semibold">Atenção: </span>
                    {tutorial.attention}
                  </p>
                ) : null}
              </article>
            );
          })}
        </div>
      </section>

      <section className="rounded-[18px] border border-blue-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
            Contas e papéis
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-blue-950">
            Quem entra no sistema e o que cada conta faz
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Nem toda conta faz a mesma coisa. Isso é proposital: cada pessoa vê
            apenas o que precisa para trabalhar com segurança.
          </p>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {accounts.map((account) => {
            const Icon = account.icon;

            return (
              <article
                className={`rounded-[16px] border p-5 ${toneClasses[account.tone]}`}
                key={account.name}
              >
                <div className="flex items-start gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-white/85 shadow-sm">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-lg font-semibold">{account.name}</h3>
                    <p className="mt-1 text-sm font-bold opacity-75">
                      {account.simpleName}
                    </p>
                    <p className="mt-3 text-sm leading-6 opacity-80">
                      {account.description}
                    </p>
                  </div>
                </div>
                <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                  {account.canDo.map((item) => (
                    <li
                      className="flex items-start gap-2 text-sm font-medium leading-5"
                      key={item}
                    >
                      <CheckCircle2
                        className="mt-0.5 h-4 w-4 shrink-0"
                        aria-hidden="true"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,0.92fr)_minmax(420px,1fr)]">
        <div className="rounded-[18px] border border-blue-100 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
            Fluxo mensal
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-blue-950">
            Como uma competência anda
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            É como uma fila bem combinada: abre, preenche, confere, corrige se
            precisar e publica quando estiver certo.
          </p>

          <ol className="mt-5 space-y-3">
            {flowSteps.map((step, index) => (
              <li
                className="flex gap-3 rounded-[12px] border border-slate-100 bg-slate-50 p-3"
                key={step}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-700 text-sm font-semibold text-white">
                  {index + 1}
                </span>
                <span className="pt-1 text-sm font-medium leading-6 text-slate-800">
                  {step}
                </span>
              </li>
            ))}
          </ol>
        </div>

        <div className="rounded-[18px] border border-blue-100 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
            Mapa das telas
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-blue-950">
            Para que serve cada página
          </h2>

          <div className="mt-5 grid gap-3">
            {pageGuides.map((page) => {
              const Icon = page.icon;

              return (
                <Link
                  className="group flex items-start gap-3 rounded-[14px] border border-slate-100 bg-white p-4 shadow-sm transition hover:border-blue-300 hover:bg-blue-50/60"
                  href={page.href}
                  key={page.href}
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-blue-50 text-blue-700">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-blue-950">
                      {page.title}
                    </span>
                    <span className="mt-1 block text-sm leading-6 text-muted-foreground">
                      {page.description}
                    </span>
                  </span>
                  <ArrowRight
                    className="mt-2 h-4 w-4 shrink-0 text-blue-500 transition group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="rounded-[18px] border border-blue-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
            Rotina recomendada
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-blue-950">
            O combinado para o trabalho não embolar
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            O sistema ajuda mais quando todo mundo segue a mesma ordem. Assim
            fica fácil saber o que falta, quem precisa corrigir e quando o dado
            já pode ser usado pela gestão.
          </p>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {routines.map((routine) => {
            const Icon = routine.icon;

            return (
              <article
                className={`rounded-[16px] border p-5 ${toneClasses[routine.tone]}`}
                key={routine.title}
              >
                <Icon className="h-7 w-7" aria-hidden="true" />
                <h3 className="mt-4 font-semibold">{routine.title}</h3>
                <p className="mt-2 text-sm leading-6 opacity-80">
                  {routine.description}
                </p>
                <ul className="mt-4 space-y-2">
                  {routine.items.map((item) => (
                    <li
                      className="flex items-start gap-2 text-sm font-medium leading-5"
                      key={item}
                    >
                      <CheckCircle2
                        className="mt-0.5 h-4 w-4 shrink-0"
                        aria-hidden="true"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <div className="rounded-[18px] border border-amber-100 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
            Regras de ouro
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-blue-950">
            Cuidados para não se perder
          </h2>
          <ul className="mt-5 space-y-3">
            {goldenRules.map((rule) => (
              <li
                className="flex gap-3 text-sm font-medium leading-6 text-slate-800"
                key={rule}
              >
                <ShieldCheck
                  className="mt-0.5 h-5 w-5 shrink-0 text-amber-600"
                  aria-hidden="true"
                />
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-[18px] border border-blue-100 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
            Quando algo der errado
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-blue-950">
            O que conferir primeiro
          </h2>
          <div className="mt-5 space-y-3">
            {troubleshooting.map((item) => (
              <article
                className="rounded-[14px] border border-slate-100 bg-slate-50 p-4"
                key={item.problem}
              >
                <h3 className="font-semibold text-slate-950">{item.problem}</h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {item.solution}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-[18px] border border-blue-100 bg-white p-5 shadow-sm sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
          Mini glossário
        </p>
        <h2 className="mt-1 text-2xl font-semibold text-blue-950">
          Palavras que aparecem bastante
        </h2>
        <dl className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {glossary.map(([term, description]) => (
            <div
              className="rounded-[14px] border border-slate-100 bg-slate-50 p-4"
              key={term}
            >
              <dt className="font-semibold text-blue-950">{term}</dt>
              <dd className="mt-1 text-sm leading-6 text-muted-foreground">
                {description}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
