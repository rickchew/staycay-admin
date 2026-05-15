import { Plus, Search, Sparkles, Clock, CheckCircle2, AlertCircle, User, MoreHorizontal } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const cleaningTasks = [
  { id: 1, unit: "Studio B1", property: "Hillview Suites KL", type: "Post-checkout", booking: "BK-2026-00238", assignee: "Siti Rahimah", due: "Today, 12:00", notes: "Guest had pet — deep vacuum needed", status: "PENDING", urgent: true },
  { id: 2, unit: "Suite 203", property: "Hillview Suites KL", type: "Mid-stay", booking: "BK-2026-00239", assignee: null, due: "Today, 14:00", notes: "Requested fresh towels only", status: "PENDING", urgent: true },
  { id: 3, unit: "Deluxe A3", property: "Hillview Suites KL", type: "Post-checkout", booking: "BK-2026-00236", assignee: "Farah Aziz", due: "Today, 16:00", notes: null, status: "IN_PROGRESS", urgent: false },
  { id: 4, unit: "Suite 102", property: "Hillview Suites KL", type: "Deep clean", booking: null, assignee: "Siti Rahimah", due: "Tomorrow, 10:00", notes: "Monthly deep clean", status: "PENDING", urgent: false },
  { id: 5, unit: "Deluxe B2", property: "Hillview Suites KL", type: "Post-checkout", booking: "BK-2026-00234", assignee: "Farah Aziz", due: "Tomorrow, 12:00", notes: null, status: "PENDING", urgent: false },
  { id: 6, unit: "Suite 101", property: "Hillview Suites KL", type: "Post-checkout", booking: "BK-2026-00231", assignee: "Siti Rahimah", due: "Yesterday", notes: null, status: "DONE", urgent: false },
  { id: 7, unit: "Studio C3", property: "Hillview Suites KL", type: "Mid-stay", booking: "BK-2026-00230", assignee: "Farah Aziz", due: "Yesterday", notes: null, status: "DONE", urgent: false },
];

const columns = [
  { id: "PENDING", label: "Pending", icon: Clock, color: "text-amber-600", bg: "bg-amber-50 border-amber-200" },
  { id: "IN_PROGRESS", label: "In Progress", icon: Sparkles, color: "text-blue-600", bg: "bg-blue-50 border-blue-200" },
  { id: "DONE", label: "Done", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200" },
];

const typeColors: Record<string, string> = {
  "Post-checkout": "info",
  "Mid-stay": "secondary",
  "Deep clean": "warning",
};

export default function CleaningPage() {
  const grouped = columns.map((col) => ({
    ...col,
    tasks: cleaningTasks.filter((t) => t.status === col.id),
  }));

  return (
    <div>
      <Header title="Cleaning" />
      <div className="p-6 space-y-4">
        {/* Top bar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2">
            <div className="relative max-w-sm w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search tasks..." className="pl-8" />
            </div>
          </div>
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" /> Add Task
          </Button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-3">
          {grouped.map((col) => (
            <div key={col.id} className={`flex items-center gap-3 rounded-lg border p-3 ${col.bg}`}>
              <col.icon className={`h-5 w-5 ${col.color}`} />
              <div>
                <p className="text-xs text-muted-foreground">{col.label}</p>
                <p className="text-xl font-bold">{col.tasks.length}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Kanban board */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {grouped.map((col) => (
            <div key={col.id} className="space-y-3">
              <div className="flex items-center gap-2">
                <col.icon className={`h-4 w-4 ${col.color}`} />
                <h3 className="text-sm font-semibold">{col.label}</h3>
                <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-muted text-xs font-medium">
                  {col.tasks.length}
                </span>
              </div>

              <div className="space-y-2">
                {col.tasks.map((task) => (
                  <Card key={task.id} className={`${task.urgent ? "border-amber-300" : ""}`}>
                    <CardContent className="p-3 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-sm font-semibold">{task.unit}</span>
                            {task.urgent && (
                              <Badge variant="warning" className="text-[10px] py-0">Urgent</Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{task.property}</p>
                        </div>
                        <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </Button>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        <Badge variant={(typeColors[task.type] as "info" | "secondary" | "warning") ?? "outline"} className="text-[10px]">
                          {task.type}
                        </Badge>
                        {task.booking && (
                          <Badge variant="outline" className="text-[10px] font-mono">{task.booking}</Badge>
                        )}
                      </div>

                      {task.notes && (
                        <p className="text-xs text-muted-foreground bg-muted/50 rounded px-2 py-1">
                          {task.notes}
                        </p>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {task.assignee ?? <span className="text-amber-600 font-medium">Unassigned</span>}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{task.due}</span>
                        </div>
                      </div>

                      {col.id === "PENDING" && (
                        <Button size="sm" variant="outline" className="w-full text-xs h-7">
                          Start cleaning
                        </Button>
                      )}
                      {col.id === "IN_PROGRESS" && (
                        <Button size="sm" className="w-full text-xs h-7">
                          Mark done
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}

                {col.tasks.length === 0 && (
                  <div className="rounded-lg border border-dashed py-8 text-center">
                    <p className="text-xs text-muted-foreground">No tasks</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
