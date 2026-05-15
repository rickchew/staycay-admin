'use client';

import { Fragment, use, useState } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle2,
  CircleDot,
  CreditCard,
  Crown,
  Mail,
  Phone,
  Plus,
  ShieldAlert,
  Sparkles,
  XCircle,
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
  MOCK_PAYMENTS,
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

const STATUS_FLOW: BookingStatus[] = [
  'PENDING',
  'CONFIRMED',
  'CHECKED_IN',
  'CHECKED_OUT',
];

export default function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const booking = MOCK_BOOKINGS.find((b) => b.id === id);
  if (!booking) notFound();

  const guest = MOCK_GUESTS.find((g) => g.id === booking.guestId);
  const payments = MOCK_PAYMENTS.filter((p) => p.bookingId === booking.id);
  const channel = getChannel(booking.channelCode);
  const stepIndex = STATUS_FLOW.indexOf(booking.status);
  const outstanding = Math.max(0, booking.subtotal - booking.paidAmount);

  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title={booking.ref}
            description={`${booking.guestName} · ${booking.checkIn} → ${booking.checkOut} (${booking.nights} nights)`}
          />
          <ToolbarActions>
            <Button variant="outline" asChild>
              <Link href="/bookings">
                <ArrowLeft />
                Back
              </Link>
            </Button>
            {booking.status === 'CONFIRMED' && (
              <Button>
                <CheckCircle2 />
                Check in
              </Button>
            )}
            {booking.status === 'CHECKED_IN' && (
              <Button>
                <CheckCircle2 />
                Check out
              </Button>
            )}
            {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
              <Button variant="outline">
                <XCircle />
                Cancel
              </Button>
            )}
          </ToolbarActions>
        </Toolbar>
      </Container>
      <Container>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 lg:gap-7.5">
          <div className="col-span-2 flex flex-col gap-5 lg:gap-7.5">
            <Card>
              <CardHeader>
                <CardTitle>Lifecycle</CardTitle>
                <Badge size="sm" variant={STATUS_VARIANT[booking.status]} appearance="light">
                  {booking.status.replace('_', ' ')}
                </Badge>
              </CardHeader>
              <CardContent className="p-5">
                {booking.status === 'CANCELLED' ? (
                  <div className="text-sm text-destructive inline-flex items-center gap-1.5">
                    <XCircle size={14} /> Booking cancelled
                  </div>
                ) : (
                  <ol className="flex flex-wrap items-center gap-4">
                    {STATUS_FLOW.map((s, i) => {
                      const isDone = i < stepIndex;
                      const isCurrent = i === stepIndex;
                      return (
                        <li key={s} className="flex items-center gap-2">
                          <span
                            className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                              isDone
                                ? 'bg-emerald-500 text-white'
                                : isCurrent
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {isDone ? <CheckCircle2 size={14} /> : i + 1}
                          </span>
                          <span
                            className={`text-sm ${
                              isCurrent
                                ? 'font-medium text-foreground'
                                : isDone
                                  ? 'text-foreground'
                                  : 'text-muted-foreground'
                            }`}
                          >
                            {s.replace('_', ' ')}
                          </span>
                          {i < STATUS_FLOW.length - 1 && (
                            <CircleDot size={6} className="text-muted-foreground/40" />
                          )}
                        </li>
                      );
                    })}
                  </ol>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Stay details</CardTitle>
                <span className="inline-flex items-center gap-2 text-sm">
                  {channel.iconUrl ? (
                    <img
                      src={channel.iconUrl}
                      alt={channel.name}
                      className="size-5"
                    />
                  ) : (
                    <span
                      className={`inline-flex size-5 items-center justify-center rounded-full ${channel.color} text-[10px] font-semibold text-white`}
                    >
                      {channel.initial}
                    </span>
                  )}
                  {channel.name}
                  {booking.externalBookingRef && (
                    <span className="text-xs text-muted-foreground font-mono">
                      · {booking.externalBookingRef}
                    </span>
                  )}
                </span>
              </CardHeader>
              <CardContent className="p-0">
                <Table className="text-sm">
                  <TableBody>
                    <TableRow>
                      <TableCell className="min-w-48 text-secondary-foreground font-normal">
                        Property
                      </TableCell>
                      <TableCell className="text-foreground">
                        {booking.propertyName}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-secondary-foreground font-normal">
                        Listing · Unit
                      </TableCell>
                      <TableCell className="text-foreground">
                        {booking.listingName} · {booking.unitName}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-secondary-foreground font-normal">
                        Check-in
                      </TableCell>
                      <TableCell className="text-foreground">
                        {booking.checkIn}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-secondary-foreground font-normal">
                        Check-out
                      </TableCell>
                      <TableCell className="text-foreground">
                        {booking.checkOut}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-secondary-foreground font-normal">
                        Nights × rate
                      </TableCell>
                      <TableCell className="text-foreground">
                        {booking.nights} × RM {booking.dailyRate}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-secondary-foreground font-normal">
                        Subtotal
                      </TableCell>
                      <TableCell className="text-foreground font-semibold">
                        RM {booking.subtotal}
                      </TableCell>
                    </TableRow>
                    {booking.specialRequest && (
                      <TableRow>
                        <TableCell className="text-secondary-foreground font-normal">
                          Special request
                        </TableCell>
                        <TableCell className="text-foreground">
                          {booking.specialRequest}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payments</CardTitle>
                <Button size="sm">
                  <Plus />
                  Record manual payment
                </Button>
              </CardHeader>
              <CardContent className="flex flex-col gap-0 p-0">
                <div className="grid grid-cols-3 gap-3 p-5 border-b border-border">
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground">Total</span>
                    <span className="text-lg font-semibold text-mono">
                      RM {booking.subtotal}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground">Paid</span>
                    <span className="text-lg font-semibold text-emerald-600">
                      RM {booking.paidAmount}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground">
                      Outstanding
                    </span>
                    <span
                      className={`text-lg font-semibold ${outstanding > 0 ? 'text-destructive' : 'text-mono'}`}
                    >
                      RM {outstanding}
                    </span>
                  </div>
                </div>
                <Table className="text-sm">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="text-muted-foreground">
                          {p.paidAt.slice(0, 10)}
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center gap-1.5">
                            <CreditCard size={14} className="text-muted-foreground" />
                            {p.method}
                          </span>
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {p.reference}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          RM {p.amount}
                        </TableCell>
                        <TableCell>
                          <Badge
                            size="sm"
                            variant={p.status === 'REFUNDED' ? 'secondary' : 'success'}
                            appearance="light"
                          >
                            {p.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    {payments.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center text-muted-foreground py-6"
                        >
                          No payments yet
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
                <CardTitle>Guest</CardTitle>
                {guest?.vip && (
                  <Badge size="sm" variant="warning" appearance="light" className="gap-1">
                    <Crown size={10} />
                    VIP
                  </Badge>
                )}
              </CardHeader>
              <CardContent className="flex flex-col gap-3 p-5">
                {guest?.isBlacklisted && (
                  <div className="flex items-center gap-2 rounded-md bg-destructive/10 text-destructive px-3 py-2 text-xs">
                    <ShieldAlert size={14} />
                    Blacklisted — {guest.blacklistReason}
                  </div>
                )}
                <div className="flex items-center gap-3">
                  {guest?.avatarUrl && (
                    <img
                      src={guest.avatarUrl}
                      alt={booking.guestName}
                      className="w-12 h-12 rounded-full border border-border"
                    />
                  )}
                  <div className="flex flex-col">
                    <Link
                      href={`/guests/${booking.guestId}`}
                      className="text-sm font-medium text-mono hover:text-primary"
                    >
                      {booking.guestName}
                    </Link>
                    <span className="text-xs text-muted-foreground">
                      {guest?.nationality} · {guest?.totalBookings} total bookings
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 text-sm">
                  <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                    <Mail size={14} />
                    {booking.guestEmail}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                    <Phone size={14} />
                    {booking.guestPhone}
                  </span>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/guests/${booking.guestId}`}>
                    <Sparkles />
                    View guest profile
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Booking meta</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 p-5 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span className="font-medium">{booking.createdAt.slice(0, 10)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Channel</span>
                  <span className="inline-flex items-center gap-2 font-medium">
                    {channel.iconUrl ? (
                      <img
                        src={channel.iconUrl}
                        alt={channel.name}
                        className="size-4"
                      />
                    ) : (
                      <span
                        className={`inline-flex size-4 items-center justify-center rounded-full ${channel.color} text-[9px] font-semibold text-white`}
                      >
                        {channel.initial}
                      </span>
                    )}
                    {channel.name}
                  </span>
                </div>
                {booking.externalBookingRef && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">External ref</span>
                    <span className="font-mono text-xs">
                      {booking.externalBookingRef}
                    </span>
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
