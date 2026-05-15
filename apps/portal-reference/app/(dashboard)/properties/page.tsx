import { Plus, MapPin, BedDouble, MoreHorizontal, Building2, TrendingUp } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const properties = [
  {
    id: "prop_01",
    name: "Hillview Suites KL",
    address: "No. 12, Jalan Hillview, Bukit Bintang, 55100 Kuala Lumpur",
    city: "Kuala Lumpur",
    listings: 3,
    totalUnits: 32,
    activeBookings: 18,
    occupancy: 56,
    monthlyRevenue: "RM 14,280",
    isActive: true,
    image: "HV",
    color: "bg-blue-600",
  },
  {
    id: "prop_02",
    name: "Setia Sky Residences",
    address: "Level 8, Tower B, Jalan Duta, 50480 Kuala Lumpur",
    city: "Kuala Lumpur",
    listings: 2,
    totalUnits: 16,
    activeBookings: 9,
    occupancy: 56,
    monthlyRevenue: "RM 6,840",
    isActive: true,
    image: "SS",
    color: "bg-emerald-600",
  },
  {
    id: "prop_03",
    name: "Marina Cove Penang",
    address: "10, Jalan Marina, Georgetown, 10050 Penang",
    city: "Penang",
    listings: 1,
    totalUnits: 8,
    activeBookings: 3,
    occupancy: 38,
    monthlyRevenue: "RM 2,160",
    isActive: false,
    image: "MC",
    color: "bg-violet-600",
  },
];

export default function PropertiesPage() {
  return (
    <div>
      <Header title="Properties" />
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              {properties.length} properties · {properties.reduce((a, p) => a + p.totalUnits, 0)} total units
            </p>
          </div>
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" /> Add Property
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {properties.map((p) => (
            <Card key={p.id} className="overflow-hidden">
              {/* Header banner */}
              <div className={`h-2 ${p.color}`} />
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${p.color} text-white text-sm font-bold`}>
                      {p.image}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-sm leading-tight">{p.name}</h3>
                        <Badge variant={p.isActive ? "success" : "secondary"} className="text-[10px] py-0">
                          {p.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{p.city}</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mt-2">{p.address}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Stats row */}
                <div className="grid grid-cols-3 divide-x rounded-lg border bg-muted/30 text-center">
                  <div className="py-2">
                    <p className="text-xs text-muted-foreground">Listings</p>
                    <p className="text-lg font-bold">{p.listings}</p>
                  </div>
                  <div className="py-2">
                    <p className="text-xs text-muted-foreground">Units</p>
                    <p className="text-lg font-bold">{p.totalUnits}</p>
                  </div>
                  <div className="py-2">
                    <p className="text-xs text-muted-foreground">Bookings</p>
                    <p className="text-lg font-bold">{p.activeBookings}</p>
                  </div>
                </div>

                {/* Occupancy */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Occupancy today</span>
                    <span className="font-medium">{p.occupancy}%</span>
                  </div>
                  <Progress value={p.occupancy} className="h-2" />
                </div>

                {/* Revenue */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">May revenue</p>
                    <p className="text-base font-bold">{p.monthlyRevenue}</p>
                  </div>
                  <Button variant="outline" size="sm" className="text-xs">View details</Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Add property CTA */}
          <Card className="border-dashed flex items-center justify-center min-h-[280px] hover:bg-muted/20 cursor-pointer transition-colors">
            <div className="text-center space-y-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted mx-auto">
                <Plus className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">Add new property</p>
              <p className="text-xs text-muted-foreground">Expand your portfolio</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
