import { ShieldCheck, ShieldX } from 'lucide-react';

export function VerifiedBadge({ verified }: { verified: boolean }) {
  if (verified) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-agri-50 text-agri-700 border border-agri-200">
        <ShieldCheck className="w-3 h-3" />
        Verified
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-50 text-gray-500 border border-gray-200">
      <ShieldX className="w-3 h-3" />
      Unverified
    </span>
  );
}
