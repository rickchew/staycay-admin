'use client';

import { Fragment, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { CalendarPlus, Search, X } from 'lucide-react';
import {
  Toolbar,
  ToolbarActions,
  ToolbarHeading,
} from '@/layouts/demo1/components/toolbar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardFooter,
  CardHeader,
  CardTable,
  CardTitle,
  CardToolbar,
} from '@/components/ui/card';
import { Container } from '@/components/common/container';
import { DataGrid } from '@/components/ui/data-grid';
import { DataGridColumnHeader } from '@/components/ui/data-grid-column-header';
import { DataGridPagination } from '@/components/ui/data-grid-pagination';
import { DataGridTable } from '@/components/ui/data-grid-table';
import { Input } from '@/components/ui/input';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  MOCK_BOOKINGS,
  MOCK_CHANNELS,
  getChannel,
  type Booking,
  type BookingStatus,
  type ChannelCode,
} from '@/lib/mock';

const STATUS_VARIANT: Record<BookingStatus, 'primary' | 'success' | 'warning' | 'destructive' | 'secondary'> = {
  PENDING: 'warning',
  CONFIRMED: 'primary',
  CHECKED_IN: 'success',
  CHECKED_OUT: 'secondary',
  CANCELLED: 'destructive',
};

const STATUSES: { value: BookingStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'CHECKED_IN', label: 'Checked-in' },
  { value: 'CHECKED_OUT', label: 'Checked-out' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export default function BookingsPage() {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'check_in', desc: true },
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all');
  const [channelFilter, setChannelFilter] = useState<ChannelCode | 'all'>('all');

  const filtered = useMemo(() => {
    return MOCK_BOOKINGS.filter((b) => {
      if (statusFilter !== 'all' && b.status !== statusFilter) return false;
      if (channelFilter !== 'all' && b.channelCode !== channelFilter) return false;
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        b.ref.toLowerCase().includes(q) ||
        b.guestName.toLowerCase().includes(q) ||
        b.propertyName.toLowerCase().includes(q) ||
        (b.externalBookingRef ?? '').toLowerCase().includes(q)
      );
    });
  }, [searchQuery, statusFilter, channelFilter]);

  const columns = useMemo<ColumnDef<Booking>[]>(
    () => [
      {
        id: 'ref',
        accessorFn: (row) => row.ref,
        header: ({ column }) => (
          <DataGridColumnHeader title="Booking" column={column} />
        ),
        cell: ({ row }) => (
          <div className="flex flex-col gap-1">
            <Link
              href={`/bookings/${row.original.id}`}
              className="text-sm font-medium text-mono hover:text-primary"
            >
              {row.original.ref}
            </Link>
            <span className="text-xs text-muted-foreground">
              {row.original.propertyName} · {row.original.unitName}
            </span>
          </div>
        ),
        size: 220,
      },
      {
        id: 'guest',
        accessorFn: (row) => row.guestName,
        header: ({ column }) => (
          <DataGridColumnHeader title="Guest" column={column} />
        ),
        cell: ({ row }) => (
          <Link
            href={`/guests/${row.original.guestId}`}
            className="text-sm text-foreground hover:text-primary"
          >
            {row.original.guestName}
          </Link>
        ),
        size: 180,
      },
      {
        id: 'check_in',
        accessorFn: (row) => row.checkIn,
        header: ({ column }) => (
          <DataGridColumnHeader title="Stay" column={column} />
        ),
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="text-sm text-foreground">
              {row.original.checkIn} → {row.original.checkOut}
            </span>
            <span className="text-xs text-muted-foreground">
              {row.original.nights}n · RM {row.original.subtotal}
            </span>
          </div>
        ),
        size: 200,
      },
      {
        id: 'status',
        accessorFn: (row) => row.status,
        header: ({ column }) => (
          <DataGridColumnHeader title="Status" column={column} />
        ),
        cell: ({ row }) => (
          <Badge
            size="sm"
            variant={STATUS_VARIANT[row.original.status]}
            appearance="light"
          >
            {row.original.status.replace('_', ' ')}
          </Badge>
        ),
        size: 130,
      },
      {
        id: 'channel',
        accessorFn: (row) => row.channelCode,
        header: ({ column }) => (
          <DataGridColumnHeader title="Channel" column={column} />
        ),
        cell: ({ row }) => {
          const channel = getChannel(row.original.channelCode);
          return (
            <div className="flex flex-col gap-0.5">
              <span className="inline-flex items-center gap-1.5 text-sm">
                <span className={`h-2 w-2 rounded-full ${channel.color}`} />
                {channel.name}
              </span>
              {row.original.externalBookingRef && (
                <span className="text-xs text-muted-foreground font-mono">
                  {row.original.externalBookingRef}
                </span>
              )}
            </div>
          );
        },
        size: 160,
      },
      {
        id: 'payment',
        accessorFn: (row) => row.paymentStatus,
        header: ({ column }) => (
          <DataGridColumnHeader title="Payment" column={column} />
        ),
        cell: ({ row }) => {
          const variant =
            row.original.paymentStatus === 'PAID'
              ? 'success'
              : row.original.paymentStatus === 'PARTIAL'
                ? 'warning'
                : row.original.paymentStatus === 'REFUNDED'
                  ? 'secondary'
                  : 'destructive';
          return (
            <Badge size="sm" variant={variant} appearance="light">
              {row.original.paymentStatus}
            </Badge>
          );
        },
        size: 120,
      },
    ],
    [],
  );

  const table = useReactTable({
    columns,
    data: filtered,
    pageCount: Math.ceil(filtered.length / pagination.pageSize),
    getRowId: (row) => row.id,
    state: { pagination, sorting },
    columnResizeMode: 'onChange',
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="Bookings"
            description="All reservations across properties and channels"
          />
          <ToolbarActions>
            <Button>
              <CalendarPlus />
              New booking
            </Button>
          </ToolbarActions>
        </Toolbar>
      </Container>
      <Container>
        <DataGrid
          table={table}
          recordCount={filtered.length}
          tableLayout={{ cellBorder: true }}
        >
          <Card>
            <CardHeader className="py-3.5 flex-wrap gap-3">
              <CardTitle>All bookings</CardTitle>
              <CardToolbar className="flex items-center gap-3 flex-wrap">
                <div className="flex gap-1">
                  {STATUSES.map((s) => (
                    <Button
                      key={s.value}
                      size="sm"
                      variant={statusFilter === s.value ? 'primary' : 'outline'}
                      onClick={() => setStatusFilter(s.value)}
                    >
                      {s.label}
                    </Button>
                  ))}
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant={channelFilter === 'all' ? 'primary' : 'outline'}
                    onClick={() => setChannelFilter('all')}
                  >
                    All channels
                  </Button>
                  {MOCK_CHANNELS.map((c) => (
                    <Button
                      key={c.code}
                      size="sm"
                      variant={channelFilter === c.code ? 'primary' : 'outline'}
                      onClick={() => setChannelFilter(c.code)}
                    >
                      <span className={`h-2 w-2 rounded-full ${c.color}`} />
                      {c.name}
                    </Button>
                  ))}
                </div>
                <div className="relative">
                  <Search className="size-4 text-muted-foreground absolute start-3 top-1/2 -translate-y-1/2" />
                  <Input
                    placeholder="Search ref, guest, ext ref..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="ps-9 w-60"
                  />
                  {searchQuery.length > 0 && (
                    <Button
                      mode="icon"
                      variant="ghost"
                      className="absolute end-1.5 top-1/2 -translate-y-1/2 h-6 w-6"
                      onClick={() => setSearchQuery('')}
                    >
                      <X />
                    </Button>
                  )}
                </div>
              </CardToolbar>
            </CardHeader>
            <CardTable>
              <ScrollArea>
                <DataGridTable />
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </CardTable>
            <CardFooter>
              <DataGridPagination />
            </CardFooter>
          </Card>
        </DataGrid>
      </Container>
    </Fragment>
  );
}
