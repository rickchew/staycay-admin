import { Plus, Search, MoreHorizontal, Shield, User } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const users = [
  { id: "usr_01", name: "Rick Chew", email: "rick@hillviewsuites.my", phone: "+60 12-345 6789", role: "MERCHANT_OWNER", merchant: "Hillview Suites KL", lastLogin: "10 May 2026, 09:14", isActive: true, initials: "RC" },
  { id: "usr_02", name: "Siti Rahimah", email: "siti@hillviewsuites.my", phone: "+60 13-456 7890", role: "MERCHANT_STAFF", merchant: "Hillview Suites KL", lastLogin: "10 May 2026, 07:30", isActive: true, initials: "SR" },
  { id: "usr_03", name: "Farah Aziz", email: "farah@hillviewsuites.my", phone: "+60 14-567 8901", role: "MERCHANT_STAFF", merchant: "Hillview Suites KL", lastLogin: "9 May 2026, 14:00", isActive: true, initials: "FA" },
  { id: "usr_04", name: "Danny Lim", email: "danny@setiasky.my", phone: "+60 16-789 0123", role: "MERCHANT_OWNER", merchant: "Setia Sky Residences", lastLogin: "8 May 2026, 11:20", isActive: true, initials: "DL" },
  { id: "usr_05", name: "Azlan Hashim", email: "azlan@marinacove.my", phone: "+60 17-890 1234", role: "MERCHANT_OWNER", merchant: "Marina Cove Penang", lastLogin: "1 May 2026, 10:00", isActive: false, initials: "AH" },
  { id: "usr_06", name: "Super Admin", email: "admin@staycay.my", phone: "+60 11-111 1111", role: "SUPER_ADMIN", merchant: "—", lastLogin: "10 May 2026, 08:00", isActive: true, initials: "SA" },
];

const roleConfig: Record<string, { label: string; variant: "success" | "info" | "warning" | "secondary" | "destructive"; icon: typeof Shield }> = {
  SUPER_ADMIN: { label: "Super Admin", variant: "destructive", icon: Shield },
  MERCHANT_OWNER: { label: "Owner", variant: "info", icon: User },
  MERCHANT_STAFF: { label: "Staff", variant: "secondary", icon: User },
  CUSTOMER: { label: "Customer", variant: "secondary", icon: User },
};

const avatarColors = ["bg-blue-600", "bg-emerald-600", "bg-violet-600", "bg-amber-600", "bg-pink-600", "bg-slate-600"];

export default function UsersPage() {
  return (
    <div>
      <Header title="Users" />
      <div className="p-6 space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search users..." className="pl-8" />
          </div>
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" /> Invite User
          </Button>
        </div>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Users (6)</TabsTrigger>
            <TabsTrigger value="owners">Owners (3)</TabsTrigger>
            <TabsTrigger value="staff">Staff (2)</TabsTrigger>
            <TabsTrigger value="admins">Admins (1)</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/30">
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">User</th>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Role</th>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Merchant</th>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Last Login</th>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                        <th className="px-4 py-3" />
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {users.map((u, i) => {
                        const role = roleConfig[u.role];
                        return (
                          <tr key={u.id} className="hover:bg-muted/20 transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback className={`${avatarColors[i % avatarColors.length]} text-white text-xs`}>
                                    {u.initials}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">{u.name}</div>
                                  <div className="text-xs text-muted-foreground">{u.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <Badge variant={role.variant}>{role.label}</Badge>
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">{u.merchant}</td>
                            <td className="px-4 py-3 text-xs text-muted-foreground">{u.lastLogin}</td>
                            <td className="px-4 py-3">
                              <Badge variant={u.isActive ? "success" : "secondary"}>
                                {u.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </td>
                            <td className="px-4 py-3">
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="border-t px-4 py-3">
                  <p className="text-sm text-muted-foreground">6 users total</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {["owners", "staff", "admins"].map((tab) => (
            <TabsContent key={tab} value={tab} className="mt-4">
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground text-sm">
                  Filtered view for &ldquo;{tab}&rdquo;
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
