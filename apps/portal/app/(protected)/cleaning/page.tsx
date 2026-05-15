'use client';

import { Fragment } from 'react';
import Link from 'next/link';
import {
  CalendarClock,
  CheckCircle2,
  PlayCircle,
  Sparkles,
  UserCircle,
  XCircle,
} from 'lucide-react';
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
  MOCK_CLEANING_LOGS,
  type CleaningLog,
  type CleaningStatus,
} from '@/lib/mock';

const COLUMNS: { status: CleaningStatus; label: string; color: string; icon: typeof CheckCircle2 }[] = [
  { status: 'PENDING', label: 'Pending', color: 'border-amber-500/40 bg-amber-50/40 dark:bg-amber-950/20', icon: CalendarClock },
  { status: 'IN_PROGRESS', label: 'In progress', color: 'border-blue-500/40 bg-blue-50/40 dark:bg-blue-950/20', icon: PlayCircle },
  { status: 'DONE', label: 'Done', color: 'border-emerald-500/40 bg-emerald-50/40 dark:bg-emerald-950/20', icon: CheckCircle2 },
  { status: 'SKIPPED', label: 'Skipped', color: 'border-gray-500/40 bg-gray-50/40 dark:bg-gray-900/20', icon: XCircle },
];

export default function CleaningPage() {
  const byStatus = COLUMNS.reduce<Record<CleaningStatus, CleaningLog[]>>(
    (acc, col) => {
      acc[col.status] = MOCK_CLEANING_LOGS.filter((c) => c.status === col.status);
      return acc;
    },
    { PENDING: [], IN_PROGRESS: [], DONE: [], SKIPPED: [] },
  );

  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="Cleaning"
            description="Auto-generated turn-around tasks after every check-out"
          />
          <ToolbarActions />
        </Toolbar>
      </Container>
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-5 lg:gap-7.5">
          {COLUMNS.map((col) => {
            const items = byStatus[col.status];
            const Icon = col.icon;
            return (
              <div key={col.status} className="flex flex-col gap-3">
                <div className={`flex items-center justify-between rounded-lg border ${col.color} px-4 py-2.5`}>
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-mono">
                    <Icon size={16} />
                    {col.label}
                  </span>
                  <Badge size="sm" variant="secondary" appearance="light">
                    {items.length}
                  </Badge>
                </div>
                <div className="flex flex-col gap-2.5">
                  {items.map((log) => (
                    <Card key={log.id} className="hover:border-primary transition-colors">
                      <CardContent className="flex flex-col gap-2 p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex flex-col">
                            <Link
                              href={`/bookings/${log.bookingId}`}
                              className="text-sm font-medium text-mono hover:text-primary"
                            >
                              {log.bookingRef}
                            </Link>
                            <span className="text-xs text-muted-foreground">
                              {log.propertyName} · {log.unitName}
                            </span>
                          </div>
                          <Sparkles size={14} className="text-muted-foreground shrink-0" />
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground border-t border-border pt-2">
                          <CalendarClock size={12} />
                          Scheduled for {log.scheduledFor}
                        </div>
                        {log.assignedToName && (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <UserCircle size={12} />
                            {log.assignedToName}
                          </div>
                        )}
                        {log.notes && (
                          <p className="text-xs text-foreground bg-muted/50 rounded px-2 py-1">
                            {log.notes}
                          </p>
                        )}
                        <div className="flex gap-1.5 mt-1">
                          {log.status === 'PENDING' && (
                            <Button size="sm" className="flex-1">
                              Start
                            </Button>
                          )}
                          {log.status === 'IN_PROGRESS' && (
                            <Button size="sm" className="flex-1">
                              Mark done
                            </Button>
                          )}
                          {(log.status === 'PENDING' || log.status === 'IN_PROGRESS') && (
                            <Button size="sm" variant="outline">
                              Skip
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {items.length === 0 && (
                    <Card>
                      <CardContent className="p-4 text-xs text-muted-foreground text-center">
                        Nothing here.
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </Fragment>
  );
}
