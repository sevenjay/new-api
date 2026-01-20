/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { RefreshCw } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ErrorState } from '@/components/error-state'
import { SectionPageLayout } from '@/components/layout'
import { FadeIn } from '@/components/page-transition'
import { Button } from '@/components/ui/button'
import { ModelsFilter } from '@/features/dashboard/components/models/models-filter-dialog'
import { DEFAULT_TIME_GRANULARITY } from '@/features/dashboard/constants'
import {
  buildDefaultDashboardFilters,
  buildQueryParams,
  getDefaultDays,
  getSavedChartPreferences,
} from '@/features/dashboard/lib'
import type {
  DashboardChartPreferences,
  DashboardFilters,
} from '@/features/dashboard/types'
import { ROLE } from '@/lib/roles'
import { computeTimeRange } from '@/lib/time'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth-store'

import { getTokenQuotaDates } from './api'
import { TokenAnalyticsCharts } from './components/token-analytics-charts'
import { TokenAnalyticsStats } from './components/token-analytics-stats'

export function TokenAnalytics() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const userRole = useAuthStore((state) => state.auth.user?.role)
  const isAdmin = Boolean(userRole && userRole >= ROLE.ADMIN)
  const [preferences] = useState<DashboardChartPreferences>(() =>
    getSavedChartPreferences()
  )
  const [filters, setFilters] = useState<DashboardFilters>(() =>
    buildDefaultDashboardFilters(preferences)
  )
  const queryParams = useMemo(() => {
    const range = computeTimeRange(
      getDefaultDays(filters.time_granularity),
      filters.start_timestamp,
      filters.end_timestamp
    )
    const params = buildQueryParams(range, filters)
    return {
      start_timestamp: params.start_timestamp,
      end_timestamp: params.end_timestamp,
      default_time: params.default_time,
      ...(params.username && { username: params.username }),
    }
  }, [filters])
  const analyticsQuery = useQuery({
    queryKey: ['token-analytics', isAdmin, queryParams],
    queryFn: () => getTokenQuotaDates(queryParams, isAdmin),
  })

  const handleResetFilters = () => {
    setFilters(buildDefaultDashboardFilters(preferences))
  }
  const handleTokenClick = (tokenName: string) => {
    void navigate({
      to: '/dashboard/$section',
      params: { section: 'models' },
      search: { token_name: tokenName },
    })
  }

  return (
    <SectionPageLayout>
      <SectionPageLayout.Title>{t('Token Analysis')}</SectionPageLayout.Title>
      <SectionPageLayout.Actions>
        <ModelsFilter
          preferences={preferences}
          currentFilters={filters}
          onFilterChange={setFilters}
          onReset={handleResetFilters}
          titleKey='Token Analytics Filters'
          descriptionKey='Filter token analytics by time range and user.'
        />
        <Button
          variant='outline'
          size='sm'
          disabled={analyticsQuery.isFetching}
          onClick={() => void analyticsQuery.refetch()}
        >
          <RefreshCw
            className={cn(
              'mr-2 size-4',
              analyticsQuery.isFetching && 'animate-spin'
            )}
          />
          {t('Refresh')}
        </Button>
      </SectionPageLayout.Actions>
      <SectionPageLayout.Content>
        {analyticsQuery.isError && !analyticsQuery.data ? (
          <ErrorState
            description={
              analyticsQuery.error instanceof Error
                ? analyticsQuery.error.message
                : t('Failed to load')
            }
            onRetry={() => void analyticsQuery.refetch()}
          />
        ) : (
          <div className='space-y-3 sm:space-y-4'>
            <FadeIn>
              <TokenAnalyticsStats
                data={analyticsQuery.data ?? []}
                loading={analyticsQuery.isLoading}
              />
            </FadeIn>
            <FadeIn delay={0.05}>
              <TokenAnalyticsCharts
                data={analyticsQuery.data ?? []}
                loading={analyticsQuery.isLoading}
                timeGranularity={
                  filters.time_granularity ?? DEFAULT_TIME_GRANULARITY
                }
                onTokenClick={handleTokenClick}
              />
            </FadeIn>
          </div>
        )}
      </SectionPageLayout.Content>
    </SectionPageLayout>
  )
}
