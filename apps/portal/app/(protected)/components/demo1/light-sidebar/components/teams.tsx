'use client';

import { useMemo, useState } from 'react';
import {
  ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  RowSelectionState,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { Search, X } from 'lucide-react';
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
import { DataGrid } from '@/components/ui/data-grid';
import { DataGridColumnHeader } from '@/components/ui/data-grid-column-header';
import { DataGridPagination } from '@/components/ui/data-grid-pagination';
import {
  DataGridTable,
  DataGridTableRowSelect,
  DataGridTableRowSelectAll,
} from '@/components/ui/data-grid-table';
import { Input } from '@/components/ui/input';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { MOCK_BOOKINGS, type Booking } from '@/lib/mock';

const data: Booking[] = [...MOCK_BOOKINGS]
  .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  .slice(0, 15);

const STATUS_VARIANT: Record<Booking['status'], 'primary' | 'success' | 'warning' | 'destructive' | 'secondary'> = {
  PENDING: 'warning',
  CONFIRMED: 'primary',
  CHECKED_IN: 'success',
  CHECKED_OUT: 'secondary',
  CANCELLED: 'destructive',
};

const Teams = () => {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  });
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'check_in', desc: true },
  ]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [searchQuery, setSearchQuery] = useState('');

  const filteredData = useMemo(() => {
    if (!searchQuery) return data;
    const q = searchQuery.toLowerCase();
    return data.filter(
      (item) =>
        item.ref.toLowerCase().includes(q) ||
        item.guestName.toLowerCase().includes(q) ||
        item.propertyName.toLowerCase().includes(q),
    );
  }, [searchQuery]);

  const columns = useMemo<ColumnDef<Booking>[]>(
    () => [
      {
        accessorKey: 'id',
        accessorFn: (row) => row.id,
        header: () => <DataGridTableRowSelectAll />,
        cell: ({ row }) => <DataGridTableRowSelect row={row} />,
        enableSorting: false,
        enableHiding: false,
        enableResizing: false,
        size: 48,
        meta: { cellClassName: '' },
      },
      {
        id: 'ref',
        accessorFn: (row) => row.ref,
        header: ({ column }) => (
          <DataGridColumnHeader title="Booking" column={column} />
        ),
        cell: ({ row }) => (
          <div className="flex flex-col gap-2">
            <span className="leading-none font-medium text-sm text-mono hover:text-primary">
              {row.original.ref}
            </span>
            <span className="text-sm text-secondary-foreground font-normal leading-3">
              {row.original.propertyName} · {row.original.unitName}
            </span>
          </div>
        ),
        enableSorting: true,
        size: 240,
        meta: {
          skeleton: (
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-[125px]" />
              <Skeleton className="h-2.5 w-[90px]" />
            </div>
          ),
        },
      },
      {
        id: 'guest',
        accessorFn: (row) => row.guestName,
        header: ({ column }) => (
          <DataGridColumnHeader title="Guest" column={column} />
        ),
        cell: ({ row }) => (
          <span className="text-sm text-foreground">{row.original.guestName}</span>
        ),
        enableSorting: true,
        size: 180,
        meta: { skeleton: <Skeleton className="h-5 w-[120px]" /> },
      },
      {
        id: 'status',
        accessorFn: (row) => row.status,
        header: ({ column }) => (
          <DataGridColumnHeader title="Status" column={column} />
        ),
        cell: ({ row }) => (
          <Badge size="sm" variant={STATUS_VARIANT[row.original.status]} appearance="light">
            {row.original.status.replace('_', ' ')}
          </Badge>
        ),
        enableSorting: true,
        size: 135,
        meta: { skeleton: <Skeleton className="h-5 w-[80px]" /> },
      },
      {
        id: 'check_in',
        accessorFn: (row) => row.checkIn,
        header: ({ column }) => (
          <DataGridColumnHeader title="Check-in" column={column} />
        ),
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="text-sm text-foreground">{row.original.checkIn}</span>
            <span className="text-xs text-muted-foreground">{row.original.nights}n · RM {row.original.subtotal}</span>
          </div>
        ),
        enableSorting: true,
        size: 140,
        meta: { skeleton: <Skeleton className="h-5 w-[80px]" /> },
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
        enableSorting: true,
        size: 120,
        meta: { skeleton: <Skeleton className="h-5 w-[60px]" /> },
      },
    ],
    [],
  );

  const table = useReactTable({
    columns,
    data: filteredData,
    pageCount: Math.ceil((filteredData?.length || 0) / pagination.pageSize),
    getRowId: (row: Booking) => String(row.id),
    state: { pagination, sorting, rowSelection },
    columnResizeMode: 'onChange',
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <DataGrid
      table={table}
      recordCount={filteredData?.length || 0}
      tableLayout={{
        columnsPinnable: true,
        columnsMovable: true,
        columnsVisibility: true,
        cellBorder: true,
      }}
    >
      <Card>
        <CardHeader className="py-3.5">
          <CardTitle>Recent Bookings</CardTitle>
          <CardToolbar className="relative">
            <Search className="size-4 text-muted-foreground absolute start-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Search bookings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ps-9 w-40"
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
  );
};

export { Teams };
