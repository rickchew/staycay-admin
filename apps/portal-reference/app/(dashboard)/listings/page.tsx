import { Plus, Search, Eye, MoreHorizontal, BedDouble, CheckCircle2, XCircle } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const listings = [
  {
    id: "lst_01",
    name: "Soho Suite",
    property: "Hillview Suites KL",
    type: "Suite",
    quantity: 8,
    isSingle: false,
    dailyRate: "RM 250",
    depositAmount: "RM 100",
    units: ["Suite 101", "Suite 102", "Suite 103", "Suite 104", "Suite 105", "Suite 201", "Suite 202", "Suite 203"],
    occupied: 6,
    isActive: true,
  },
  {
    id: "lst_02",
    name: "Deluxe Room",
    property: "Hillview Suites KL",
    type: "Room",
    quantity: 10,
    isSingle: false,
    dailyRate: "RM 220",
    depositAmount: "RM 80",
    units: ["Deluxe A1", "Deluxe A2", "Deluxe A3", "Deluxe A4", "Deluxe A5", "Deluxe B1", "Deluxe B2", "Deluxe B3", "Deluxe B4", "Deluxe B5"],
    occupied: 5,
    isActive: true,
  },
  {
    id: "lst_03",
    name: "Studio Unit",
    property: "Hillview Suites KL",
    type: "Studio",
    quantity: 14,
    isSingle: false,
    dailyRate: "RM 180",
    depositAmount: null,
    units: ["Studio B1", "Studio B2", "Studio B3", "Studio B4", "Studio B5", "Studio B6", "Studio B7", "Studio C1", "Studio C2", "Studio C3", "Studio C4", "Studio C5", "Studio C6", "Studio C7"],
    occupied: 7,
    isActive: true,
  },
  {
    id: "lst_04",
    name: "Sky Loft",
    property: "Setia Sky Residences",
    type: "Loft",
    quantity: 1,
    isSingle: true,
    dailyRate: "RM 480",
    depositAmount: "RM 200",
    units: ["Sky Loft"],
    occupied: 0,
    isActive: true,
  },
  {
    id: "lst_05",
    name: "Garden Studio",
    property: "Setia Sky Residences",
    type: "Studio",
    quantity: 15,
    isSingle: false,
    dailyRate: "RM 190",
    depositAmount: null,
    units: [],
    occupied: 9,
    isActive: true,
  },
  {
    id: "lst_06",
    name: "Beachview Room",
    property: "Marina Cove Penang",
    type: "Room",
    quantity: 8,
    isSingle: false,
    dailyRate: "RM 270",
    depositAmount: "RM 100",
    units: [],
    occupied: 3,
    isActive: false,
  },
];

export default function ListingsPage() {
  return (
    <div>
      <Header title="Listings" />
      <div className="p-6 space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search listings..." className="pl-8" />
            </div>
            <Select>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="All properties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All properties</SelectItem>
                <SelectItem value="hillview">Hillview Suites KL</SelectItem>
                <SelectItem value="setia">Setia Sky Residences</SelectItem>
                <SelectItem value="marina">Marina Cove Penang</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" /> Add Listing
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Listing</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Property</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Type</th>
                    <th className="px-4 py-3 text-center font-medium text-muted-foreground">Units</th>
                    <th className="px-4 py-3 text-center font-medium text-muted-foreground">Occupied</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Daily Rate</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Deposit</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {listings.map((l) => (
                    <tr key={l.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted shrink-0">
                            <BedDouble className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div>
                            <div className="font-medium">{l.name}</div>
                            {l.isSingle && <div className="text-xs text-muted-foreground">Single unit</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{l.property}</td>
                      <td className="px-4 py-3">
                        <Badge variant="outline">{l.type}</Badge>
                      </td>
                      <td className="px-4 py-3 text-center font-medium">{l.quantity}</td>
                      <td className="px-4 py-3 text-center">
                        {l.isSingle ? (
                          l.occupied > 0 ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 mx-auto" />
                          ) : (
                            <XCircle className="h-4 w-4 text-muted-foreground mx-auto" />
                          )
                        ) : (
                          <span className={`font-medium ${l.occupied >= l.quantity ? "text-amber-600" : "text-emerald-600"}`}>
                            {l.occupied}/{l.quantity}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold">{l.dailyRate}</td>
                      <td className="px-4 py-3 text-right text-muted-foreground">{l.depositAmount ?? "—"}</td>
                      <td className="px-4 py-3">
                        <Badge variant={l.isActive ? "success" : "secondary"}>
                          {l.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between border-t px-4 py-3">
              <p className="text-sm text-muted-foreground">6 listings · 46 total units</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled>Previous</Button>
                <Button variant="outline" size="sm">Next</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
