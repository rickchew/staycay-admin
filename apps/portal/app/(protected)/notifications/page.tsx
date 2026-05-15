'use client';

import { Fragment, useMemo, useState } from 'react';
import {
  Bell,
  CalendarCheck,
  CalendarX,
  Check,
  CheckCircle2,
  CircleDot,
  CreditCard,
  LogIn,
  LogOut,
  Sparkles,
} from 'lucide-react';
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
  MOCK_NOTIFICATIONS,
  UNREAD_NOTIFICATION_COUNT,
  type NotificationType,
} from '@/lib/mock';

const ICONS: Record<NotificationType, typeof Bell> = {
  BOOKING_CREATED: Sparkles,
  BOOKING_CONFIRMED: CalendarCheck,
  BOOKING_CANCELLED: CalendarX,
  PAYMENT_RECEIVED: CreditCard,
  CHECK_IN: LogIn,
  CHECK_OUT: LogOut,
  CLEANING_DONE: CheckCircle2,
};

const COLORS: Record<NotificationType, string> = {
  BOOKING_CREATED: 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
  BOOKING_CONFIRMED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
  BOOKING_CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300',
  PAYMENT_RECEIVED: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
  CHECK_IN: 'bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300',
  CHECK_OUT: 'bg-gray-100 text-gray-700 dark:bg-gray-900/40 dark:text-gray-300',
  CLEANING_DONE: 'bg-teal-100 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300',
};

type Filter = 'all' | 'unread';

function relativeTime(iso: string) {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const m = Math.round((now - then) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  return `${d}d ago`;
}

export default function NotificationsPage() {
  const [filter, setFilter] = useState<Filter>('all');

  const notifications = useMemo(() => {
    const sorted = [...MOCK_NOTIFICATIONS].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return filter === 'unread' ? sorted.filter((n) => !n.isRead) : sorted;
  }, [filter]);

  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="Notifications"
            description={`${UNREAD_NOTIFICATION_COUNT} unread of ${MOCK_NOTIFICATIONS.length} total`}
          />
          <ToolbarActions>
            <Button variant="outline">
              <Check />
              Mark all read
            </Button>
          </ToolbarActions>
        </Toolbar>
      </Container>
      <Container>
        <Card>
          <CardHeader>
            <CardTitle>Inbox</CardTitle>
            <div className="flex gap-1.5">
              <Button
                size="sm"
                variant={filter === 'all' ? 'primary' : 'outline'}
                onClick={() => setFilter('all')}
              >
                All
              </Button>
              <Button
                size="sm"
                variant={filter === 'unread' ? 'primary' : 'outline'}
                onClick={() => setFilter('unread')}
              >
                Unread
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col p-0">
            {notifications.map((n, i) => {
              const Icon = ICONS[n.type];
              return (
                <div
                  key={n.id}
                  className={`flex items-start gap-3 px-5 py-4 hover:bg-accent/40 transition-colors ${i < notifications.length - 1 ? 'border-b border-border' : ''} ${!n.isRead ? 'bg-primary/5' : ''}`}
                >
                  <div className={`inline-flex h-9 w-9 items-center justify-center rounded-full ${COLORS[n.type]}`}>
                    <Icon size={16} />
                  </div>
                  <div className="flex flex-col gap-0.5 grow">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm ${!n.isRead ? 'font-semibold' : 'font-medium'} text-mono`}>
                        {n.title}
                      </span>
                      {!n.isRead && (
                        <CircleDot size={8} className="text-primary fill-primary" />
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground">{n.body}</span>
                    <span className="text-xs text-muted-foreground mt-0.5">
                      {relativeTime(n.createdAt)}
                    </span>
                  </div>
                  {!n.isRead && (
                    <Button variant="ghost" size="sm">
                      Mark read
                    </Button>
                  )}
                </div>
              );
            })}
            {notifications.length === 0 && (
              <div className="p-10 text-center text-muted-foreground text-sm">
                <Bell className="mx-auto mb-2 size-6" />
                You&apos;re all caught up.
              </div>
            )}
          </CardContent>
        </Card>
      </Container>
    </Fragment>
  );
}
