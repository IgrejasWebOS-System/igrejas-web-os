"use client";

import { useState } from "react";
import { Search, Loader2, History, AlertCircle } from "lucide-react";
import { getMemberByMatriculaWithTimelineAction } from "@/app/dashboard/membros/actions";
import MemberTimelineModal from "@/components/dashboard/MemberTimelineModal";
import DashboardCardBase from "./DashboardCardBase"; // <-- Import do Molde Oficial

export default function QuickTimelineSearch() {
  const [matriculaInput, setMatriculaInput] = useState("");
  const [searchError, setSearchError] = useState("");
  const [isSearchingTimeline, setIsSearchingTimeline] = useState(false);

  const [isTimelineOpen, setIsTimelineOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [selectedMemberName, setSelectedMemberName] = useState("");

  const handleSearchTimeline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matriculaInput.trim()) return;

    setIsSearchingTimeline(true);
    setSearchError("");

    const result = await getMemberByMatriculaWithTimelineAction(matriculaInput.trim());

    if (!result.success) {
      setSearchError(result.message || "Matrícula não encontrada no sistema.");
    } else if (result.data && result.data.profile) {
      setSelectedMemberId(result.data.profile.id);
      setSelectedMemberName(result.data.profile.full_name || result.data.profile.name);
      setMatriculaInput("");
      setIsTimelineOpen(true);
    }
    setIsSearchingTimeline(false);
  };

  return (
    <>
      <DashboardCardBase
        icon={<History className="w-7 h-7" />}
        title="HISTÓRICO MEMBROS"
        subtitle="Busca por matrícula"
      >
        <form onSubmit={handleSearchTimeline} className="relative mt-2">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Ex: 52591"
                value={matriculaInput}
                onChange={(e) => {
                  setMatriculaInput(e.target.value);
                  if (searchError) setSearchError("");
                }}
                className={`w-full bg-neutral-950 border rounded-xl py-3 px-4 text-sm text-white focus:outline-none transition-colors ${searchError ? 'border-red-500 focus:border-red-500' : 'border-neutral-800 focus:border-emerald-500'}`}
              />
            </div>
            <button
              type="submit"
              disabled={isSearchingTimeline || !matriculaInput.trim()}
              className="bg-emerald-600 hover:bg-emerald-500 text-white p-3 rounded-xl transition-colors disabled:opacity-50 shadow-md shadow-emerald-900/20"
              title="Consultar"
            >
              {isSearchingTimeline ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
            </button>
          </div>
          {searchError && (
            <span className="absolute -bottom-6 left-1 text-red-500 text-xs font-bold flex items-center gap-1">
              <AlertCircle className="w-4 h-4" /> {searchError}
            </span>
          )}
        </form>
      </DashboardCardBase>

      <MemberTimelineModal
        isOpen={isTimelineOpen}
        onClose={() => setIsTimelineOpen(false)}
        memberId={selectedMemberId}
        memberName={selectedMemberName}
      />
    </>
  );
}