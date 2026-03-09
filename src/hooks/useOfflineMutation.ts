"use client";

import { useMutation } from "convex/react";
import { enqueue, dequeueAll, clearQueue, isOnline } from "@/lib/offline";
import { useEffect, useCallback, useRef } from "react";
import type { FunctionReference } from "convex/server";

export function useOfflineMutation<T extends FunctionReference<"mutation">>(
  mutation: T
) {
  const mutate = useMutation(mutation);
  const replayingRef = useRef(false);

  const fnName = mutation.toString();

  const replay = useCallback(async () => {
    if (replayingRef.current) return;
    replayingRef.current = true;
    try {
      const queued = await dequeueAll(fnName);
      for (const item of queued) {
        await mutate(item.args as never);
      }
      if (queued.length > 0) {
        // Only clear entries we replayed, not the whole queue
        const remaining = await dequeueAll();
        if (remaining.length === 0) await clearQueue();
      }
    } finally {
      replayingRef.current = false;
    }
  }, [mutate, fnName]);

  useEffect(() => {
    const handleOnline = () => {
      replay();
    };
    window.addEventListener("online", handleOnline);
    // Replay on mount if already online
    if (isOnline()) replay();
    return () => window.removeEventListener("online", handleOnline);
  }, [replay]);

  const offlineMutate = useCallback(
    async (args: Record<string, unknown>) => {
      if (isOnline()) {
        return mutate(args as never);
      }
      await enqueue({ functionName: mutation.toString(), args });
    },
    [mutate, mutation]
  );

  return offlineMutate;
}
