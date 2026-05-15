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
import { Building2, Plus, Search, X } from 'lucide-react';
import {
  Toolbar,
  ToolbarActions,
  ToolbarHeading,
} from '@/layouts/demo1/components/toolbar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
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
import { MOCK_LISTINGS, MOCK_PROPERTIES, type Listing } from '@/lib/mock';

type GroupMode = 'flat' | 'byProperty' | 'byBuilding';

type EnrichedListing = Listing & {
  buildingId: string | null;
  buildingName: string | null;
};

const ENRICHED: EnrichedListing[] = MOCK_LISTINGS.map((l) => {
  const property = MOCK_PROPERTIES.find((p) => p.id === l.propertyId);
  return {
    ...l,
    buildingId: property?.buildingId ?? null,
    buildingName: property?.buildingName ?? null,
  };
});

export default function ListingsPage() {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'rate', desc: true },
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [groupMode, setGroupMode] = useState<GroupMode>('flat');

  const filtered = useMemo(() => {
    if (!searchQuery) return ENRICHED;
    const q = searchQuery.toLowerCase();
    return ENRICHED.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.propertyName.toLowerCase().includes(q) ||
        (l.buildingName ?? '').toLowerCase().includes(q),
    );
  }, [searchQuery]);

  const columns = useMemo<ColumnDef<EnrichedListing>[]>(
    () => [
      {
        id: 'listing',
        accessorFn: (row) => row.name,
        header: ({ column }) => (
          <DataGridColumnHeader title="Listing" column={column} />
        ),
        cell: ({ row }) => (
          <div className="flex flex-col gap-1">
            <Link
              href={`/properties/${row.original.propertyId}/listings/${row.original.id}`}
              className="text-sm font-medium text-mono hover:text-primary"
            >
              {row.original.name}
            </Link>
            <div className="flex flex-wrap items-center gap-1.5">
              <Link
                href={`/properties/${row.original.propertyId}`}
                className="text-xs text-muted-foreground hover:text-primary"
              >
                {row.original.propertyName}
              </Link>
              {row.original.buildingId && (
                <Link href={`/buildings/${row.original.buildingId}`}>
                  <Badge
                    size="sm"
                    variant="secondary"
                    appearance="light"
                    className="gap-1"
                  >
                    <Building2 size={10} />
                    {row.original.buildingName}
                  </Badge>
                </Link>
              )}
            </div>
          </div>
        ),
        size: 320,
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

  // Grouped views
  const groupedByProperty = useMemo(() => {
    const map = new Map<string, { property: string; propertyId: string; rows: EnrichedListing[] }>();
    for (const l of filtered) {
      if (!map.has(l.propertyId)) {
        map.set(l.propertyId, { property: l.propertyName, propertyId: l.propertyId, rows: [] });
      }
      map.get(l.propertyId)!.rows.push(l);
    }
    return Array.from(map.values());
  }, [filtered]);

  const groupedByBuilding = useMemo(() => {
    const map = new Map<string, { name: string; buildingId: string | null; rows: EnrichedListing[] }>();
    for (const l of filtered) {
      const key = l.buildingId ?? 'standalone';
      const name = l.buildingName ?? 'Standalone (not in a building)';
      if (!map.has(key)) {
        map.set(key, { name, buildingId: l.buildingId, rows: [] });
      }
      map.get(key)!.rows.push(l);
    }
    return Array.from(map.values());
  }, [filtered]);

  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="Listings"
            description="Everything bookable across your portfolio"
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
            <CardHeader className="py-3.5 flex-wrap gap-3">
              <CardTitle>All listings</CardTitle>
              <CardToolbar className="flex items-center gap-2 flex-wrap">
                <div className="flex gap-1.5">
                  <Button
                    size="sm"
                    variant={groupMode === 'flat' ? 'primary' : 'outline'}
                    onClick={() => setGroupMode('flat')}
                  >
                    Flat
                  </Button>
                  <Button
                    size="sm"
                    variant={groupMode === 'byProperty' ? 'primary' : 'outline'}
                    onClick={() => setGroupMode('byProperty')}
                  >
                    By property
                  </Button>
                  <Button
                    size="sm"
                    variant={groupMode === 'byBuilding' ? 'primary' : 'outline'}
                    onClick={() => setGroupMode('byBuilding')}
                  >
                    By building
                  </Button>
                </div>
                <div className="relative">
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
                </div>
              </CardToolbar>
            </CardHeader>
            {groupMode === 'flat' && (
              <>
                <CardTable>
                  <ScrollArea>
                    <DataGridTable />
                    <ScrollBar orientation="horizontal" />
                  </ScrollArea>
                </CardTable>
                <CardFooter>
                  <DataGridPagination />
                </CardFooter>
              </>
            )}
            {groupMode === 'byProperty' && (
              <CardContent className="flex flex-col gap-5 p-5">
                {groupedByProperty.map((g) => (
                  <GroupSection
                    key={g.propertyId}
                    title={g.property}
                    href={`/properties/${g.propertyId}`}
                    rows={g.rows}
                  />
                ))}
              </CardContent>
            )}
            {groupMode === 'byBuilding' && (
              <CardContent className="flex flex-col gap-5 p-5">
                {groupedByBuilding.map((g) => (
                  <GroupSection
                    key={g.name}
                    title={g.name}
                    href={g.buildingId ? `/buildings/${g.buildingId}` : null}
                    rows={g.rows}
                  />
                ))}
              </CardContent>
            )}
          </Card>
        </DataGrid>
      </Container>
    </Fragment>
  );
}

function GroupSection({
  title,
  href,
  rows,
}: {
  title: string;
  href: string | null;
  rows: EnrichedListing[];
}) {
  const totalUnits = rows.reduce((s, r) => s + r.quantity, 0);
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between border-b border-border pb-2">
        {href ? (
          <Link href={href} className="text-sm font-semibold text-mono hover:text-primary">
            {title}
          </Link>
        ) : (
          <span className="text-sm font-semibold text-mono">{title}</span>
        )}
        <span className="text-xs text-muted-foreground">
          {rows.length} listings · {totalUnits} units
        </span>
      </div>
      <div className="flex flex-col gap-1">
        {rows.map((r) => (
          <Link
            key={r.id}
            href={`/properties/${r.propertyId}/listings/${r.id}`}
            className="flex items-center justify-between text-sm hover:bg-accent rounded-md px-2 py-1.5"
          >
            <span className="text-foreground">
              {r.name}
              <span className="text-xs text-muted-foreground ms-2">
                × {r.quantity}
              </span>
            </span>
            <span className="font-medium">RM {r.dailyRate}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
