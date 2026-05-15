'use client';

import { Fragment, useMemo, useState } from 'react';
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
import { Plus, Search, Trash2, X } from 'lucide-react';
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
  CURRENT_MERCHANT,
  MOCK_USERS,
  STAYCAY_ROLES,
  type StaycayUser,
} from '@/lib/mock';

export default function SettingsMembersPage() {
  const merchant = CURRENT_MERCHANT;
  const allMembers = useMemo(
    () => MOCK_USERS.filter((u) => u.merchantId === merchant.id),
    [merchant.id],
  );

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'lastLoginAt', desc: true },
  ]);
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = useMemo(() => {
    if (!searchQuery) return allMembers;
    const q = searchQuery.toLowerCase();
    return allMembers.filter(
      (u) =>
        u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
    );
  }, [allMembers, searchQuery]);

  const columns = useMemo<ColumnDef<StaycayUser>[]>(
    () => [
      {
        id: 'user',
        accessorFn: (row) => row.name,
        header: ({ column }) => (
          <DataGridColumnHeader title="Member" column={column} />
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-2.5">
            <img
              src={row.original.avatarUrl}
              className="w-8 h-8 rounded-full border border-border"
              alt={row.original.name}
            />
            <div className="flex flex-col">
              <span className="text-sm font-medium text-mono">
                {row.original.name}
              </span>
              <span className="text-xs text-muted-foreground">
                {row.original.email}
              </span>
            </div>
          </div>
        ),
        size: 280,
      },
      {
        id: 'role',
        accessorFn: (row) => row.role,
        header: ({ column }) => (
          <DataGridColumnHeader title="Role" column={column} />
        ),
        cell: ({ row }) => (
          <Badge
            size="sm"
            variant={row.original.role === 'PROPERTY_OWNER' ? 'primary' : 'secondary'}
            appearance="light"
          >
            {STAYCAY_ROLES.find((r) => r.value === row.original.role)?.label}
          </Badge>
        ),
        size: 160,
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
        id: 'lastLoginAt',
        accessorFn: (row) => row.lastLoginAt,
        header: ({ column }) => (
          <DataGridColumnHeader title="Last login" column={column} />
        ),
        cell: ({ row }) => row.original.lastLoginAt.slice(0, 10),
        size: 130,
      },
      {
        id: 'actions',
        header: () => null,
        cell: () => (
          <Button variant="ghost" mode="icon">
            <Trash2 className="text-destructive" />
          </Button>
        ),
        size: 60,
        enableSorting: false,
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
            title="Team Members"
            description={`Owners and staff for ${merchant.name}`}
          />
          <ToolbarActions>
            <Button>
              <Plus />
              Invite member
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
              <CardTitle>{merchant.name} · {allMembers.length} members</CardTitle>
              <CardToolbar className="relative">
                <Search className="size-4 text-muted-foreground absolute start-3 top-1/2 -translate-y-1/2" />
                <Input
                  placeholder="Search members..."
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
