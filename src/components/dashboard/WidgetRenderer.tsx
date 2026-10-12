import type { WidgetId, WorkspaceConfig } from '@/types/workspace'

import { ActiveProjectsWidget }     from './widgets/ActiveProjectsWidget'
import { QuickCheckWidget }         from './widgets/QuickCheckWidget'
import { RecentReportsWidget }      from './widgets/RecentReportsWidget'
import { PortfolioOverviewWidget }  from './widgets/PortfolioOverviewWidget'
import { TenancyAlertsWidget }      from './widgets/TenancyAlertsWidget'
import { SiteFeasibilityWidget }    from './widgets/SiteFeasibilityWidget'
import { AgentUsageWidget }         from './widgets/AgentUsageWidget'
import { ClientListWidget }         from './widgets/ClientListWidget'
import { DraftingQueueWidget }      from './widgets/DraftingQueueWidget'
import { QaReviewQueueWidget }      from './widgets/QaReviewQueueWidget'
import { TeamSeatsWidget }          from './widgets/TeamSeatsWidget'
import { ApiUsageWidget }           from './widgets/ApiUsageWidget'
import { BulkImportWidget }         from './widgets/BulkImportWidget'
import { BillingSummaryWidget }     from './widgets/BillingSummaryWidget'
import { AgentMarketplaceWidget }   from './widgets/AgentMarketplaceWidget'

interface WidgetRendererProps {
  widgetId:  WidgetId
  workspace: WorkspaceConfig
}

/**
 * WidgetRenderer
 * ───────────────
 * Single dispatcher: given a WidgetId (from workspace.widgets) renders
 * the matching component. This is the ONLY place that maps widget data
 * to UI — DashboardPage just loops over workspace.widgets and calls this.
 *
 * No actor name, no tier name, no "if landlord show X" branching anywhere
 * in JSX — it's all driven by the WorkspaceConfig object resolved server-side.
 */
export function WidgetRenderer({ widgetId, workspace }: WidgetRendererProps) {
  switch (widgetId) {
    case 'activeProjects':     return <ActiveProjectsWidget />
    // case 'quickCheck':         return <QuickCheckWidget />
    case 'recentReports':      return <RecentReportsWidget />
    case 'portfolioOverview':  return <PortfolioOverviewWidget />
    case 'tenancyAlerts':      return <TenancyAlertsWidget />
    case 'siteFeasibility':    return <SiteFeasibilityWidget />
    case 'agentUsage':         return <AgentUsageWidget availableAgents={workspace.availableAgents} />
    case 'clientList':         return <ClientListWidget />
    case 'draftingQueue':      return <DraftingQueueWidget />
    case 'qaReviewQueue':      return <QaReviewQueueWidget />
    case 'teamSeats':          return <TeamSeatsWidget />
    case 'apiUsage':           return <ApiUsageWidget />
    case 'bulkImport':         return <BulkImportWidget />
    case 'billingSummary':     return <BillingSummaryWidget />
    case 'agentMarketplace':   return <AgentMarketplaceWidget availableAgents={workspace.availableAgents} />
    default:                   return null
  }
}
