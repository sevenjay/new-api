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
import { describe, expect, test } from 'vitest'

import { CHANNEL_TYPE_TYPESAFE } from '../../constants'
import { channelSchema } from '../../types'
import {
  buildSettingJSON,
  CHANNEL_FORM_DEFAULT_VALUES,
  transformChannelToFormDefaults,
} from '../channel-form'

describe('TypeSafe decisions settings', () => {
  test('saving an OpenRouter path trims whitespace and survives reopening the form', () => {
    const setting = buildSettingJSON({
      ...CHANNEL_FORM_DEFAULT_VALUES,
      type: CHANNEL_TYPE_TYPESAFE,
      decisions_upstream_path: ' /alpha/decisions ',
    })
    expect(JSON.parse(setting).decisions_upstream_path).toBe('/alpha/decisions')

    const channel = channelSchema.parse({
      id: 1,
      type: CHANNEL_TYPE_TYPESAFE,
      key: '',
      status: 1,
      name: 'Jev via OpenRouter',
      created_time: 0,
      test_time: 0,
      response_time: 0,
      balance_updated_time: 0,
      setting,
    })
    expect(transformChannelToFormDefaults(channel).decisions_upstream_path).toBe(
      '/alpha/decisions'
    )
  })

  test('an empty path retains the native TypeSafe endpoint default', () => {
    const setting = buildSettingJSON({
      ...CHANNEL_FORM_DEFAULT_VALUES,
      type: CHANNEL_TYPE_TYPESAFE,
      decisions_upstream_path: ' ',
    })
    expect(JSON.parse(setting).decisions_upstream_path).toBe('')
  })

  test('switching to another provider clears the decisions path on save', () => {
    const setting = buildSettingJSON({
      ...CHANNEL_FORM_DEFAULT_VALUES,
      type: 1,
      decisions_upstream_path: '/alpha/decisions',
    })
    expect(JSON.parse(setting).decisions_upstream_path).toBe('')
  })
})
