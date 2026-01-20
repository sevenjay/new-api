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
import type { TFunction } from 'i18next'

import { processChartData } from '@/features/dashboard/lib'
import type {
  ProcessedChartData,
  QuotaDataItem,
} from '@/features/dashboard/types'
import { formatQuota } from '@/lib/format'
import type { TimeGranularity } from '@/lib/time'

import type { TokenQuotaDataItem } from '../types'

export function buildTokenAnalyticsChartData(
  data: TokenQuotaDataItem[],
  timeGranularity: TimeGranularity,
  t: TFunction,
  chartCornerRadius?: number
): ProcessedChartData {
  const dashboardData: QuotaDataItem[] = data.map((item) => ({
    model_name: item.token_name || t('Unknown'),
    created_at: item.created_at,
    token_used: item.token_used,
    count: item.count,
    quota: item.quota,
  }))
  const processed = processChartData(
    dashboardData,
    timeGranularity,
    t,
    chartCornerRadius
  )

  const quotaByToken = new Map<string, number>()
  dashboardData.forEach((item) => {
    const tokenName = item.model_name || t('Unknown')
    quotaByToken.set(
      tokenName,
      (quotaByToken.get(tokenName) ?? 0) + (Number(item.quota) || 0)
    )
  })
  const quotaValues = Array.from(quotaByToken, ([type, value]) => ({
    type,
    value,
  })).sort((a, b) => b.value - a.value)

  return {
    ...processed,
    spec_pie: {
      ...processed.spec_pie,
      data: [{ id: 'tokenQuotaDistribution', values: quotaValues }],
      title: {
        visible: true,
        text: t('Quota Distribution'),
      },
      legends: {
        visible: quotaValues.length > 0,
        orient: 'left',
      },
      color: processed.spec_line.color ?? processed.spec_pie.color,
      tooltip: {
        mark: {
          content: [
            {
              key: (datum: Record<string, unknown>) => datum.type,
              value: (datum: Record<string, unknown>) =>
                formatQuota(Number(datum.value) || 0),
            },
          ],
        },
      },
    },
    spec_line: {
      ...processed.spec_line,
      title: {
        visible: true,
        text: t('Quota Trend'),
      },
    },
  }
}
