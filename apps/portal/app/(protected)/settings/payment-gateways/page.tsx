'use client';

import { Fragment } from 'react';
import {
  CheckCircle2,
  CreditCard,
  Plug,
  Plus,
  ShieldCheck,
  SquarePen,
  TestTube2,
  Trash2,
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
import { MOCK_GATEWAY_CONFIGS, type GatewayConfig } from '@/lib/mock';

type Gateway = {
  code: 'BILLPLZ' | 'FIUU' | 'STRIPE';
  name: string;
  description: string;
  status: 'available' | 'roadmap';
};

const SUPPORTED_GATEWAYS: Gateway[] = [
  {
    code: 'BILLPLZ',
    name: 'Billplz',
    description: 'FPX (Malaysian online banking) and card payments. Most popular for MY merchants.',
    status: 'available',
  },
  {
    code: 'FIUU',
    name: 'Fiuu (formerly Molpay)',
    description: 'Cards, e-wallets, and bank transfers. Wider e-wallet coverage.',
    status: 'available',
  },
  {
    code: 'STRIPE',
    name: 'Stripe',
    description: 'International cards. Roadmap — added in Stage 2 alongside the customer site.',
    status: 'roadmap',
  },
];

export default function PaymentGatewaysPage() {
  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="Payment Gateways"
            description="Connect online payment providers used to collect deposits and balances"
          />
          <ToolbarActions>
            <Button>
              <Plus />
              Add gateway
            </Button>
          </ToolbarActions>
        </Toolbar>
      </Container>
      <Container>
        <div className="flex flex-col gap-5 lg:gap-7.5">
          <Card>
            <CardHeader>
              <CardTitle>Connected gateways</CardTitle>
              <Badge size="sm" variant="success" appearance="light" className="gap-1">
                <ShieldCheck size={10} />
                Credentials encrypted at rest
              </Badge>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 p-5">
              {MOCK_GATEWAY_CONFIGS.map((cfg) => (
                <GatewayRow key={cfg.id} config={cfg} />
              ))}
              {MOCK_GATEWAY_CONFIGS.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No gateways connected yet. Add one to start accepting online payments.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Available gateways</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-5">
              {SUPPORTED_GATEWAYS.map((g) => (
                <Card key={g.code} className="border-dashed">
                  <CardContent className="flex flex-col gap-3 p-5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <CreditCard size={18} />
                      </div>
                      {g.status === 'roadmap' && (
                        <Badge size="sm" variant="secondary" appearance="light">
                          Stage 2
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-base font-semibold text-mono">{g.name}</span>
                      <p className="text-sm text-muted-foreground">{g.description}</p>
                    </div>
                    <Button
                      variant={g.status === 'available' ? 'primary' : 'outline'}
                      size="sm"
                      disabled={g.status === 'roadmap'}
                      className="mt-1"
                    >
                      <Plug />
                      {g.status === 'available' ? 'Connect' : 'Coming soon'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </div>
      </Container>
    </Fragment>
  );
}

function GatewayRow({ config }: { config: GatewayConfig }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border p-4">
      <div className="flex items-center gap-3">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <CreditCard size={18} />
        </div>
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-mono">{config.label}</span>
            {config.isDefault && (
              <Badge size="sm" variant="primary" appearance="light" className="gap-1">
                <CheckCircle2 size={10} />
                Default
              </Badge>
            )}
            <Badge
              size="sm"
              variant={config.isActive ? 'success' : 'secondary'}
              appearance="light"
            >
              {config.isActive ? 'Active' : 'Paused'}
            </Badge>
          </div>
          <span className="text-xs text-muted-foreground font-mono">
            {config.gateway} · {config.maskedKey}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <Button variant="outline" size="sm">
          <TestTube2 />
          Test
        </Button>
        {!config.isDefault && (
          <Button variant="outline" size="sm">
            Set default
          </Button>
        )}
        <Button variant="ghost" mode="icon">
          <SquarePen size={16} className="text-blue-500" />
        </Button>
        <Button variant="ghost" mode="icon">
          <Trash2 size={16} className="text-destructive" />
        </Button>
      </div>
    </div>
  );
}
