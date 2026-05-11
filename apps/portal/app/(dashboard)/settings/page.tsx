import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCard, Trash2, Plus, CheckCircle2 } from "lucide-react";

const gateways = [
  { id: "gw_01", gateway: "BILLPLZ", displayName: "Billplz FPX", isDefault: true, isSandbox: false, isActive: true, maskedKey: "bpz_live_...4f2a" },
  { id: "gw_02", gateway: "FIUU", displayName: "Fiuu Cards", isDefault: false, isSandbox: false, isActive: true, maskedKey: "fuu_live_...9c1d" },
  { id: "gw_03", gateway: "STRIPE", displayName: "Stripe (International)", isDefault: false, isSandbox: true, isActive: false, maskedKey: "sk_test_...7b3e" },
];

export default function SettingsPage() {
  return (
    <div>
      <Header title="Settings" />
      <div className="p-6">
        <Tabs defaultValue="merchant" className="space-y-4">
          <TabsList>
            <TabsTrigger value="merchant">Merchant</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          {/* Merchant settings */}
          <TabsContent value="merchant" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Business Information</CardTitle>
                <CardDescription>Manage your merchant profile and business details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Business Name</Label>
                    <Input defaultValue="Hillview Suites KL" />
                  </div>
                  <div className="space-y-2">
                    <Label>SSM Registration No.</Label>
                    <Input defaultValue="202101234567" />
                  </div>
                  <div className="space-y-2">
                    <Label>Business Email</Label>
                    <Input defaultValue="hello@hillviewsuites.my" type="email" />
                  </div>
                  <div className="space-y-2">
                    <Label>Business Phone</Label>
                    <Input defaultValue="+60 3-2181 1234" />
                  </div>
                  <div className="space-y-2">
                    <Label>Timezone</Label>
                    <Select defaultValue="asia-kl">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asia-kl">Asia/Kuala_Lumpur (UTC+8)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Currency</Label>
                    <Select defaultValue="myr">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="myr">MYR — Malaysian Ringgit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <Button>Save changes</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Booking Policy</CardTitle>
                <CardDescription>Configure booking rules for this merchant</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Maximum Stay (nights)</Label>
                    <Input defaultValue="365" type="number" />
                  </div>
                  <div className="space-y-2">
                    <Label>Minimum Stay (nights)</Label>
                    <Input defaultValue="1" type="number" />
                  </div>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Deposit confirms booking</Label>
                    <p className="text-sm text-muted-foreground">Allow bookings to be confirmed on partial payment (deposit)</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-trigger cleaning on checkout</Label>
                    <p className="text-sm text-muted-foreground">Automatically create a cleaning task when a booking is checked out</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex justify-end pt-2">
                  <Button>Save policy</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payment gateways */}
          <TabsContent value="payments" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold">Payment Gateways</h3>
                <p className="text-sm text-muted-foreground">Configure gateway credentials for this merchant</p>
              </div>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" /> Add Gateway
              </Button>
            </div>

            <div className="space-y-3">
              {gateways.map((gw) => (
                <Card key={gw.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted shrink-0">
                        <CreditCard className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm">{gw.displayName}</span>
                          {gw.isDefault && <Badge variant="info" className="text-[10px]">Default</Badge>}
                          {gw.isSandbox && <Badge variant="warning" className="text-[10px]">Sandbox</Badge>}
                          <Badge variant={gw.isActive ? "success" : "secondary"} className="text-[10px]">
                            {gw.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{gw.gateway} · API Key: {gw.maskedKey}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button variant="outline" size="sm">Edit</Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="border-dashed">
              <CardContent className="p-4 flex items-center gap-3 text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <p className="text-sm">Credentials are encrypted at rest. Only masked values are shown here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Notification Preferences</CardTitle>
                <CardDescription>Choose which events trigger notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: "New booking received", desc: "Notify when a new booking is confirmed", checked: true },
                  { label: "Payment received", desc: "Notify on successful payment", checked: true },
                  { label: "Cleaning task due", desc: "Remind staff 1 hour before cleaning is due", checked: true },
                  { label: "Booking cancellation", desc: "Notify on cancellation", checked: true },
                  { label: "No-show alert", desc: "Notify when a guest does not check in by 22:00", checked: false },
                  { label: "Low occupancy alert", desc: "Notify when occupancy drops below 20%", checked: false },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>{item.label}</Label>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                    <Switch defaultChecked={item.checked} />
                  </div>
                ))}
                <div className="flex justify-end pt-2">
                  <Button>Save preferences</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security */}
          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Change Password</CardTitle>
                <CardDescription>Update your account password</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Current password</Label>
                  <Input type="password" placeholder="••••••••" />
                </div>
                <div className="space-y-2">
                  <Label>New password</Label>
                  <Input type="password" placeholder="••••••••" />
                </div>
                <div className="space-y-2">
                  <Label>Confirm new password</Label>
                  <Input type="password" placeholder="••••••••" />
                </div>
                <div className="flex justify-end">
                  <Button>Update password</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Active Sessions</CardTitle>
                <CardDescription>Devices currently logged into your account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { device: "MacBook Pro — Chrome", location: "Kuala Lumpur, MY", time: "Current session", current: true },
                  { device: "iPhone 15 — Safari", location: "Kuala Lumpur, MY", time: "2 hours ago", current: false },
                ].map((s) => (
                  <div key={s.device} className="flex items-center justify-between py-1">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{s.device}</span>
                        {s.current && <Badge variant="success" className="text-[10px]">Current</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground">{s.location} · {s.time}</p>
                    </div>
                    {!s.current && (
                      <Button variant="outline" size="sm" className="text-destructive border-destructive hover:bg-destructive hover:text-white">
                        Revoke
                      </Button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
