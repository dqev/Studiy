import { Construction } from 'lucide-react';

export function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
      <div className="bg-indigo-50 p-6 rounded-full">
        <Construction className="h-12 w-12 text-indigo-600" />
      </div>
      <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
      <p className="text-slate-500 max-w-md">
        This page is currently under development. Check back soon for updates!
      </p>
    </div>
  );
}
