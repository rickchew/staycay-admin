'use client';

import { Fragment, use } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Building2, MapPin, Plus, Wifi } from 'lucide-react';
import {
  Toolbar,
  ToolbarActions,
  ToolbarHeading,
} from '@/layouts/demo1/components/toolbar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Container } from '@/components/common/container';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  MOCK_BOOKINGS,
  MOCK_BUILDINGS,
  MOCK_LISTINGS,
  MOCK_PROPERTIES,
} from '@/lib/mock';

export default function BuildingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const building = MOCK_BUILDINGS.find((b) => b.id === id);
  if (!building) notFound();

  const properties = MOCK_PROPERTIES.filter((p) => p.buildingId === id);
  const listings = MOCK_LISTINGS.filter((l) =>
    properties.some((p) => p.id === l.propertyId),
  );
  const totalUnits = listings.reduce((s, l) => s + l.quantity, 0);

  // Aggregate per merchant (owner)
  const byOwner = properties.reduce<
    Record<
      string,
      {
        merchantId: string;
        merchantName: string;
        properties: typeof properties;
        listings: typeof listings;
        units: number;
      }
    >
  >((acc, p) => {
    if (!acc[p.merchantId]) {
      acc[p.merchantId] = {
        merchantId: p.merchantId,
        merchantName: p.merchantName,
        properties: [],
        listings: [],
        units: 0,
      };
    }
    acc[p.merchantId].properties.push(p);
    const ownerListings = listings.filter((l) => l.propertyId === p.id);
    acc[p.merchantId].listings.push(...ownerListings);
    acc[p.merchantId].units += ownerListings.reduce((s, l) => s + l.quantity, 0);
    return acc;
  }, {});
  const owners = Object.values(byOwner);

  // Activity — recent bookings from any listing in this building
  const buildingListingIds = new Set(listings.map((l) => l.id));
  const recentBookings = MOCK_BOOKINGS.filter((b) =>
    buildingListingIds.has(b.listingId),
  )
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 6);

  const occupiedNow = MOCK_BOOKINGS.filter(
    (b) => buildingListingIds.has(b.listingId) && b.status === 'CHECKED_IN',
  ).length;

  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title={building.name}
            description={
              <span className="inline-flex items-center gap-1.5">
                <MapPin size={14} />
                {building.address}, {building.city}, {building.state}{' '}
                {building.postcode}
              </span>
            }
          />
          <ToolbarActions>
            <Button variant="outline" asChild>
              <Link href="/buildings">
                <ArrowLeft />
                All buildings
              </Link>
            </Button>
            <Button>
              <Plus />
              Add property to building
            </Button>
          </ToolbarActions>
        </Toolbar>
      </Container>
      <Container>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 lg:gap-7.5">
          <div className="col-span-2 flex flex-col gap-5 lg:gap-7.5">
            <Card>
              <CardHeader>
                <CardTitle>Building summary</CardTitle>
                <Badge size="sm" variant="primary" appearance="light">
                  {owners.length} owner{owners.length !== 1 ? 's' : ''}
                </Badge>
              </CardHeader>
              <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">
                    Properties
                  </span>
                  <span className="text-2xl font-semibold text-mono">
                    {properties.length}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">Listings</span>
                  <span className="text-2xl font-semibold text-mono">
                    {listings.length}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">
                    Total units
                  </span>
                  <span className="text-2xl font-semibold text-mono">
                    {totalUnits}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">
                    Occupied now
                  </span>
                  <span className="text-2xl font-semibold text-mono">
                    {occupiedNow}
                  </span>
                </div>
              </CardContent>
            </Card>

            {building.sharedPhotos.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Common areas</CardTitle>
                </CardHeader>
                <CardContent className="p-5">
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                    {building.sharedPhotos.map((url, i) => (
                      <img
                        key={i}
                        src={url}
                        alt={`${building.name} ${i + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-border"
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Owners ({owners.length})</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table className="text-sm">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Merchant</TableHead>
                      <TableHead>Properties</TableHead>
                      <TableHead>Listings</TableHead>
                      <TableHead>Units</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {owners.map((o) => (
                      <TableRow key={o.merchantId}>
                        <TableCell className="font-medium text-mono">
                          {o.merchantName}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            {o.properties.map((p) => (
                              <Link
                                key={p.id}
                                href={`/properties/${p.id}`}
                                className="text-xs text-foreground hover:text-primary"
                              >
                                {p.name}
                              </Link>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {o.listings.length}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {o.units}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/admin/merchants/${o.merchantId}`}>
                              View merchant
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent bookings</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table className="text-sm">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ref</TableHead>
                      <TableHead>Guest</TableHead>
                      <TableHead>Listing</TableHead>
                      <TableHead>Dates</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentBookings.map((b) => (
                      <TableRow key={b.id}>
                        <TableCell className="font-medium text-mono">
                          {b.ref}
                        </TableCell>
                        <TableCell className="text-foreground">
                          {b.guestName}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {b.listingName} · {b.unitName}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {b.checkIn} → {b.checkOut}
                        </TableCell>
                        <TableCell>
                          <Badge
                            size="sm"
                            variant={
                              b.status === 'CHECKED_IN'
                                ? 'success'
                                : b.status === 'CONFIRMED'
                                  ? 'primary'
                                  : b.status === 'PENDING'
                                    ? 'warning'
                                    : b.status === 'CANCELLED'
                                      ? 'destructive'
                                      : 'secondary'
                            }
                            appearance="light"
                          >
                            {b.status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    {recentBookings.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
                          No bookings yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          <div className="col-span-1 flex flex-col gap-5 lg:gap-7.5">
            <Card>
              <CardHeader>
                <CardTitle>Building info</CardTitle>
                <Building2 className="size-5 text-muted-foreground" />
              </CardHeader>
              <CardContent className="flex flex-col gap-3 p-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Floors</span>
                  <span className="text-sm font-medium">{building.totalFloors}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Postcode</span>
                  <span className="text-sm font-medium">{building.postcode}</span>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <span className="text-sm text-muted-foreground">Parking</span>
                  <span className="text-sm font-medium text-right">
                    {building.parkingInfo}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Wifi size={14} />
                    Guest WiFi
                  </span>
                  <span className="text-sm font-medium">{building.wifiName}</span>
                </div>
                {building.notes && (
                  <div className="flex flex-col gap-1.5 border-t border-border pt-3">
                    <span className="text-xs text-muted-foreground">Notes</span>
                    <p className="text-sm text-foreground">{building.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </Container>
    </Fragment>
  );
}
