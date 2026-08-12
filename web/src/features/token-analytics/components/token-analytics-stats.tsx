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
import { Activity, Coins, Sigma } from 'lucide-react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { IconBadge } from '@/components/ui/icon-badge'
import { Skeleton } from '@/components/ui/skeleton'
import { toIntlLocale } from '@/i18n/languages'
import { formatNumber, formatQuota } from '@/lib/format'

import type { TokenQuotaDataItem } from '../types'

interface TokenAnalyticsStatsProps {
  data: TokenQuotaDataItem[]
  loading: boolean
}

export function TokenAnalyticsStats(props: TokenAnalyticsStatsProps) {
  const { t, i18n } = useTranslation()
  const locale = toIntlLocale(i18n.resolvedLanguage || i18n.language)
  const totals = useMemo(
    () =>
      props.data.reduce(
        (result, item) => ({
          count: result.count + (Number(item.count) || 0),
          quota: result.quota + (Number(item.quota) || 0),
          tokens: result.tokens + (Number(item.token_used) || 0),
        }),
        { count: 0, quota: 0, tokens: 0 }
      ),
    [props.data]
  )
  const stats = [
    {
      key: 'requests',
      title: t('Request Count'),
      value: formatNumber(totals.count, locale),
      icon: Activity,
      tone: 'info' as const,
    },
    {
      key: 'quota',
      title: t('Quota'),
      value: formatQuota(totals.quota),
      icon: Coins,
      tone: 'success' as const,
    },
    {
      key: 'tokens',
      title: t('Total Tokens'),
      value: formatNumber(totals.tokens, locale),
      icon: Sigma,
      tone: 'chart-4' as const,
    },
  ]

  return (
    <div className='grid overflow-hidden rounded-lg border sm:grid-cols-3 sm:divide-x'>
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <div
            key={stat.key}
            className='border-b px-4 py-3 last:border-b-0 sm:border-b-0 sm:px-5 sm:py-4'
          >
            <div className='flex items-center gap-2'>
              <IconBadge tone={stat.tone} size='stat'>
                <Icon />
              </IconBadge>
              <span className='text-muted-foreground text-xs font-medium tracking-wide uppercase'>
                {stat.title}
              </span>
            </div>
            {props.loading ? (
              <Skeleton className='mt-2 h-7 w-24' />
            ) : (
              <div
                className='mt-2 truncate font-mono text-2xl font-bold tracking-tight tabular-nums'
                title={stat.value}
              >
                {stat.value}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
