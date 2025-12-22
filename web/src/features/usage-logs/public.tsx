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
import { useTranslation } from 'react-i18next'

import { PublicLayout } from '@/components/layout'

import { UsageLogsProvider } from './components/usage-logs-provider'
import { UsageLogsTable } from './components/usage-logs-table'

export function PublicUsageLogs() {
  const { t } = useTranslation()

  return (
    <UsageLogsProvider publicView>
      <PublicLayout>
        <div className='flex min-h-[calc(100svh-7rem)] flex-col gap-4 py-4'>
          <h1 className='text-2xl font-semibold tracking-tight'>
            {t('Public Logs')}
          </h1>
          <div className='min-h-0 flex-1'>
            <UsageLogsTable logCategory='common' />
          </div>
        </div>
      </PublicLayout>
    </UsageLogsProvider>
  )
}
