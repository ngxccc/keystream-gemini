import { Hash } from "lucide-react";

export const EmptyState = () => (
  <tr>
    <td
      colSpan={5}
      className="bg-slate-50/30 px-6 py-12 text-center text-slate-400"
    >
      <div className="flex flex-col items-center justify-center gap-2">
        <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
          <Hash className="h-5 w-5 text-slate-300" />
        </div>
        <p className="font-medium">No API Keys Found</p>
        <p className="max-w-xs text-xs">
          Add your Google AI Studio keys using the form on the right to start
          processing requests.
        </p>
      </div>
    </td>
  </tr>
);
