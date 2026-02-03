import type { ApiKeyDTO } from "@shared/types";
import { Hash } from "lucide-react";
import { EmptyState } from "./EmptyState";
import { KeyTableRow } from "./KeyTableRow";

interface KeyTableProps {
  keys?: ApiKeyDTO[];
  onDelete?: (keyHash: string) => void;
}

export const KeyTable = ({ keys = [], onDelete }: KeyTableProps) => {
  return (
    <div className="w-full overflow-hidden bg-white">
      <div className="custom-scrollbar overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          {/* --- HEADER --- */}
          <thead className="border-b border-slate-200 bg-slate-50 text-xs font-medium tracking-wider text-slate-500 uppercase">
            <tr>
              <th className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <Hash className="h-3.5 w-3.5" /> Key Hash
                </div>
              </th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Usage (Session)</th>
              <th className="px-6 py-4 text-right">Total Req</th>
              <th className="px-6 py-4 text-right">Errors (Session)</th>
              <th className="px-6 py-4 text-right">Total Errors</th>
              <th className="px-6 py-4 whitespace-nowrap">Last Used</th>
              <th className="px-6 py-4 whitespace-nowrap">Created At</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>

          {/* --- BODY --- */}
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {keys.length === 0 ? (
              <EmptyState />
            ) : (
              keys.map((key, index) => (
                <KeyTableRow key={index} apiKey={key} onDelete={onDelete} />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      {keys.length > 0 && (
        <div className="flex justify-between border-t border-slate-200 bg-slate-50/50 px-6 py-3 text-xs text-slate-400">
          <span>Showing {keys.length} keys</span>
          <span>Pool Health: Good</span>
        </div>
      )}
    </div>
  );
};
