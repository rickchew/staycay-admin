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
import { MOCK_LISTINGS, type Listing } from '@/lib/mock';

export default function ListingsPage() {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'rate', desc: true },
  ]);
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = useMemo(() => {
    if (!searchQuery) return MOCK_LISTINGS;
    const q = searchQuery.toLowerCase();
    return MOCK_LISTINGS.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.propertyName.toLowerCase().includes(q),
    );
  }, [searchQuery]);

  const columns = useMemo<ColumnDef<Listing>[]>(
    () => [
      {
        id: 'listing',
        accessorFn: (row) => row.name,
        header: ({ column }) => (
          <DataGridColumnHeader title="Listing" column={column} />
        ),
        cell: ({ row }) => (
          <div className="flex flex-col">
            <Link
              href={`/properties/${row.original.propertyId}/listings/${row.original.id}`}
              className="text-sm font-medium text-mono hover:text-primary"
            >
              {row.original.name}
            </Link>
            <span className="text-xs text-muted-foreground">
              {row.original.propertyName}
            </span>
          </div>
        ),
        size: 280,
      },
      {
        id: 'capacity',
        accessorFn: (row) => row.maxGuests,
        header: ({ column }) => (
          <DataGridColumnHeader title="Capacity" column={column} />
        ),
        cell: ({ row }) => (
          <span className="text-sm">
            {row.original.maxGuests} guests · {row.original.bedrooms} BR ·{' '}
            {row.original.bathrooms} BA
          </span>
        ),
        size: 200,
      },
      {
        id: 'rate',
        accessorFn: (row) => row.dailyRate,
        header: ({ column }) => (
          <DataGridColumnHeader title="Daily rate" column={column} />
        ),
        cell: ({ row }) => (
          <span className="font-medium text-foreground">
            RM {row.original.dailyRate}
          </span>
        ),
        size: 130,
      },
      {
        id: 'units',
        accessorFn: (row) => row.quantity,
        header: ({ column }) => (
          <DataGridColumnHeader title="Units" column={column} />
        ),
        cell: ({ row }) => (
          <span className="text-sm">
            {row.original.quantity}
            {row.original.isSingle && (
              <Badge size="sm" variant="secondary" className="ms-1.5">
                single
              </Badge>
            )}
          </span>
        ),
        size: 130,
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
            title="Listings"
            description="Bookable room or unit types across all properties"
          />
          <ToolbarActions>
            <Button>
              <Plus />
              Add listing
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
              <CardTitle>All listings</CardTitle>
              <CardToolbar className="relative">
                <Search className="size-4 text-muted-foreground absolute start-3 top-1/2 -translate-y-1/2" />
                <Input
                  placeholder="Search listings..."
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
