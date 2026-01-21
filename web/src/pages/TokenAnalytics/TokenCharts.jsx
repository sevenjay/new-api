/*
Copyright (C) 2025 QuantumNous

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

import React from 'react';
import ChartsPanel from '../../components/dashboard/ChartsPanel';

const TokenCharts = (props) => {
  return (
    <ChartsPanel
      {...props}
      title={
        <div className={props.FLEX_CENTER_GAP2}>
          {/* We can use a different icon if we want, but keeping PieChart for now or maybe something else */}
          {props.t('令牌数据分析')}
        </div>
      }
    />
  );
};

export default TokenCharts;
