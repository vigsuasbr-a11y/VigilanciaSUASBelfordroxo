const phone = "+55 21 99796-3649";

export const siteConfig = {
  name: "Portal da Vigilancia Socioassistencial",
  displayName: "Portal da Vigilância Socioassistencial",
  municipality: "Prefeitura de Belford Roxo",
  secretary: "Secretaria Municipal de Assistência Social e Cidadania",
  department: "Vigilância Socioassistencial",
  address:
    "SEMASC Secretaria de Assistência Social e Cidadania - Vila Medeiros, Belford Roxo - RJ, 26112-180",
  email: "vigsuasbr@gmail.com",
  phone,
  phoneHref: `tel:+${phone.replace(/\D/g, "")}`,
};

export const navItems = [
  { label: "Início", href: "/" },
  { label: "A Vigilância", href: "/a-vigilancia" },
  { label: "Serviços", href: "/servicos" },
  { label: "Indicadores", href: "/indicadores" },
  { label: "Notícias", href: "/publicacoes" },
  { label: "Sistemas", href: "/sistemas", featured: true },
  { label: "Contato", href: "/contato" },
];
