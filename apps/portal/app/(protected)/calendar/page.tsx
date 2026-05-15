'use client';

import { Fragment, useMemo, useState } from 'react';
import Link from 'next/link';
import { addDays, format, startOfDay, subDays } from 'date-fns';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Toolbar,
  ToolbarActions,
  ToolbarHeading,
} from '@/layouts/demo1/components/toolbar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Container } from '@/components/common/container';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  MOCK_BOOKINGS,
  MOCK_LISTINGS,
  MOCK_PROPERTIES,
  type Booking,
  type ListingUnit,
} from '@/lib/mock';

const STATUS_COLORS: Record<Booking['status'], string> = {
  PENDING: 'bg-amber-200 text-amber-900 border-amber-400 dark:bg-amber-900/40 dark:text-amber-200',
  CONFIRMED: 'bg-blue-200 text-blue-900 border-blue-400 dark:bg-blue-900/40 dark:text-blue-200',
  CHECKED_IN: 'bg-emerald-200 text-emerald-900 border-emerald-400 dark:bg-emerald-900/40 dark:text-emerald-200',
  CHECKED_OUT: 'bg-gray-200 text-gray-900 border-gray-400 dark:bg-gray-700 dark:text-gray-200',
  CANCELLED: 'bg-red-200 text-red-900 border-red-400 dark:bg-red-900/40 dark:text-red-200 line-through opacity-70',
};

const DAY_COUNT = 14;

type UnitRow = {
  unit: ListingUnit;
  listingName: string;
  propertyName: string;
  propertyId: string;
  dailyRate: number;
};

