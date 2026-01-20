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
import { VChart } from '@visactor/react-vchart'
import { KeyRound } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { IconBadge } from '@/components/ui/icon-badge'
import { useThemeCustomization } from '@/context/theme-customization-provider'
import { useVChartLegendInteractions } from '@/features/dashboard/hooks/use-vchart-legend-interactions'
import { useThemeRadiusPx } from '@/lib/theme-radius'
import type { TimeGranularity } from '@/lib/time'
import { useChartTheme } from '@/lib/use-chart-theme'
import { VCHART_OPTION } from '@/lib/vchart'

import { buildTokenAnalyticsChartData } from '../lib/charts'
import type { TokenAnalyticsChartTab, TokenQuotaDataItem } from '../types'

interface TokenAnalyticsChartsProps {
  data: TokenQuotaDataItem[]
  loading: boolean
  timeGranularity: TimeGranularity
  onTokenClick: (tokenName: string) => void
}

const SPEC_BY_TAB = {
  'quota-distribution': 'spec_pie',
  'quota-trend': 'spec_line',
  'call-trend': 'spec_model_line',
  'call-ranking': 'spec_rank_bar',
} as const

export function TokenAnalyticsCharts(props: TokenAnalyticsChartsProps) {
  const { t } = useTranslation()
  const { resolvedTheme, themeReady } = useChartTheme()
  const { customization } = useThemeCustomization()
  const chartRadius = useThemeRadiusPx(
    '--radius-md',
    `${customization.preset}:${customization.radius}`
  )
  const { containerRef, handleChartReady } = useVChartLegendInteractions()
  const [activeTab, setActiveTab] =
    useState<TokenAnalyticsChartTab>('quota-distribution')
  const chartData = useMemo(
    () =>
      buildTokenAnalyticsChartData(
        props.loading ? [] : props.data,
        props.timeGranularity,
        t,
        chartRadius
      ),
    [chartRadius, props.data, props.loading, props.timeGranularity, t]
  )
  const spec = chartData[SPEC_BY_TAB[activeTab]]
  const tabs: Array<{ value: TokenAnalyticsChartTab; label: string }> = [
    { value: 'quota-distribution', label: t('Quota Distribution') },
    { value: 'quota-trend', label: t('Quota Trend') },
    { value: 'call-trend', label: t('Call Trend') },
    { value: 'call-ranking', label: t('Call Count Ranking') },
  ]

  const handleChartClick = (event: unknown) => {
    if (!event || typeof event !== 'object') return
    const datum = (event as { datum?: unknown }).datum
    if (!datum || typeof datum !== 'object') return
    const record = datum as { Model?: unknown; type?: unknown }
    const tokenName = record.Model ?? record.type
    if (
      typeof tokenName !== 'string' ||
      !tokenName ||
      tokenName === t('Other') ||
      tokenName === t('Unknown')
    ) {
      return
    }
    props.onTokenClick(tokenName)
  }

  return (
    <div className='overflow-hidden rounded-lg border'>
      <div className='flex w-full flex-col gap-2 border-b px-3 py-2 sm:px-5 sm:py-3 lg:flex-row lg:items-center lg:justify-between'>
        <div className='flex items-center gap-2'>
          <IconBadge tone='chart-4' size='sm'>
            <KeyRound />
          </IconBadge>
          <div className='text-sm font-semibold'>{t('Token Analysis')}</div>
        </div>
        <div className='bg-muted/60 inline-flex h-8 w-full overflow-x-auto rounded-lg border p-0.5 lg:w-auto'>
          {tabs.map((tab) => (
            <button
              key={tab.value}
              type='button'
              aria-pressed={activeTab === tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`shrink-0 rounded-md px-3 text-xs font-medium transition-colors ${
                activeTab === tab.value
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div ref={containerRef} className='h-[320px] p-1.5 sm:h-[440px] sm:p-2'>
        {themeReady && spec && (
          <VChart
            key={`${activeTab}-${resolvedTheme}-${props.loading}-${props.data.length}`}
            spec={{
              ...spec,
              theme: resolvedTheme === 'dark' ? 'dark' : 'light',
              background: 'transparent',
            }}
            option={VCHART_OPTION}
            onClick={handleChartClick}
            onReady={handleChartReady}
          />
        )}
      </div>
    </div>
  )
}
