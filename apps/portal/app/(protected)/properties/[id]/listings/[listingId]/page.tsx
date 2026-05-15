'use client';

import { Fragment, use } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, BedDouble, SquarePen, Users } from 'lucide-react';
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
import { MOCK_BOOKINGS, MOCK_LISTINGS } from '@/lib/mock';

export default function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string; listingId: string }>;
}) {
  const { id, listingId } = use(params);
  const listing = MOCK_LISTINGS.find(
    (l) => l.id === listingId && l.propertyId === id,
  );
  if (!listing) notFound();

  const today = new Date().toISOString().slice(0, 10);
  const upcomingByUnit = listing.units.map((u) => {
    const next = MOCK_BOOKINGS.find(
      (b) =>
        b.unitId === u.id &&
        ['PENDING', 'CONFIRMED', 'CHECKED_IN'].includes(b.status) &&
        b.checkOut >= today,
    );
    return { unit: u, next };
  });

  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title={listing.name}
            description={`${listing.propertyName} · RM ${listing.dailyRate}/night · ${listing.quantity} unit${listing.quantity > 1 ? 's' : ''}`}
          />
          <ToolbarActions>
            <Button variant="outline" asChild>
              <Link href={`/properties/${id}`}>
                <ArrowLeft />
                Back to property
              </Link>
            </Button>
            <Button>
              <SquarePen />
              Edit listing
            </Button>
          </ToolbarActions>
        </Toolbar>
      </Container>
      <Container>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 lg:gap-7.5">
          <div className="col-span-2 flex flex-col gap-5 lg:gap-7.5">
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent className="p-5 text-sm text-foreground leading-relaxed">
                {listing.description}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Units ({listing.units.length})</CardTitle>
                {listing.isSingle ? (
                  <Badge size="sm" variant="secondary" appearance="light">
                    Single unit listing
                  </Badge>
                ) : null}
              </CardHeader>
              <CardContent className="p-0">
                <Table className="text-sm">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Unit</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Next booking</TableHead>
                      <TableHead className="w-16 text-center">Edit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {upcomingByUnit.map(({ unit, next }) => (
                      <TableRow key={unit.id}>
                        <TableCell className="font-medium text-mono">
                          {unit.name}
                        </TableCell>
                        <TableCell>
                          <Badge
                            size="sm"
                            variant={unit.isActive ? 'success' : 'secondary'}
                            appearance="light"
                          >
                            {unit.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {next ? (
                            <>
                              {next.ref} · {next.checkIn} → {next.checkOut}
                            </>
                          ) : (
                            <span className="text-xs">No upcoming bookings</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <Button variant="ghost" mode="icon">
                            <SquarePen size={16} className="text-blue-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          <div className="col-span-1 flex flex-col gap-5 lg:gap-7.5">
            <Card>
              <CardHeader>
                <CardTitle>Specs</CardTitle>
                <Badge
                  size="sm"
                  variant={listing.isActive ? 'success' : 'secondary'}
                  appearance="light"
                >
                  {listing.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 p-5">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Users size={14} />
                    Max guests
                  </span>
                  <span className="text-sm font-medium">
                    {listing.maxGuests}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                    <BedDouble size={14} />
                    Bedrooms
                  </span>
                  <span className="text-sm font-medium">{listing.bedrooms}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Bathrooms</span>
                  <span className="text-sm font-medium">
                    {listing.bathrooms}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Daily rate
                  </span>
                  <span className="text-sm font-medium">
                    RM {listing.dailyRate}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Units</span>
                  <span className="text-sm font-medium">{listing.quantity}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Container>
    </Fragment>
  );
}
