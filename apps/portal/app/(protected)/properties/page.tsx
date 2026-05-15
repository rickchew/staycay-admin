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
import { Plus, Search, X } from 'lucide-react';
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
import { MOCK_PROPERTIES, type Property } from '@/lib/mock';

export default function PropertiesPage() {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'property', desc: false },
  ]);
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = useMemo(() => {
    if (!searchQuery) return MOCK_PROPERTIES;
    const q = searchQuery.toLowerCase();
    return MOCK_PROPERTIES.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q) ||
        p.merchantName.toLowerCase().includes(q),
    );
  }, [searchQuery]);

  const columns = useMemo<ColumnDef<Property>[]>(
    () => [
      {
        id: 'property',
        accessorFn: (row) => row.name,
        header: ({ column }) => (
          <DataGridColumnHeader title="Property" column={column} />
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            {row.original.imageUrls[0] ? (
              <img
                src={row.original.imageUrls[0]}
                alt={row.original.name}
                className="w-12 h-12 rounded-lg object-cover border border-border"
              />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-muted" />
            )}
            <div className="flex flex-col">
              <Link
                href={`/properties/${row.original.id}`}
                className="text-sm font-medium text-mono hover:text-primary"
              >
                {row.original.name}
              </Link>
              <span className="text-xs text-muted-foreground">
                {row.original.address}
              </span>
            </div>
          </div>
        ),
        size: 320,
      },
      {
        id: 'location',
        accessorFn: (row) => `${row.city}, ${row.state}`,
        header: ({ column }) => (
          <DataGridColumnHeader title="Location" column={column} />
        ),
        cell: ({ row }) => (
          <span className="text-sm">
            {row.original.city}, {row.original.state}
          </span>
        ),
        size: 180,
      },
      {
        id: 'merchant',
        accessorFn: (row) => row.merchantName,
        header: ({ column }) => (
          <DataGridColumnHeader title="Merchant" column={column} />
        ),
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.merchantName}
          </span>
        ),
        size: 200,
      },
      {
        id: 'listings',
        accessorFn: (row) => row.listingsCount,
        header: ({ column }) => (
          <DataGridColumnHeader title="Listings" column={column} />
        ),
        cell: ({ row }) => row.original.listingsCount,
        size: 100,
      },
      {
        id: 'checkin',
        accessorFn: (row) => row.checkInTime,
        header: ({ column }) => (
          <DataGridColumnHeader title="Check-in/out" column={column} />
        ),
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.checkInTime} / {row.original.checkOutTime}
          </span>
        ),
        size: 140,
      },
      {
        id: 'status',
        accessorFn: (row) => row.isActive,
        header: ({ column }) => (
          <DataGridColumnHeader title="Status" column={column} />
        ),
        cell: ({ row }) => (
          <Badge
            size="sm"
            variant={row.original.isActive ? 'success' : 'secondary'}
            appearance="light"
          >
            {row.original.isActive ? 'Active' : 'Inactive'}
          </Badge>
        ),
        size: 110,
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
            title="Properties"
            description="Physical locations available for booking"
          />
          <ToolbarActions>
            <Button>
              <Plus />
              Add property
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
            <CardHeader className="py-3.5">
              <CardTitle>All properties</CardTitle>
              <CardToolbar className="relative">
                <Search className="size-4 text-muted-foreground absolute start-3 top-1/2 -translate-y-1/2" />
                <Input
                  placeholder="Search properties..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="ps-9 w-56"
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
      </Container>
    </Fragment>
  );
}
