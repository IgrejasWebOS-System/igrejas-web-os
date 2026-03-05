import ChurchesView from "./view"; // FUSÃO TÉCNICA: Importação Default para corrigir erro de tipo
import { getUserContext } from "@/utils/auth-context";

export default async function SectorsAndChurchesPage() {
  // ARQUITETURA ATUALIZADA: 
  // A lógica de busca de dados (Supabase) e processamento de cargos 
  // foi migrada para dentro de 'view.tsx' (Client Component).
  // Isso permite filtros dinâmicos sem recarregar a página e resolve o erro de importação.
  
  // 1. CHAMA O GUARDA DE TRÂNSITO NO SERVIDOR (Máxima Segurança)
  const userContext = await getUserContext();
  const role = userContext?.role || 'GUEST';

  return (
    // Container estrutural para limitar a largura em telas muito grandes
    <div className="max-w-[1600px] mx-auto">
       {/* 2. PASSA O CRACHÁ PARA O SEU COMPONENTE VISUAL EXISTENTE */}
       <ChurchesView userRole={role} />
    </div>
  );
}