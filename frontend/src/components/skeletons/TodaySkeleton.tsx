import { Skeleton } from "@/components/ui/skeleton";

export function TodaySkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-[240px] rounded-[28px] bg-white/10" />
      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <Skeleton className="h-[360px] rounded-[24px] bg-white/10" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-28 rounded-[22px] bg-white/10" />
          ))}
        </div>
      </div>
    </div>
  );
}
