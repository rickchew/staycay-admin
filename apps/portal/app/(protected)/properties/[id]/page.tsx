'use client';

import { Fragment, use } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, MapPin, Plus, SquarePen } from 'lucide-react';
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
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { MOCK_LISTINGS, MOCK_PROPERTIES } from '@/lib/mock';

export default function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const property = MOCK_PROPERTIES.find((p) => p.id === id);
  if (!property) notFound();

  const listings = MOCK_LISTINGS.filter((l) => l.propertyId === id);

  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title={property.name}
            description={
              <span className="inline-flex items-center gap-1.5">
                <MapPin size={14} />
                {property.address}, {property.city}, {property.state}{' '}
                {property.postcode}
              </span>
            }
          />
          <ToolbarActions>
            <Button variant="outline" asChild>
              <Link href="/properties">
                <ArrowLeft />
                Back
              </Link>
            </Button>
            <Button>
              <SquarePen />
              Edit property
            </Button>
          </ToolbarActions>
        </Toolbar>
      </Container>
      <Container>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 lg:gap-7.5">
          <div className="col-span-2 flex flex-col gap-5 lg:gap-7.5">
            <Card>
              <CardHeader>
                <CardTitle>Gallery</CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                {property.imageUrls.length > 0 ? (
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                    {property.imageUrls.map((url, i) => (
                      <img
                        key={i}
                        src={url}
                        alt={`${property.name} ${i + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-border"
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No images uploaded yet.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Listings ({listings.length})</CardTitle>
                <Button size="sm">
                  <Plus />
                  Add listing
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <Table className="text-sm">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Guests</TableHead>
                      <TableHead>Rate</TableHead>
                      <TableHead>Units</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {listings.map((l) => (
                      <TableRow key={l.id}>
                        <TableCell>
                          <Link
                            href={`/properties/${property.id}/listings/${l.id}`}
                            className="font-medium text-mono hover:text-primary"
                          >
                            {l.name}
                          </Link>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {l.maxGuests} max
                        </TableCell>
                        <TableCell className="text-foreground">
                          RM {l.dailyRate}/night
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {l.quantity}
                          {l.isSingle ? ' (single)' : ''}
                        </TableCell>
                        <TableCell>
                          <Badge
                            size="sm"
                            variant={l.isActive ? 'success' : 'secondary'}
                            appearance="light"
                          >
                            {l.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    {listings.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center text-muted-foreground py-8"
                        >
                          No listings yet for this property.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          <div className="col-span-1 flex flex-col gap-5 lg:gap-7.5">
            <Card>
              <CardHeader>
                <CardTitle>Details</CardTitle>
                <Badge
                  size="sm"
                  variant={property.isActive ? 'success' : 'secondary'}
                  appearance="light"
                >
                  {property.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 p-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Merchant
                  </span>
                  <span className="text-sm font-medium">
                    {property.merchantName}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Check-in
                  </span>
                  <span className="text-sm font-medium">
                    {property.checkInTime}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Check-out
                  </span>
                  <span className="text-sm font-medium">
                    {property.checkOutTime}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Postcode</span>
                  <span className="text-sm font-medium">
                    {property.postcode}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Added</span>
                  <span className="text-sm font-medium">
                    {property.createdAt.slice(0, 10)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Container>
    </Fragment>
  );
}
