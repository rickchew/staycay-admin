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
import { MOCK_MERCHANTS, getMerchantStats, type Merchant } from '@/lib/mock';

export default function AdminMerchantsPage() {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'createdAt', desc: true },
  ]);
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = useMemo(() => {
    if (!searchQuery) return MOCK_MERCHANTS;
    const q = searchQuery.toLowerCase();
    return MOCK_MERCHANTS.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.city.toLowerCase().includes(q),
    );
  }, [searchQuery]);

  const columns = useMemo<ColumnDef<Merchant>[]>(
    () => [
      {
        id: 'name',
        accessorFn: (row) => row.name,
        header: ({ column }) => (
          <DataGridColumnHeader title="Merchant" column={column} />
        ),
        cell: ({ row }) => (
          <div className="flex flex-col gap-1">
            <Link
              href={`/admin/merchants/${row.original.id}`}
              className="text-sm font-medium text-mono hover:text-primary"
            >
              {row.original.name}
            </Link>
            <span className="text-xs text-muted-foreground">
              {row.original.email}
            </span>
          </div>
        ),
        size: 280,
      },
      {
        id: 'city',
        accessorFn: (row) => row.city,
        header: ({ column }) => (
          <DataGridColumnHeader title="City" column={column} />
        ),
        cell: ({ row }) => row.original.city,
        size: 140,
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
        id: 'properties',
        accessorFn: (row) => getMerchantStats(row.id).propertiesCount,
        header: ({ column }) => (
          <DataGridColumnHeader title="Properties" column={column} />
        ),
        cell: ({ row }) => getMerchantStats(row.original.id).propertiesCount,
        size: 100,
      },
      {
        id: 'members',
        accessorFn: (row) => getMerchantStats(row.id).membersCount,
        header: ({ column }) => (
          <DataGridColumnHeader title="Members" column={column} />
        ),
        cell: ({ row }) => getMerchantStats(row.original.id).membersCount,
        size: 100,
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
      {
        id: 'createdAt',
        accessorFn: (row) => row.createdAt,
        header: ({ column }) => (
          <DataGridColumnHeader title="Joined" column={column} />
        ),
        cell: ({ row }) => row.original.createdAt.slice(0, 10),
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
            title="Merchants"
            description="All property businesses on the platform"
          />
          <ToolbarActions>
            <Button>
              <Plus />
              Add merchant
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
              <CardTitle>All merchants</CardTitle>
              <CardToolbar className="relative">
                <Search className="size-4 text-muted-foreground absolute start-3 top-1/2 -translate-y-1/2" />
                <Input
                  placeholder="Search merchants..."
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
