"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background">
      <div className="text-center">
        <h2 className="mb-2 text-2xl font-semibold text-foreground">
          出错了
        </h2>
        <p className="text-muted-foreground">
          {error.message || "发生了意外错误"}
        </p>
      </div>
      <Button onClick={reset}>重试</Button>
    </div>
  );
}
