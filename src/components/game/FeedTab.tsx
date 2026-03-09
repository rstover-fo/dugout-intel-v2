"use client";

import { Card, CardContent } from "@/components/ui/card";

interface FeedTabProps {
  alerts: { message: string; severity: string; ts: number }[];
}

export function FeedTab({ alerts }: FeedTabProps) {
  return (
    <div className="space-y-2">
      <div className="text-xs font-medium text-muted-foreground">Live Alerts ({alerts.length})</div>
      {alerts.length === 0 && (
        <p className="text-xs text-muted-foreground">No alerts yet. Pitch data triggers alerts automatically.</p>
      )}
      <div className="max-h-96 space-y-1 overflow-y-auto">
        {alerts.map((alert, i) => {
          const borderColor =
            alert.severity === "danger"
              ? "border-l-red-500"
              : alert.severity === "warning"
                ? "border-l-yellow-500"
                : "border-l-blue-500";
          return (
            <Card key={i} className={`border-l-4 ${borderColor}`}>
              <CardContent className="p-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs">{alert.message}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(alert.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
