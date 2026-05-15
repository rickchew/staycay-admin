import { Plus, Search, Filter, Download, Eye, MoreHorizontal } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const bookings = [
  { ref: "BK-2026-00241", guest: "Ahmad Fariz", phone: "+60 12-345 6789", unit: "Suite 101", property: "Hillview Suites KL", checkIn: "2026-05-10", checkOut: "2026-05-13", nights: 3, dailyRate: "RM 250", total: "RM 750", payStatus: "PAID", status: "CONFIRMED" },
  { ref: "BK-2026-00240", guest: "Mei Ling Tan", phone: "+60 17-234 5678", unit: "Deluxe A2", property: "Hillview Suites KL", checkIn: "2026-05-10", checkOut: "2026-05-11", nights: 1, dailyRate: "RM 220", total: "RM 220", payStatus: "PAID", status: "CHECKED_IN" },
  { ref: "BK-2026-00239", guest: "Rajesh Kumar", phone: "+60 16-789 0123", unit: "Suite 203", property: "Hillview Suites KL", checkIn: "2026-05-09", checkOut: "2026-05-12", nights: 3, dailyRate: "RM 250", total: "RM 750", payStatus: "PARTIAL", status: "CHECKED_IN" },
  { ref: "BK-2026-00238", guest: "Nur Aisyah", phone: "+60 11-456 7890", unit: "Studio B1", property: "Hillview Suites KL", checkIn: "2026-05-08", checkOut: "2026-05-10", nights: 2, dailyRate: "RM 180", total: "RM 360", payStatus: "PAID", status: "CHECKED_OUT" },
  { ref: "BK-2026-00237", guest: "Lim Wei Jian", phone: "+60 19-321 0987", unit: "Deluxe A1", property: "Hillview Suites KL", checkIn: "2026-05-07", checkOut: "2026-05-09", nights: 2, dailyRate: "RM 220", total: "RM 440", payStatus: "REFUNDED", status: "CANCELLED" },
  { ref: "BK-2026-00236", guest: "Siti Hajar", phone: "+60 13-654 3210", unit: "Suite 102", property: "Hillview Suites KL", checkIn: "2026-05-06", checkOut: "2026-05-08", nights: 2, dailyRate: "RM 250", total: "RM 500", payStatus: "PAID", status: "CHECKED_OUT" },
  { ref: "BK-2026-00235", guest: "David Ooi", phone: "+60 18-900 1234", unit: "Studio B3", property: "Hillview Suites KL", checkIn: "2026-05-12", checkOut: "2026-05-15", nights: 3, dailyRate: "RM 180", total: "RM 540", payStatus: "UNPAID", status: "PENDING" },
  { ref: "BK-2026-00234", guest: "Priya Nair", phone: "+60 14-222 3344", unit: "Deluxe A4", property: "Hillview Suites KL", checkIn: "2026-05-14", checkOut: "2026-05-16", nights: 2, dailyRate: "RM 220", total: "RM 440", payStatus: "PAID", status: "CONFIRMED" },
];

const bookingStatusConfig: Record<string, { label: string; variant: "success" | "info" | "warning" | "destructive" | "secondary" }> = {
  CONFIRMED: { label: "Confirmed", variant: "info" },
  CHECKED_IN: { label: "Checked In", variant: "success" },
  CHECKED_OUT: { label: "Checked Out", variant: "secondary" },
  PENDING: { label: "Pending", variant: "warning" },
  CANCELLED: { label: "Cancelled", variant: "destructive" },
  NO_SHOW: { label: "No Show", variant: "destructive" },
};

const payStatusConfig: Record<string, { label: string; variant: "success" | "info" | "warning" | "destructive" | "secondary" }> = {
  PAID: { label: "Paid", variant: "success" },
  PARTIAL: { label: "Partial", variant: "warning" },
  UNPAID: { label: "Unpaid", variant: "destructive" },
  REFUNDED: { label: "Refunded", variant: "secondary" },
};

export default function BookingsPage() {
  return (
    <div>
      <Header title="Bookings" />
      <div className="p-6 space-y-4">
        {/* Top bar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search bookings, guests..." className="pl-8" />
            </div>
            <Select>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All properties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All properties</SelectItem>
                <SelectItem value="hillview">Hillview Suites KL</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" /> Export
            </Button>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" /> New Booking
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All (8)</TabsTrigger>
            <TabsTrigger value="active">Active (2)</TabsTrigger>
            <TabsTrigger value="confirmed">Confirmed (2)</TabsTrigger>
            <TabsTrigger value="pending">Pending (1)</TabsTrigger>
            <TabsTrigger value="past">Past (3)</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/30">
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Ref</th>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Guest</th>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Unit</th>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Dates</th>
                        <th className="px-4 py-3 text-right font-medium text-muted-foreground">Amount</th>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Payment</th>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                        <th className="px-4 py-3" />
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {bookings.map((b) => {
                        const bStatus = bookingStatusConfig[b.status];
                        const pStatus = payStatusConfig[b.payStatus];
                        return (
                          <tr key={b.ref} className="hover:bg-muted/20 transition-colors">
                            <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{b.ref}</td>
                            <td className="px-4 py-3">
                              <div className="font-medium">{b.guest}</div>
                              <div className="text-xs text-muted-foreground">{b.phone}</div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="font-medium">{b.unit}</div>
                              <div className="text-xs text-muted-foreground">{b.property}</div>
                            </td>
                            <td className="px-4 py-3">
                              <div>{b.checkIn} → {b.checkOut}</div>
                              <div className="text-xs text-muted-foreground">{b.nights} night{b.nights > 1 ? "s" : ""} · {b.dailyRate}/night</div>
                            </td>
                            <td className="px-4 py-3 text-right font-semibold">{b.total}</td>
                            <td className="px-4 py-3">
                              <Badge variant={pStatus.variant}>{pStatus.label}</Badge>
                            </td>
                            <td className="px-4 py-3">
                              <Badge variant={bStatus.variant}>{bStatus.label}</Badge>
                            </td>
                            <td className="px-4 py-3">
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {/* Pagination */}
                <div className="flex items-center justify-between border-t px-4 py-3">
                  <p className="text-sm text-muted-foreground">Showing 8 of 241 bookings</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled>Previous</Button>
                    <Button variant="outline" size="sm">Next</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {["active", "confirmed", "pending", "past"].map((tab) => (
            <TabsContent key={tab} value={tab} className="mt-4">
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground text-sm">
                  Filtered view for &ldquo;{tab}&rdquo; bookings
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
