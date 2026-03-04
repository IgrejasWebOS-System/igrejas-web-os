import ChurchesView from "./view"; // FUSÃO TÉCNICA: Importação Default para corrigir erro de tipo

export default function SectorsAndChurchesPage() {
  // ARQUITETURA ATUALIZADA: 
  // A lógica de busca de dados (Supabase) e processamento de cargos 
  // foi migrada para dentro de 'view.tsx' (Client Component).
  // Isso permite filtros dinâmicos sem recarregar a página e resolve o erro de importação.
  
  return (
    // Container estrutural para limitar a largura em telas muito grandes
    <div className="max-w-[1600px] mx-auto">
       <ChurchesView />
    </div>
  );
}