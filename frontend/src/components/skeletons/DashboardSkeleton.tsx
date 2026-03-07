import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-white/8 bg-white/[0.02] p-6 sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
          <div className="space-y-4">
            <Skeleton className="h-7 w-40 bg-white/10" />
            <Skeleton className="h-12 w-full max-w-2xl bg-white/10" />
            <Skeleton className="h-5 w-full max-w-xl bg-white/10" />
            <div className="flex gap-3">
              <Skeleton className="h-11 w-44 bg-white/10" />
              <Skeleton className="h-11 w-36 bg-white/10" />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-28 rounded-2xl bg-white/10" />
              ))}
            </div>
          </div>
          <Skeleton className="min-h-[280px] rounded-[24px] bg-white/10" />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <Skeleton className="h-[320px] rounded-[24px] bg-white/10" />
        <Skeleton className="h-[320px] rounded-[24px] bg-white/10" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Skeleton className="h-[420px] rounded-[24px] bg-white/10" />
        <div className="space-y-4">
          <Skeleton className="h-[220px] rounded-[24px] bg-white/10" />
          <Skeleton className="h-[220px] rounded-[24px] bg-white/10" />
        </div>
      </div>
    </div>
  );
}
