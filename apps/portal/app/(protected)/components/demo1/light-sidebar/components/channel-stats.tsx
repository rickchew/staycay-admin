import { Fragment } from 'react';
import { CalendarCheck, DollarSign, LogIn, BedDouble, type LucideIcon } from 'lucide-react';
import { toAbsoluteUrl } from '@/lib/helpers';
import { Card, CardContent } from '@/components/ui/card';
import { BOOKINGS_KPI } from '@/lib/mock';

interface IChannelStatsItem {
  Icon: LucideIcon;
  info: string;
  desc: string;
}
type IChannelStatsItems = Array<IChannelStatsItem>;

const ChannelStats = () => {
  const items: IChannelStatsItems = [
    {
      Icon: CalendarCheck,
      info: BOOKINGS_KPI.totalThisMonth.toString(),
      desc: 'Bookings this month',
    },
    {
      Icon: DollarSign,
      info: `RM ${(BOOKINGS_KPI.revenueThisMonth / 1000).toFixed(1)}k`,
      desc: 'Revenue this month',
    },
    {
      Icon: LogIn,
      info: BOOKINGS_KPI.upcomingCheckIns.toString(),
      desc: 'Upcoming check-ins (7d)',
    },
    {
      Icon: BedDouble,
      info: BOOKINGS_KPI.occupiedNow.toString(),
      desc: 'Occupied right now',
    },
  ];

  const renderItem = (item: IChannelStatsItem, index: number) => {
    const Icon = item.Icon;
    return (
      <Card key={index}>
        <CardContent className="p-0 flex flex-col justify-between gap-6 h-full bg-cover rtl:bg-[left_top_-1.7rem] bg-[right_top_-1.7rem] bg-no-repeat channel-stats-bg">
          <div className="mt-4 ms-5 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex flex-col gap-1 pb-4 px-5">
            <span className="text-3xl font-semibold text-mono">
              {item.info}
            </span>
            <span className="text-sm font-normal text-muted-foreground">
              {item.desc}
            </span>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Fragment>
      <style>
        {`
          .channel-stats-bg {
            background-image: url('${toAbsoluteUrl('/media/images/2600x1600/bg-3.png')}');
          }
          .dark .channel-stats-bg {
            background-image: url('${toAbsoluteUrl('/media/images/2600x1600/bg-3-dark.png')}');
          }
        `}
      </style>

      {items.map((item, index) => {
        return renderItem(item, index);
      })}
    </Fragment>
  );
};

export { ChannelStats, type IChannelStatsItem, type IChannelStatsItems };
