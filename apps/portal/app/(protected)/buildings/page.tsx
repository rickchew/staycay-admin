'use client';

import { Fragment } from 'react';
import Link from 'next/link';
import { Building2, MapPin, Plus } from 'lucide-react';
import {
  Toolbar,
  ToolbarActions,
  ToolbarHeading,
} from '@/layouts/demo1/components/toolbar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Container } from '@/components/common/container';
import {
  MOCK_BUILDINGS,
  MOCK_LISTINGS,
  MOCK_PROPERTIES,
} from '@/lib/mock';

export default function BuildingsPage() {
  const cards = MOCK_BUILDINGS.map((b) => {
    const props = MOCK_PROPERTIES.filter((p) => p.buildingId === b.id);
    const listings = MOCK_LISTINGS.filter((l) =>
      props.some((p) => p.id === l.propertyId),
    );
    const owners = new Set(props.map((p) => p.merchantId)).size;
    const totalUnits = listings.reduce((s, l) => s + l.quantity, 0);
    return { b, props, listings, owners, totalUnits };
  });

  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="Buildings"
            description="Shared physical structures where one or more merchants operate"
          />
          <ToolbarActions>
            <Button>
              <Plus />
              Add building
            </Button>
          </ToolbarActions>
        </Toolbar>
      </Container>
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 lg:gap-7.5">
          {cards.map(({ b, props, owners, totalUnits, listings }) => (
            <Link
              key={b.id}
              href={`/buildings/${b.id}`}
              className="group"
            >
              <Card className="h-full group-hover:border-primary transition-colors">
                {b.sharedPhotos[0] && (
                  <img
                    src={b.sharedPhotos[0]}
                    alt={b.name}
                    className="w-full h-40 object-cover rounded-t-lg"
                  />
                )}
                <CardContent className="flex flex-col gap-3 p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col gap-1">
                      <span className="text-base font-semibold text-mono group-hover:text-primary">
                        {b.name}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin size={12} />
                        {b.city}, {b.state}
                      </span>
                    </div>
                    <Building2 className="size-5 text-muted-foreground shrink-0" />
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge size="sm" variant="primary" appearance="light">
                      {owners} owner{owners !== 1 ? 's' : ''}
                    </Badge>
                    <Badge size="sm" variant="secondary" appearance="light">
                      {props.length} propert{props.length !== 1 ? 'ies' : 'y'}
                    </Badge>
                    <Badge size="sm" variant="secondary" appearance="light">
                      {listings.length} listings
                    </Badge>
                    <Badge size="sm" variant="success" appearance="light">
                      {totalUnits} units
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground border-t border-border pt-3">
                    {b.totalFloors} floors · {b.parkingInfo}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </Container>
    </Fragment>
  );
}
