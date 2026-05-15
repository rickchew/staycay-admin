import { DropdownMenu4 } from '@/partials/dropdown-menu/dropdown-menu-4';
import { type RemixiconComponentType } from '@remixicon/react';
import { EllipsisVertical, type LucideIcon } from 'lucide-react';
import { Badge, BadgeDot } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CHANNEL_MIX } from '@/lib/mock';

interface IHighlightsRow {
  icon: LucideIcon | RemixiconComponentType;
  text: string;
  total: number;
  stats: number;
  increase: boolean;
}
type IHighlightsRows = Array<IHighlightsRow>;

interface IHighlightsItem {
  badgeColor: string;
  label: string;
}
type IHighlightsItems = Array<IHighlightsItem>;

interface IHighlightsProps {
  limit?: number;
}

const Highlights = ({ limit: _limit }: IHighlightsProps) => {
  const totalBookings = CHANNEL_MIX.reduce((s, c) => s + c.bookings, 0);
  const totalRevenue = CHANNEL_MIX.reduce((s, c) => s + c.revenue, 0);

  const bars = CHANNEL_MIX.filter((c) => c.bookings > 0).map((c) => ({
    color: c.channel.color,
    label: c.channel.name,
    bookings: c.bookings,
    revenue: c.revenue,
    pct: totalBookings > 0 ? (c.bookings / totalBookings) * 100 : 0,
  }));

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Channel mix</CardTitle>
        <DropdownMenu4
          trigger={
            <Button variant="ghost" mode="icon">
              <EllipsisVertical />
            </Button>
          }
        />
      </CardHeader>
      <CardContent className="flex flex-col gap-4 p-5 lg:p-7.5 lg:pt-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-normal text-secondary-foreground">
            Bookings · Paid revenue this period
          </span>
          <div className="flex items-center gap-2.5">
            <span className="text-3xl font-semibold text-mono">
              RM {(totalRevenue / 1000).toFixed(1)}k
            </span>
            <Badge size="sm" variant="success" appearance="light">
              {totalBookings} bookings
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-1 mb-1.5 h-2">
          {bars.map((b) => (
            <div
              key={b.label}
              className={`${b.color} h-full rounded-xs`}
              style={{ width: `${b.pct}%` }}
              title={`${b.label} · ${b.bookings} bookings`}
            />
          ))}
        </div>
        <div className="flex flex-col gap-2">
          {bars.map((b) => (
            <div key={b.label} className="flex items-center justify-between text-sm">
              <span className="inline-flex items-center gap-1.5 text-foreground">
                <span className={`h-2 w-2 rounded-full ${b.color}`} />
                {b.label}
              </span>
              <span className="flex items-center gap-4 text-muted-foreground">
                <span>{b.bookings}</span>
                <span className="text-foreground font-medium">
                  RM {(b.revenue / 1000).toFixed(1)}k
                </span>
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export {
  Highlights,
  type IHighlightsRow,
  type IHighlightsRows,
  type IHighlightsItem,
  type IHighlightsItems,
  type IHighlightsProps,
};
