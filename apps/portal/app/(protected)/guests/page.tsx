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
import { Crown, Search, ShieldAlert, X } from 'lucide-react';
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
import { CURRENT_MERCHANT, MOCK_GUESTS, type Guest } from '@/lib/mock';

type Filter = 'all' | 'vip' | 'blacklisted';

export default function GuestsPage() {
  const merchant = CURRENT_MERCHANT;
  const baseGuests = useMemo(
    () => MOCK_GUESTS.filter((g) => g.merchantId === merchant.id),
    [merchant.id],
  );

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'lastBookingAt', desc: true },
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const filtered = useMemo(() => {
    return baseGuests.filter((g) => {
      if (filter === 'vip' && !g.vip) return false;
      if (filter === 'blacklisted' && !g.isBlacklisted) return false;
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        g.name.toLowerCase().includes(q) ||
        g.email.toLowerCase().includes(q) ||
        g.phone.toLowerCase().includes(q)
      );
    });
  }, [baseGuests, filter, searchQuery]);

  const columns = useMemo<ColumnDef<Guest>[]>(
    () => [
      {
        id: 'guest',
        accessorFn: (row) => row.name,
        header: ({ column }) => (
          <DataGridColumnHeader title="Guest" column={column} />
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-2.5">
            <img
              src={row.original.avatarUrl}
              alt={row.original.name}
              className="w-9 h-9 rounded-full border border-border"
            />
            <div className="flex flex-col">
              <Link
                href={`/guests/${row.original.id}`}
                className="text-sm font-medium text-mono hover:text-primary inline-flex items-center gap-1.5"
              >
                {row.original.name}
                {row.original.vip && (
                  <Crown size={12} className="text-amber-500" />
                )}
                {row.original.isBlacklisted && (
                  <ShieldAlert size={12} className="text-destructive" />
                )}
              </Link>
              <span className="text-xs text-muted-foreground">
                {row.original.email}
              </span>
            </div>
          </div>
        ),
        size: 280,
      },
      {
        id: 'phone',
        accessorFn: (row) => row.phone,
        header: ({ column }) => (
          <DataGridColumnHeader title="Phone" column={column} />
        ),
        cell: ({ row }) => row.original.phone,
        size: 160,
      },
      {
        id: 'nationality',
        accessorFn: (row) => row.nationality,
        header: ({ column }) => (
          <DataGridColumnHeader title="Nationality" column={column} />
        ),
        cell: ({ row }) => row.original.nationality,
        size: 120,
      },
      {
        id: 'totalBookings',
        accessorFn: (row) => row.totalBookings,
        header: ({ column }) => (
          <DataGridColumnHeader title="Bookings" column={column} />
        ),
        cell: ({ row }) => row.original.totalBookings,
        size: 100,
      },
      {
        id: 'totalSpent',
        accessorFn: (row) => row.totalSpent,
        header: ({ column }) => (
          <DataGridColumnHeader title="Lifetime spend" column={column} />
        ),
        cell: ({ row }) => (
          <span className="font-medium">RM {row.original.totalSpent}</span>
        ),
        size: 140,
      },
      {
        id: 'lastBookingAt',
        accessorFn: (row) => row.lastBookingAt,
        header: ({ column }) => (
          <DataGridColumnHeader title="Last stay" column={column} />
        ),
        cell: ({ row }) => row.original.lastBookingAt.slice(0, 10),
        size: 130,
      },
      {
        id: 'status',
        accessorFn: (row) => (row.isBlacklisted ? 'blacklisted' : row.vip ? 'vip' : 'active'),
        header: ({ column }) => (
          <DataGridColumnHeader title="Status" column={column} />
        ),
        cell: ({ row }) => {
          if (row.original.isBlacklisted) {
            return (
              <Badge size="sm" variant="destructive" appearance="light">
                Blacklisted
              </Badge>
            );
          }
          if (row.original.vip) {
            return (
              <Badge size="sm" variant="warning" appearance="light">
                VIP
              </Badge>
            );
          }
          return (
            <Badge size="sm" variant="secondary" appearance="light">
              Active
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
            title="Guestbook"
            description={`Past and current guests of ${merchant.name}`}
          />
          <ToolbarActions />
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
              <CardTitle>
                {baseGuests.length} guests · created via bookings
              </CardTitle>
              <CardToolbar className="flex items-center gap-2 flex-wrap">
                <div className="flex gap-1.5">
                  <Button
                    size="sm"
                    variant={filter === 'all' ? 'primary' : 'outline'}
                    onClick={() => setFilter('all')}
                  >
                    All
                  </Button>
                  <Button
                    size="sm"
                    variant={filter === 'vip' ? 'primary' : 'outline'}
                    onClick={() => setFilter('vip')}
                  >
                    <Crown size={12} />
                    VIP
                  </Button>
                  <Button
                    size="sm"
                    variant={filter === 'blacklisted' ? 'primary' : 'outline'}
                    onClick={() => setFilter('blacklisted')}
                  >
                    <ShieldAlert size={12} />
                    Blacklisted
                  </Button>
                </div>
                <div className="relative">
                  <Search className="size-4 text-muted-foreground absolute start-3 top-1/2 -translate-y-1/2" />
                  <Input
                    placeholder="Search name, email, phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="ps-9 w-64"
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
