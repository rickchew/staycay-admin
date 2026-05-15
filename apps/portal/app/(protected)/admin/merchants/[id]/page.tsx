'use client';

import { Fragment, use } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Mail, MapPin, Phone, SquarePen } from 'lucide-react';
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
  TableRow,
} from '@/components/ui/table';
import {
  MOCK_MERCHANTS,
  MOCK_PROPERTIES,
  MOCK_USERS,
} from '@/lib/mock';

export default function AdminMerchantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const merchant = MOCK_MERCHANTS.find((m) => m.id === id);

  if (!merchant) notFound();

  const properties = MOCK_PROPERTIES.filter((p) => p.merchantId === id);
  const members = MOCK_USERS.filter((u) => u.merchantId === id);

  const InfoRow = ({
    label,
    value,
  }: {
    label: string;
    value: React.ReactNode;
  }) => (
    <TableRow>
      <TableCell className="min-w-48 text-secondary-foreground font-normal">
        {label}
      </TableCell>
      <TableCell className="text-foreground font-normal">{value}</TableCell>
      <TableCell className="min-w-16 text-center">
        <Button variant="ghost" mode="icon">
          <SquarePen size={16} className="text-blue-500" />
        </Button>
      </TableCell>
    </TableRow>
  );

  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title={merchant.name}
            description={`${merchant.city} · ${properties.length} properties · ${members.length} members`}
          />
          <ToolbarActions>
            <Button variant="outline" asChild>
              <Link href="/admin/merchants">
                <ArrowLeft />
                Back to list
              </Link>
            </Button>
            <Button>
              <SquarePen />
              Edit merchant
            </Button>
          </ToolbarActions>
        </Toolbar>
      </Container>
      <Container>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 lg:gap-7.5">
          <div className="col-span-2 flex flex-col gap-5 lg:gap-7.5">
            <Card>
              <CardHeader>
                <CardTitle>General info</CardTitle>
                <Badge
                  size="sm"
                  variant={merchant.isActive ? 'success' : 'secondary'}
                  appearance="light"
                >
                  {merchant.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </CardHeader>
              <CardContent className="p-0">
                <Table className="text-sm text-muted-foreground">
                  <TableBody>
                    <InfoRow label="Business name" value={merchant.name} />
                    <InfoRow label="Slug" value={merchant.slug} />
                    <InfoRow
                      label="Contact email"
                      value={
                        <span className="inline-flex items-center gap-1.5">
                          <Mail size={14} className="text-muted-foreground" />
                          {merchant.email}
                        </span>
                      }
                    />
                    <InfoRow
                      label="Phone"
                      value={
                        <span className="inline-flex items-center gap-1.5">
                          <Phone size={14} className="text-muted-foreground" />
                          {merchant.phone}
                        </span>
                      }
                    />
                    <InfoRow
                      label="City"
                      value={
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin size={14} className="text-muted-foreground" />
                          {merchant.city}
                        </span>
                      }
                    />
                    <InfoRow
                      label="Joined"
                      value={merchant.createdAt.slice(0, 10)}
                    />
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Properties ({properties.length})</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table className="text-sm">
                  <TableBody>
                    {properties.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium text-mono">
                          {p.name}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {p.city}, {p.state}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {p.listingsCount} listings
                        </TableCell>
                        <TableCell>
                          <Badge
                            size="sm"
                            variant={p.isActive ? 'success' : 'secondary'}
                            appearance="light"
                          >
                            {p.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          <div className="col-span-1 flex flex-col gap-5 lg:gap-7.5">
            <Card>
              <CardHeader>
                <CardTitle>Members ({members.length})</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 p-5">
                {members.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src={m.avatarUrl}
                        className="w-9 h-9 rounded-full border border-border"
                        alt={m.name}
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-mono">
                          {m.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {m.email}
                        </span>
                      </div>
                    </div>
                    <Badge
                      size="sm"
                      variant={
                        m.role === 'PROPERTY_OWNER' ? 'primary' : 'secondary'
                      }
                      appearance="light"
                    >
                      {m.role === 'PROPERTY_OWNER' ? 'Owner' : 'Staff'}
                    </Badge>
                  </div>
                ))}
                {members.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No members yet.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </Container>
    </Fragment>
  );
}
