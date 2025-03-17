import { cn } from "@/lib/utils";

export interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-gray-200",
        className
      )}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-lg border p-4 shadow-sm">
      <div className="space-y-3">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex justify-between pt-2">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
        </div>
      </div>
    </div>
  );
}

export function MessageSkeleton({ isMe = false }: { isMe?: boolean }) {
  return (
    <div className={`flex w-full ${isMe ? "justify-end" : "justify-start"}`}>
      <div className="max-w-[80%] space-y-2">
        <Skeleton className={`h-10 w-full ${isMe ? "ml-auto" : "mr-auto"}`} />
        <Skeleton className={`h-3 w-16 ${isMe ? "ml-auto" : "mr-auto"}`} />
      </div>
    </div>
  );
}