'use client';

import { Fragment } from 'react';
import { Mail, MapPin, Phone, SquarePen } from 'lucide-react';
import {
  Toolbar,
  ToolbarActions,
  ToolbarHeading,
} from '@/layouts/demo1/components/toolbar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Container } from '@/components/common/container';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '@/components/ui/table';
import { CURRENT_MERCHANT, MOCK_PROPERTIES, getMerchantStats } from '@/lib/mock';

export default function SettingsProfilePage() {
  const merchant = CURRENT_MERCHANT;
  const properties = MOCK_PROPERTIES.filter((p) => p.merchantId === merchant.id);
  const stats = getMerchantStats(merchant.id);

  const InfoRow = ({
    label,
    value,
  }: {
    label: string;
    value: React.ReactNode;
  }) => (
    <TableRow>
      <TableCell className="min-w-56 text-secondary-foreground font-normal">
        {label}
      </TableCell>
      <TableCell className="text-foreground font-normal">{value}</TableCell>
      <TableCell className="min-w-16 text-center">
        <Button variant="ghost" mode="icon">
          <SquarePen size={16} className="text-blue-500" />
        </Button>
      </TableCell>
    </TableRow>
  );

  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="Merchant Profile"
            description="Your business details and operational settings"
          />
          <ToolbarActions>
            <Button>
              <SquarePen />
              Edit
            </Button>
          </ToolbarActions>
        </Toolbar>
      </Container>
      <Container>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 lg:gap-7.5">
          <div className="col-span-2 flex flex-col gap-5 lg:gap-7.5">
            <Card>
              <CardHeader>
                <CardTitle>General info</CardTitle>
                <Badge
                  size="sm"
                  variant={merchant.isActive ? 'success' : 'secondary'}
                  appearance="light"
                >
                  {merchant.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </CardHeader>
              <CardContent className="p-0">
                <Table className="text-sm text-muted-foreground">
                  <TableBody>
                    <InfoRow label="Business name" value={merchant.name} />
                    <InfoRow label="Slug" value={merchant.slug} />
                    <InfoRow
                      label="Contact email"
                      value={
                        <span className="inline-flex items-center gap-1.5">
                          <Mail size={14} className="text-muted-foreground" />
                          {merchant.email}
                        </span>
                      }
                    />
                    <InfoRow
                      label="Phone"
                      value={
                        <span className="inline-flex items-center gap-1.5">
                          <Phone size={14} className="text-muted-foreground" />
                          {merchant.phone}
                        </span>
                      }
                    />
                    <InfoRow
                      label="City"
                      value={
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin size={14} className="text-muted-foreground" />
                          {merchant.city}
                        </span>
                      }
                    />
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Booking settings</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 p-5">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <Label className="text-sm font-medium">
                      Accept manual payments
                    </Label>
                    <span className="text-xs text-muted-foreground">
                      Allow staff to record cash or bank-transfer payments
                    </span>
                  </div>
                  <Switch defaultChecked size="sm" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <Label className="text-sm font-medium">
                      Deposit confirms booking
                    </Label>
                    <span className="text-xs text-muted-foreground">
                      Auto-confirm bookings on partial payment (deposit)
                    </span>
                  </div>
                  <Switch size="sm" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="col-span-1 flex flex-col gap-5 lg:gap-7.5">
            <Card>
              <CardHeader>
                <CardTitle>Quick stats</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 p-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Properties
                  </span>
                  <span className="text-sm font-medium">
                    {properties.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Members</span>
                  <span className="text-sm font-medium">
                    {stats.membersCount}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Joined</span>
                  <span className="text-sm font-medium">
                    {merchant.createdAt.slice(0, 10)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Container>
    </Fragment>
  );
}
