import { Skeleton } from '@/components/ui/skeleton';

export default function ModelPageLoading() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center h-14 gap-2.5">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <div className="text-left">
              <Skeleton className="h-4 w-28 mb-1" />
              <Skeleton className="h-2.5 w-20" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 mb-6">
          <Skeleton className="h-3 w-10" />
          <Skeleton className="h-3 w-1" />
          <Skeleton className="h-3 w-14" />
          <Skeleton className="h-3 w-1" />
          <Skeleton className="h-3 w-24" />
        </div>

        {/* Title Area */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <Skeleton className="h-9 w-64" />
            <Skeleton className="h-5 w-14 rounded" />
            <Skeleton className="h-5 w-20 rounded" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-4 w-full max-w-2xl mb-1.5" />
          <Skeleton className="h-4 w-3/4 max-w-lg mb-3" />
          <Skeleton className="h-3 w-80" />
        </div>

        {/* How to Use Card */}
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5 mb-8">
          <Skeleton className="h-4 w-44 mb-4" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex items-start gap-2">
              <Skeleton className="h-5 w-5 rounded-full shrink-0" />
              <Skeleton className="h-3 flex-1" />
            </div>
            <div className="flex items-start gap-2">
              <Skeleton className="h-5 w-5 rounded-full shrink-0" />
              <Skeleton className="h-3 flex-1" />
            </div>
            <div className="flex items-start gap-2">
              <Skeleton className="h-5 w-5 rounded-full shrink-0" />
              <Skeleton className="h-3 flex-1" />
            </div>
          </div>
        </div>

        {/* System Prompt Section */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-7 w-20 rounded-md" />
          </div>
          <div className="rounded-xl border border-border p-4 space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-11/12" />
            <Skeleton className="h-3 w-4/5" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-3 w-5/6" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
            <Skeleton className="h-3 w-7/8" />
            <Skeleton className="h-3 w-4/5" />
          </div>
        </section>

        {/* Tips Card */}
        <div className="rounded-xl border border-border p-5 mb-8">
          <Skeleton className="h-4 w-24 mb-3" />
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-2">
                <Skeleton className="h-3 w-3 rounded-full mt-0.5 shrink-0" />
                <Skeleton className="h-3 flex-1" />
              </div>
            ))}
          </div>
        </div>

        {/* Sources Card */}
        <div className="rounded-xl border border-border p-5 mb-8">
          <Skeleton className="h-4 w-40 mb-1" />
          <Skeleton className="h-3 w-64 mb-4" />
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                <div className="flex-1 min-w-0 space-y-1.5">
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="h-2.5 w-16" />
                </div>
                <Skeleton className="h-3 w-8 shrink-0" />
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="flex justify-center pt-6 pb-4 border-t border-border">
          <Skeleton className="h-9 w-52 rounded-lg" />
        </div>
      </main>
    </div>
  );
}
