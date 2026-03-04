import NewMemberForm from "./form";

interface PageProps {
  searchParams: Promise<{ origem?: string }>;
}

export default async function NewMemberPage({ searchParams }: PageProps) {
  // ARQUITETURA LIMPA:
  // A página (Server Component) atua apenas como container.
  // O formulário (Client Component) é autônomo e busca seus próprios dados (Igrejas, Cargos, etc).
  
  // INJEÇÃO FUNCIONAL: Captura o rastro de navegação (Retorno Inteligente)
  const resolvedParams = await searchParams;
  const origem = resolvedParams?.origem || 'membros';

  return (
    <div className="max-w-[1600px] mx-auto">
       <NewMemberForm origem={origem} />
    </div>
  );
}