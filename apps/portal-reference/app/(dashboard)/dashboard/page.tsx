import {
  TrendingUp,
  TrendingDown,
  CalendarCheck,
  BedDouble,
  Sparkles,
  CreditCard,
  ArrowRight,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const stats = [
  {
    label: "Active Bookings",
    value: "24",
    change: "+3 this week",
    trend: "up",
    icon: CalendarCheck,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    label: "Occupied Units",
    value: "18 / 32",
    change: "56% occupancy",
    trend: "up",
    icon: BedDouble,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    label: "Pending Cleaning",
    value: "5",
    change: "2 overdue",
    trend: "down",
    icon: Sparkles,
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    label: "Revenue (May)",
    value: "RM 14,280",
    change: "+12% vs Apr",
    trend: "up",
    icon: CreditCard,
    color: "text-violet-600",
    bg: "bg-violet-50",
  },
];

const recentBookings = [
  { ref: "BK-2026-00241", guest: "Ahmad Fariz", unit: "Suite 101", checkIn: "10 May", checkOut: "13 May", nights: 3, amount: "RM 750", status: "CONFIRMED" },
  { ref: "BK-2026-00240", guest: "Mei Ling Tan", unit: "Deluxe A2", checkIn: "10 May", checkOut: "11 May", nights: 1, amount: "RM 220", status: "CHECKED_IN" },
  { ref: "BK-2026-00239", guest: "Rajesh Kumar", unit: "Suite 203", checkIn: "9 May", checkOut: "12 May", nights: 3, amount: "RM 750", status: "CHECKED_IN" },
  { ref: "BK-2026-00238", guest: "Nur Aisyah", unit: "Studio B1", checkIn: "8 May", checkOut: "10 May", nights: 2, amount: "RM 360", status: "CHECKED_OUT" },
  { ref: "BK-2026-00237", guest: "Lim Wei Jian", unit: "Deluxe A1", checkIn: "7 May", checkOut: "9 May", nights: 2, amount: "RM 440", status: "CANCELLED" },
];

const cleaningQueue = [
  { unit: "Studio B1", type: "Post-checkout", assignee: "Siti Rahimah", due: "Today, 12:00", urgent: true },
  { unit: "Suite 203", type: "Mid-stay", assignee: "Unassigned", due: "Today, 14:00", urgent: true },
  { unit: "Deluxe A3", type: "Post-checkout", assignee: "Farah Aziz", due: "Today, 16:00", urgent: false },
  { unit: "Suite 102", type: "Deep clean", assignee: "Siti Rahimah", due: "Tomorrow, 10:00", urgent: false },
];

const bookingStatusConfig: Record<string, { label: string; variant: "success" | "info" | "warning" | "destructive" | "secondary" }> = {
  CONFIRMED: { label: "Confirmed", variant: "info" },
  CHECKED_IN: { label: "Checked In", variant: "success" },
  CHECKED_OUT: { label: "Checked Out", variant: "secondary" },
  PENDING: { label: "Pending", variant: "warning" },
  CANCELLED: { label: "Cancelled", variant: "destructive" },
};

export default function DashboardPage() {
  return (
    <div>
      <Header title="Dashboard" />
      <div className="p-6 space-y-6">

        {/* Stat Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((s) => (
            <Card key={s.label}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{s.label}</p>
                    <p className="text-2xl font-bold">{s.value}</p>
                    <p className={`flex items-center gap-1 text-xs ${s.trend === "up" ? "text-emerald-600" : "text-amber-600"}`}>
                      {s.trend === "up" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {s.change}
                    </p>
                  </div>
                  <div className={`rounded-lg p-2.5 ${s.bg}`}>
                    <s.icon className={`h-5 w-5 ${s.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Recent Bookings */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle className="text-base">Recent Bookings</CardTitle>
                  <CardDescription>Latest reservations across all properties</CardDescription>
                </div>
                <Button variant="ghost" size="sm" className="gap-1 text-xs">
                  View all <ArrowRight className="h-3 w-3" />
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {recentBookings.map((b) => {
                    const status = bookingStatusConfig[b.status];
                    return (
                      <div key={b.ref} className="flex items-center gap-4 px-6 py-3 hover:bg-muted/30 transition-colors">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{b.guest}</span>
                            <Badge variant={status.variant} className="text-[10px] py-0">{status.label}</Badge>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-muted-foreground">{b.ref}</span>
                            <span className="text-xs text-muted-foreground">·</span>
                            <span className="text-xs text-muted-foreground">{b.unit}</span>
                            <span className="text-xs text-muted-foreground">·</span>
                            <span className="text-xs text-muted-foreground">{b.checkIn} → {b.checkOut} ({b.nights}N)</span>
                          </div>
                        </div>
                        <span className="text-sm font-semibold shrink-0">{b.amount}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Occupancy */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Occupancy Today</CardTitle>
                <CardDescription>Hillview Suites KL</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: "Soho Suites", occupied: 6, total: 8 },
                  { label: "Deluxe Rooms", occupied: 5, total: 10 },
                  { label: "Studio Units", occupied: 7, total: 14 },
                ].map((row) => (
                  <div key={row.label} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium">{row.label}</span>
                      <span className="text-muted-foreground">{row.occupied}/{row.total}</span>
                    </div>
                    <Progress value={(row.occupied / row.total) * 100} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Cleaning Queue */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle className="text-base">Cleaning Queue</CardTitle>
                  <CardDescription>4 tasks pending</CardDescription>
                </div>
                <Button variant="ghost" size="sm" className="gap-1 text-xs">
                  View all <ArrowRight className="h-3 w-3" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-2 p-3 pt-0">
                {cleaningQueue.map((c) => (
                  <div key={c.unit} className={`flex items-start gap-3 rounded-md p-2.5 ${c.urgent ? "bg-amber-50" : "bg-muted/30"}`}>
                    <Sparkles className={`mt-0.5 h-4 w-4 shrink-0 ${c.urgent ? "text-amber-500" : "text-muted-foreground"}`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium leading-none">{c.unit}</p>
                      <p className="text-xs text-muted-foreground mt-1">{c.type} · {c.assignee}</p>
                      <p className="text-xs text-muted-foreground">{c.due}</p>
                    </div>
                    {c.urgent && <Badge variant="warning" className="text-[10px] shrink-0">Urgent</Badge>}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
