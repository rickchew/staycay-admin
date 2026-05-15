'use client';

import { Fragment, useCallback, useState } from 'react';
import Link from 'next/link';
import {
  CalendarClock,
  CheckCircle2,
  GripVertical,
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
  Kanban,
  KanbanBoard,
  KanbanColumn,
  KanbanColumnContent,
  KanbanItem,
  KanbanItemHandle,
  KanbanOverlay,
} from '@/components/ui/kanban';
import {
  MOCK_CLEANING_LOGS,
  type CleaningLog,
  type CleaningStatus,
} from '@/lib/mock';

type ColumnsState = Record<CleaningStatus, CleaningLog[]>;

const COLUMNS: { status: CleaningStatus; label: string; color: string; icon: typeof CheckCircle2 }[] = [
  { status: 'PENDING', label: 'Pending', color: 'border-amber-500/40 bg-amber-50/40 dark:bg-amber-950/20', icon: CalendarClock },
  { status: 'IN_PROGRESS', label: 'In progress', color: 'border-blue-500/40 bg-blue-50/40 dark:bg-blue-950/20', icon: PlayCircle },
  { status: 'DONE', label: 'Done', color: 'border-emerald-500/40 bg-emerald-50/40 dark:bg-emerald-950/20', icon: CheckCircle2 },
  { status: 'SKIPPED', label: 'Skipped', color: 'border-gray-500/40 bg-gray-50/40 dark:bg-gray-900/20', icon: XCircle },
];

function initialColumns(): ColumnsState {
  return COLUMNS.reduce((acc, col) => {
    acc[col.status] = MOCK_CLEANING_LOGS.filter((c) => c.status === col.status);
    return acc;
  }, {} as ColumnsState);
}

export default function CleaningPage() {
  const [columns, setColumns] = useState<ColumnsState>(initialColumns);

  const moveLog = useCallback(
    (logId: string, toStatus: CleaningStatus) => {
      setColumns((prev) => {
        let log: CleaningLog | undefined;
        const next: ColumnsState = { PENDING: [], IN_PROGRESS: [], DONE: [], SKIPPED: [] };
        (Object.keys(prev) as CleaningStatus[]).forEach((key) => {
          next[key] = prev[key].filter((l) => {
            if (l.id === logId) {
              log = l;
              return false;
            }
            return true;
          });
        });
        if (log) next[toStatus] = [{ ...log, status: toStatus }, ...next[toStatus]];
        return next;
      });
    },
    [],
  );

  const total = (Object.values(columns) as CleaningLog[][]).reduce((s, arr) => s + arr.length, 0);

  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="Cleaning"
            description={`${total} auto-generated turn-around tasks · drag cards between columns to update status`}
          />
          <ToolbarActions />
        </Toolbar>
      </Container>
      <Container>
        <Kanban<CleaningLog>
          value={columns as Record<string, CleaningLog[]>}
          onValueChange={(next) => setColumns(next as ColumnsState)}
          getItemValue={(log) => log.id}
        >
          <KanbanBoard className="grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-5 lg:gap-7.5">
            {COLUMNS.map((col) => {
              const Icon = col.icon;
              const items = columns[col.status];
              return (
                <KanbanColumn key={col.status} value={col.status} className="gap-3">
                  <div
                    className={`flex items-center justify-between rounded-lg border ${col.color} px-4 py-2.5`}
                  >
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-mono">
                      <Icon size={16} />
                      {col.label}
                    </span>
                    <Badge size="sm" variant="secondary" appearance="light">
                      {items.length}
                    </Badge>
                  </div>
                  <KanbanColumnContent value={col.status} className="gap-2.5 min-h-[80px]">
                    {items.map((log) => (
                      <KanbanItem
                        key={log.id}
                        value={log.id}
                        className="touch-none"
                      >
                        <CleaningCard
                          log={log}
                          columnStatus={col.status}
                          onMove={moveLog}
                        />
                      </KanbanItem>
                    ))}
                    {items.length === 0 && (
                      <Card>
                        <CardContent className="p-4 text-xs text-muted-foreground text-center">
                          Drop a card here.
                        </CardContent>
                      </Card>
                    )}
                  </KanbanColumnContent>
                </KanbanColumn>
              );
            })}
          </KanbanBoard>
          <KanbanOverlay>
            {({ value }) => {
              const log = (Object.values(columns) as CleaningLog[][])
                .flat()
                .find((l) => l.id === value);
              if (!log) return null;
              return (
                <CleaningCard log={log} columnStatus={log.status} onMove={() => {}} />
              );
            }}
          </KanbanOverlay>
        </Kanban>
      </Container>
    </Fragment>
  );
}

function CleaningCard({
  log,
  columnStatus,
  onMove,
}: {
  log: CleaningLog;
  columnStatus: CleaningStatus;
  onMove: (id: string, to: CleaningStatus) => void;
}) {
  return (
    <Card className="hover:border-primary transition-colors">
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
          <div className="flex items-center gap-1 shrink-0">
            <Sparkles size={14} className="text-muted-foreground" />
            <KanbanItemHandle className="opacity-40 hover:opacity-100">
              <GripVertical size={14} />
            </KanbanItemHandle>
          </div>
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
          {columnStatus === 'PENDING' && (
            <Button size="sm" className="flex-1" onClick={() => onMove(log.id, 'IN_PROGRESS')}>
              Start
            </Button>
          )}
          {columnStatus === 'IN_PROGRESS' && (
            <Button size="sm" className="flex-1" onClick={() => onMove(log.id, 'DONE')}>
              Mark done
            </Button>
          )}
          {(columnStatus === 'PENDING' || columnStatus === 'IN_PROGRESS') && (
            <Button size="sm" variant="outline" onClick={() => onMove(log.id, 'SKIPPED')}>
              Skip
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
