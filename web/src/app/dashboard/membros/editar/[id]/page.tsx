import EditMemberForm from "./EditMemberForm"; // Importação Default (Correção do erro 'undefined')

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditMemberPage({ params }: PageProps) {
  // Em Next.js 15, params é uma Promise que precisa ser aguardada
  const { id } = await params;

  // ARQUITETURA LIMPA:
  // A página (Server Component) apenas captura o ID da URL
  // e o entrega para o Formulário Inteligente (Client Component).
  // O formulário se encarrega de buscar os dados, validar e salvar.
  
  return (
    <div className="max-w-[1600px] mx-auto">
       <EditMemberForm memberId={id} />
    </div>
  );
}