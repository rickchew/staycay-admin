import Link from 'next/link';
import { CalendarCheck, MapPin, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { MOCK_BOOKINGS } from '@/lib/mock';

const TeamMeeting = () => {
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = MOCK_BOOKINGS.filter((b) => b.status === 'CONFIRMED' && b.checkIn >= today)
    .sort((a, b) => a.checkIn.localeCompare(b.checkIn))[0];

  return (
    <Card className="h-full">
      <CardContent className="grow lg:p-7.5 lg:pt-6 p-5">
        <div className="flex items-center justify-between flex-wrap gap-5 mb-7.5">
          <div className="flex flex-col gap-1">
            <span className="text-xl font-semibold text-mono">
              Next Check-In
            </span>
            <span className="text-sm font-semibold text-foreground">
              {upcoming ? `${upcoming.checkIn} · ${upcoming.nights}n` : 'No upcoming arrivals'}
            </span>
          </div>
          <CalendarCheck className="size-7 text-primary" />
        </div>
        <p className="text-sm font-normal text-foreground leading-5.5 mb-8">
          {upcoming
            ? `${upcoming.guestName} arriving at ${upcoming.propertyName}.`
            : 'No confirmed arrivals scheduled — check pending bookings to follow up.'}
        </p>
        <div className="flex rounded-lg bg-accent/50 gap-10 p-5">
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-1.5 text-sm font-normal text-foreground">
              <MapPin size={16} className="text-base text-muted-foreground" />
              Property
            </div>
            <div className="text-sm font-medium text-foreground pt-1.5">
              {upcoming?.propertyName ?? '—'}
            </div>
          </div>
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-1.5 text-sm font-normal text-foreground">
              <Users size={16} className="text-base text-muted-foreground" />
              Unit
            </div>
            <div className="text-sm font-medium text-foreground pt-1.5">
              {upcoming?.unitName ?? '—'}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="justify-center">
        <Button mode="link" underlined="dashed" asChild>
          <Link href={upcoming ? `/bookings/${upcoming.id}` : '/bookings'}>
            {upcoming ? 'View booking' : 'View bookings'}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export { TeamMeeting };
