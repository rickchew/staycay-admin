'use client';

import { Fragment, use } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  Crown,
  Mail,
  Phone,
  ShieldAlert,
  SquarePen,
} from 'lucide-react';
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
  MOCK_GUESTS,
  getChannel,
  type BookingStatus,
} from '@/lib/mock';

const STATUS_VARIANT: Record<BookingStatus, 'primary' | 'success' | 'warning' | 'destructive' | 'secondary'> = {
  PENDING: 'warning',
  CONFIRMED: 'primary',
  CHECKED_IN: 'success',
  CHECKED_OUT: 'secondary',
  CANCELLED: 'destructive',
};

export default function GuestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const guest = MOCK_GUESTS.find((g) => g.id === id);
  if (!guest) notFound();

  const bookings = MOCK_BOOKINGS.filter((b) => b.guestId === id).sort((a, b) =>
    b.checkIn.localeCompare(a.checkIn),
  );

  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title={guest.name}
            description={`${guest.nationality} · ${guest.totalBookings} bookings · joined ${guest.firstBookingAt.slice(0, 10)}`}
          />
          <ToolbarActions>
            <Button variant="outline" asChild>
              <Link href="/guests">
                <ArrowLeft />
                Guestbook
              </Link>
            </Button>
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
            {guest.isBlacklisted && (
              <Card className="border-destructive/50">
                <CardContent className="flex items-start gap-3 p-5">
                  <ShieldAlert className="text-destructive shrink-0 mt-0.5" size={20} />
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-semibold text-destructive">
                      This guest is blacklisted
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Reason: {guest.blacklistReason}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      New bookings for this guest will be rejected (BR-G04).
                    </span>
                  </div>
                  <div className="ms-auto">
                    <Button size="sm" variant="outline">
                      Lift blacklist
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Booking history ({bookings.length})</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table className="text-sm">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ref</TableHead>
                      <TableHead>Property</TableHead>
                      <TableHead>Dates</TableHead>
                      <TableHead>Channel</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((b) => {
                      const ch = getChannel(b.channelCode);
                      return (
                        <TableRow key={b.id}>
                          <TableCell>
                            <Link
                              href={`/bookings/${b.id}`}
                              className="font-medium text-mono hover:text-primary"
                            >
                              {b.ref}
                            </Link>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {b.propertyName} · {b.unitName}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {b.checkIn} → {b.checkOut}
                          </TableCell>
                          <TableCell>
                            <span className="inline-flex items-center gap-1.5 text-sm">
                              <span className={`h-2 w-2 rounded-full ${ch.color}`} />
                              {ch.name}
                            </span>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            RM {b.subtotal}
                          </TableCell>
                          <TableCell>
                            <Badge
                              size="sm"
                              variant={STATUS_VARIANT[b.status]}
                              appearance="light"
                            >
                              {b.status.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {bookings.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-6">
                          No bookings on record yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Identity & ID</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table className="text-sm">
                  <TableBody>
                    <TableRow>
                      <TableCell className="min-w-48 text-secondary-foreground font-normal">
                        Nationality
                      </TableCell>
                      <TableCell className="text-foreground">
                        {guest.nationality}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-secondary-foreground font-normal">
                        ID type
                      </TableCell>
                      <TableCell className="text-foreground">
                        {guest.idType}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-secondary-foreground font-normal">
                        ID number
                      </TableCell>
                      <TableCell className="text-foreground font-mono text-xs">
                        {guest.idNumber}
                      </TableCell>
                    </TableRow>
                    {guest.notes && (
                      <TableRow>
                        <TableCell className="text-secondary-foreground font-normal">
                          Notes
                        </TableCell>
                        <TableCell className="text-foreground">
                          {guest.notes}
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
              <CardContent className="flex flex-col items-center gap-3 p-5 text-center">
                <img
                  src={guest.avatarUrl}
                  alt={guest.name}
                  className="w-20 h-20 rounded-full border border-border"
                />
                <div className="flex flex-col items-center gap-1">
                  <span className="text-base font-semibold text-mono">
                    {guest.name}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {guest.vip && (
                      <Badge size="sm" variant="warning" appearance="light" className="gap-1">
                        <Crown size={10} />
                        VIP
                      </Badge>
                    )}
                    {guest.isBlacklisted ? (
                      <Badge size="sm" variant="destructive" appearance="light">
                        Blacklisted
                      </Badge>
                    ) : (
                      <Badge size="sm" variant="success" appearance="light">
                        Active
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 text-sm w-full mt-2">
                  <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                    <Mail size={14} />
                    {guest.email}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                    <Phone size={14} />
                    {guest.phone}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Lifetime stats</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 p-5 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total bookings</span>
                  <span className="font-medium">{guest.totalBookings}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total spend</span>
                  <span className="font-medium">RM {guest.totalSpent}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">First stay</span>
                  <span className="font-medium">{guest.firstBookingAt.slice(0, 10)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Last stay</span>
                  <span className="font-medium">{guest.lastBookingAt.slice(0, 10)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Container>
    </Fragment>
  );
}