export default function CalendarPage() {
  const [anchor, setAnchor] = useState<Date>(() => startOfDay(new Date()));
  const [propertyFilter, setPropertyFilter] = useState<string>('all');

  // Build the day range
  const days = useMemo(
    () => Array.from({ length: DAY_COUNT }, (_, i) => addDays(anchor, i)),
    [anchor],
  );

  // Build the unit rows (one per ListingUnit), optionally filtered by property
  const rows = useMemo<UnitRow[]>(() => {
    return MOCK_LISTINGS.filter(
      (l) => propertyFilter === 'all' || l.propertyId === propertyFilter,
    ).flatMap((listing) =>
      listing.units.map((unit) => ({
        unit,
        listingName: listing.name,
        propertyName: listing.propertyName,
        propertyId: listing.propertyId,
        dailyRate: listing.dailyRate,
      })),
    );
  }, [propertyFilter]);

  // Index bookings by unitId for fast lookup
  const bookingsByUnit = useMemo(() => {
    const map = new Map<string, Booking[]>();
    for (const b of MOCK_BOOKINGS) {
      if (!map.has(b.unitId)) map.set(b.unitId, []);
      map.get(b.unitId)!.push(b);
    }
    return map;
  }, []);

  const visibleProperties = MOCK_PROPERTIES.slice().sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  const rangeLabel = `${format(days[0], 'MMM d')} – ${format(days[days.length - 1], 'MMM d, yyyy')}`;

  // Stats for the visible window
  const visibleUnitIds = new Set(rows.map((r) => r.unit.id));
  const visibleBookings = MOCK_BOOKINGS.filter(
    (b) =>
      visibleUnitIds.has(b.unitId) &&
      b.checkIn <= format(days[days.length - 1], 'yyyy-MM-dd') &&
      b.checkOut >= format(days[0], 'yyyy-MM-dd') &&
      b.status !== 'CANCELLED',
  );
  const occupiedNights = visibleBookings.reduce((s, b) => {
    const from = days[0];
    const to = days[days.length - 1];
    const fromKey = format(from, 'yyyy-MM-dd');
    const toKey = format(to, 'yyyy-MM-dd');
    const start = b.checkIn > fromKey ? b.checkIn : fromKey;
    const end = b.checkOut < toKey ? b.checkOut : toKey;
    const diff = Math.max(
      0,
      Math.round(
        (new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24),
      ),
    );
    return s + diff;
  }, 0);
  const totalNights = rows.length * DAY_COUNT;
  const occupancyPct =
    totalNights > 0 ? Math.round((occupiedNights / totalNights) * 100) : 0;

  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="Calendar"
            description="Occupancy grid — each row is a bookable unit, each column a date"
          />
          <ToolbarActions>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAnchor(startOfDay(new Date()))}
            >
              Today
            </Button>
            <div className="inline-flex gap-1">
              <Button
                variant="outline"
                size="sm"
                mode="icon"
                onClick={() => setAnchor((d) => subDays(d, 7))}
              >
                <ChevronLeft />
              </Button>
              <Button
                variant="outline"
                size="sm"
                mode="icon"
                onClick={() => setAnchor((d) => addDays(d, 7))}
              >
                <ChevronRight />
              </Button>
            </div>
            <Select value={propertyFilter} onValueChange={setPropertyFilter}>
              <SelectTrigger className="w-56">
                <SelectValue placeholder="Filter by property" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All properties</SelectItem>
                {visibleProperties.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </ToolbarActions>
        </Toolbar>
      </Container>
      <Container>
        <Card>
          <CardHeader className="flex-wrap gap-3">
            <CardTitle className="inline-flex items-center gap-2">
              <CalendarDays className="size-4" />
              {rangeLabel}
            </CardTitle>
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <span className="inline-flex items-center gap-1.5">
                <span className="size-3 rounded-sm bg-amber-200 border border-amber-400" />
                Pending
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-3 rounded-sm bg-blue-200 border border-blue-400" />
                Confirmed
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-3 rounded-sm bg-emerald-200 border border-emerald-400" />
                Checked-in
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-3 rounded-sm bg-gray-200 border border-gray-400" />
                Checked-out
              </span>
              <Badge size="sm" variant="primary" appearance="light">
                {occupancyPct}% occupancy ({occupiedNights}/{totalNights} unit-nights)
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea>
              <div
                className="grid"
                style={{
                  gridTemplateColumns: `minmax(260px, 1.4fr) repeat(${DAY_COUNT}, minmax(44px, 1fr))`,
                }}
              >
                {/* Header row */}
                <div className="sticky left-0 z-10 bg-card border-b border-border px-4 py-2 text-xs font-semibold text-muted-foreground uppercase">
                  Unit
                </div>
                {days.map((d, i) => {
                  const isToday = format(d, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
                  const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                  return (
                    <div
                      key={i}
                      className={`border-b border-border text-center py-2 text-xs ${isWeekend ? 'bg-muted/30' : ''} ${isToday ? 'text-primary font-semibold' : 'text-muted-foreground'}`}
                    >
                      <div className="leading-none">{format(d, 'EEE')}</div>
                      <div className="leading-none mt-0.5">{format(d, 'd')}</div>
                    </div>
                  );
                })}

                {/* Body rows */}
                {rows.map((row, ri) => {
                  const unitBookings = bookingsByUnit.get(row.unit.id) ?? [];
                  return (
                    <Fragment key={row.unit.id}>
                      <div
                        className={`sticky left-0 z-10 bg-card flex flex-col justify-center px-4 py-2 border-b border-border ${ri === rows.length - 1 ? 'border-b-0' : ''}`}
                      >
                        <span className="text-sm font-medium text-mono">
                          {row.unit.name}
                        </span>
                        <Link
                          href={`/properties/${row.propertyId}`}
                          className="text-xs text-muted-foreground hover:text-primary truncate"
                        >
                          {row.listingName} · {row.propertyName}
                        </Link>
                      </div>
                      {days.map((d, di) => {
                        const dayKey = format(d, 'yyyy-MM-dd');
                        const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                        const isToday = dayKey === format(new Date(), 'yyyy-MM-dd');
                        // booking that occupies this day: checkIn <= day < checkOut
                        const booking = unitBookings.find(
                          (b) => b.checkIn <= dayKey && b.checkOut > dayKey,
                        );
                        const isCheckIn = booking && booking.checkIn === dayKey;
                        const isCheckOut =
                          unitBookings.some((b) => b.checkOut === dayKey) && !booking;
                        return (
                          <div
                            key={di}
                            className={`relative border-b border-l border-border h-12 ${isWeekend ? 'bg-muted/20' : ''} ${isToday ? 'ring-1 ring-primary/40' : ''} ${ri === rows.length - 1 ? 'border-b-0' : ''}`}
                          >
                            {booking && (
                              <Link
                                href={`/bookings/${booking.id}`}
                                className={`absolute inset-0.5 rounded text-[10px] font-medium border ${STATUS_COLORS[booking.status]} px-1 flex flex-col justify-center overflow-hidden hover:ring-2 hover:ring-primary/40 transition-shadow`}
                                title={`${booking.ref} · ${booking.guestName} · ${booking.checkIn} → ${booking.checkOut}`}
                              >
                                {isCheckIn ? (
                                  <span className="truncate leading-tight">
                                    {booking.guestName.split(' ')[0]}
                                  </span>
                                ) : null}
                              </Link>
                            )}
                            {isCheckOut && (
                              <span className="absolute top-1 left-1 text-[9px] text-muted-foreground">
                                out
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </Fragment>
                  );
                })}
                {rows.length === 0 && (
                  <div className="col-span-full text-center text-sm text-muted-foreground py-10">
                    No units match the current filter.
                  </div>
                )}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </CardContent>
        </Card>
      </Container>
    </Fragment>
  );
}
