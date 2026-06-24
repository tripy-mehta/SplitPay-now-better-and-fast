export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="text-center py-16 px-6 border border-dashed border-line rounded-lg">
      <p className="font-display text-xl mb-2">{title}</p>
      <p className="text-ink/55 text-sm max-w-sm mx-auto mb-5">{description}</p>
      {action}
    </div>
  );
}

export function LoadingRows({ count = 3 }: { count?: number }) {
  return (
    <div className="divide-y divide-line">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center justify-between py-4 animate-pulse">
          <div className="space-y-2">
            <div className="h-3 w-32 bg-ink/10 rounded-sm" />
            <div className="h-2.5 w-20 bg-ink/5 rounded-sm" />
          </div>
          <div className="h-3 w-16 bg-ink/10 rounded-sm" />
        </div>
      ))}
    </div>
  );
}

export function InlineError({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="bg-owe-100 border border-owe-400/30 rounded-md p-4 text-sm flex items-center justify-between gap-4">
      <span className="text-owe-600">{message}</span>
      {onRetry && (
        <button
          onClick={onRetry}
          className="shrink-0 text-xs font-medium underline underline-offset-2 text-owe-600 hover:text-owe-400 focus-ring rounded-sm"
        >
          Try again
        </button>
      )}
    </div>
  );
}
