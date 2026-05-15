import { Download, Search, CreditCard, ArrowUpRight, ArrowDownLeft, MoreHorizontal, Eye } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const payments = [
  { id: "pay_01", booking: "BK-2026-00241", guest: "Ahmad Fariz", gateway: "BILLPLZ", ref: "BPZ-20260510-0041", type: "FULL", amount: "RM 750.00", paidAt: "10 May 2026, 09:14", status: "SUCCESS" },
  { id: "pay_02", booking: "BK-2026-00240", guest: "Mei Ling Tan", gateway: "FIUU", ref: "FUU-20260510-0032", type: "FULL", amount: "RM 220.00", paidAt: "10 May 2026, 07:55", status: "SUCCESS" },
  { id: "pay_03", booking: "BK-2026-00239", guest: "Rajesh Kumar", gateway: "MANUAL", ref: "—", type: "DEPOSIT", amount: "RM 250.00", paidAt: "9 May 2026, 15:30", status: "SUCCESS" },
  { id: "pay_04", booking: "BK-2026-00238", guest: "Nur Aisyah", gateway: "BILLPLZ", ref: "BPZ-20260508-0028", type: "FULL", amount: "RM 360.00", paidAt: "8 May 2026, 12:01", status: "SUCCESS" },
  { id: "pay_05", booking: "BK-2026-00237", guest: "Lim Wei Jian", gateway: "STRIPE", ref: "pi_3MtwBwLkdIwHu7ix28a3tqPa", type: "FULL", amount: "RM 440.00", paidAt: "7 May 2026, 18:44", status: "REFUNDED" },
  { id: "pay_06", booking: "BK-2026-00235", guest: "David Ooi", gateway: "BILLPLZ", ref: "BPZ-20260510-0039", type: "FULL", amount: "RM 540.00", paidAt: "—", status: "PENDING" },
  { id: "pay_07", booking: "BK-2026-00234", guest: "Priya Nair", gateway: "FIUU", ref: "FUU-20260509-0029", type: "FULL", amount: "RM 440.00", paidAt: "9 May 2026, 10:15", status: "SUCCESS" },
  { id: "pay_08", booking: "BK-2026-00233", guest: "Hanim Zakaria", gateway: "MANUAL", ref: "—", type: "DEPOSIT", amount: "RM 100.00", paidAt: "8 May 2026, 11:00", status: "SUCCESS" },
];

const gatewayConfig: Record<string, { label: string; color: string }> = {
  BILLPLZ: { label: "Billplz", color: "bg-blue-100 text-blue-700" },
  FIUU: { label: "Fiuu", color: "bg-purple-100 text-purple-700" },
  STRIPE: { label: "Stripe", color: "bg-violet-100 text-violet-700" },
  MANUAL: { label: "Manual", color: "bg-slate-100 text-slate-700" },
};

const statusConfig: Record<string, { label: string; variant: "success" | "warning" | "secondary" | "destructive" }> = {
  SUCCESS: { label: "Success", variant: "success" },
  PENDING: { label: "Pending", variant: "warning" },
  FAILED: { label: "Failed", variant: "destructive" },
  REFUNDED: { label: "Refunded", variant: "secondary" },
};

export default function PaymentsPage() {
  return (
    <div>
      <Header title="Payments" />
      <div className="p-6 space-y-4">
        {/* Summary cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
                <ArrowUpRight className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Collected (May)</p>
                <p className="text-2xl font-bold">RM 14,280</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
                <CreditCard className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">RM 1,080</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50">
                <ArrowDownLeft className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Refunded (May)</p>
                <p className="text-2xl font-bold">RM 440</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search payments, booking ref..." className="pl-8" />
            </div>
            <Select>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="All gateways" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All gateways</SelectItem>
                <SelectItem value="billplz">Billplz</SelectItem>
                <SelectItem value="fiuu">Fiuu</SelectItem>
                <SelectItem value="stripe">Stripe</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" /> Export
          </Button>
        </div>

        {/* Table */}
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All (8)</TabsTrigger>
            <TabsTrigger value="success">Success (6)</TabsTrigger>
            <TabsTrigger value="pending">Pending (1)</TabsTrigger>
            <TabsTrigger value="refunded">Refunded (1)</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-4">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/30">
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Booking</th>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Guest</th>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Gateway</th>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Ref</th>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Type</th>
                        <th className="px-4 py-3 text-right font-medium text-muted-foreground">Amount</th>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Paid At</th>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                        <th className="px-4 py-3" />
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {payments.map((p) => {
                        const gw = gatewayConfig[p.gateway];
                        const st = statusConfig[p.status];
                        return (
                          <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                            <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{p.booking}</td>
                            <td className="px-4 py-3 font-medium">{p.guest}</td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${gw.color}`}>
                                {gw.label}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-mono text-xs text-muted-foreground max-w-[160px] truncate">{p.ref}</td>
                            <td className="px-4 py-3">
                              <Badge variant="outline">{p.type}</Badge>
                            </td>
                            <td className="px-4 py-3 text-right font-semibold">{p.amount}</td>
                            <td className="px-4 py-3 text-muted-foreground text-xs">{p.paidAt}</td>
                            <td className="px-4 py-3">
                              <Badge variant={st.variant}>{st.label}</Badge>
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
                <div className="flex items-center justify-between border-t px-4 py-3">
                  <p className="text-sm text-muted-foreground">Showing 8 of 8 transactions</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled>Previous</Button>
                    <Button variant="outline" size="sm" disabled>Next</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {["success", "pending", "refunded"].map((tab) => (
            <TabsContent key={tab} value={tab} className="mt-4">
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground text-sm">
                  Filtered view for &ldquo;{tab}&rdquo; payments
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
