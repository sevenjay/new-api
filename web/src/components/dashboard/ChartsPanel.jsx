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

import React, { useRef, useCallback, useEffect } from 'react';
import { Card, Tabs, TabPane } from '@douyinfe/semi-ui';
import { PieChart } from 'lucide-react';
import { VChart } from '@visactor/react-vchart';

const ChartsPanel = ({
  activeChartTab,
  setActiveChartTab,
  spec_line,
  spec_model_line,
  spec_pie,
  spec_rank_bar,
  CARD_PROPS,
  CHART_CONFIG,
  FLEX_CENTER_GAP2,
  hasApiInfoPanel,
  t,
  onChartClick,
  title,
}) => {
  // 保存各個圖表實例
  const chartInstancesRef = useRef({});
  const containerRef = useRef(null);
  // 追蹤當前懸停的圖例項目
  const hoveredLegendItemRef = useRef(null);

  // 處理 auxclick (中鍵點擊) 事件
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleAuxClick = (e) => {
      // 檢查是否為中鍵點擊 (button === 1)
      if (e.button !== 1) return;

      // 如果有懸停的圖例項目，則執行 solo 操作
      const hoveredItem = hoveredLegendItemRef.current;
      if (hoveredItem) {
        e.preventDefault();
        e.stopPropagation();

        const chartInstance = chartInstancesRef.current[activeChartTab];
        if (chartInstance && hoveredItem.label) {
          chartInstance.setLegendSelectedDataByIndex(0, [hoveredItem.label]);
        }
      }
    };

    // 防止中鍵點擊導致 VChart 內部錯誤
    const preventMiddleClickPropagation = (e) => {
      if (e.button === 1 && hoveredLegendItemRef.current) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    // 使用 capture 階段來確保事件被捕獲
    container.addEventListener('auxclick', handleAuxClick, true);
    container.addEventListener('mousedown', preventMiddleClickPropagation, true);
    container.addEventListener('mouseup', preventMiddleClickPropagation, true);
    container.addEventListener('pointerdown', preventMiddleClickPropagation, true);
    container.addEventListener('pointerup', preventMiddleClickPropagation, true);

    return () => {
      container.removeEventListener('auxclick', handleAuxClick, true);
      container.removeEventListener('mousedown', preventMiddleClickPropagation, true);
      container.removeEventListener('mouseup', preventMiddleClickPropagation, true);
      container.removeEventListener('pointerdown', preventMiddleClickPropagation, true);
      container.removeEventListener('pointerup', preventMiddleClickPropagation, true);
    };
  }, [activeChartTab]);

  // onReady 回調，保存圖表實例並註冊圖例懸停事件
  const handleChartReady = useCallback(
    (tabKey) => (instance, isInitial) => {
      // 避免重複註冊事件
      if (chartInstancesRef.current[tabKey] === instance) {
        return;
      }
      chartInstancesRef.current[tabKey] = instance;

      // 監聽圖例項目懸停事件來追蹤當前懸停的項目
      instance.on('legendItemHover', (e) => {
        const label = e.value?.data?.label || e.value?.label;
        if (label) {
          hoveredLegendItemRef.current = { label, tabKey };
        }
      });

      instance.on('legendItemUnHover', () => {
        hoveredLegendItemRef.current = null;
      });
    },
    [],
  );

  // 無操作的 handleLegendItemClick - 左鍵點擊使用默認行為
  const handleLegendItemClick = (params) => {
    // 左鍵點擊保持默認的 toggle 行為，不需要額外處理
  };

  return (
    <Card
      {...CARD_PROPS}
      className={`!rounded-2xl ${hasApiInfoPanel ? 'lg:col-span-3' : ''}`}
      title={
        <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between w-full gap-3'>
          <div className={FLEX_CENTER_GAP2}>
            <PieChart size={16} />
            {title || t('模型数据分析')}
          </div>
          <Tabs
            type='slash'
            activeKey={activeChartTab}
            onChange={setActiveChartTab}
          >
            <TabPane tab={<span>{t('消耗分布')}</span>} itemKey='1' />
            <TabPane tab={<span>{t('消耗趋势')}</span>} itemKey='2' />
            <TabPane tab={<span>{t('调用次数分布')}</span>} itemKey='3' />
            <TabPane tab={<span>{t('调用次数排行')}</span>} itemKey='4' />
          </Tabs>
        </div>
      }
      bodyStyle={{ padding: 0 }}
    >
      <div className='h-96 p-2' ref={containerRef}>
        {activeChartTab === '1' && (
          <VChart
            spec={spec_line}
            option={CHART_CONFIG}
            onClick={onChartClick}
            onLegendItemClick={handleLegendItemClick}
            onReady={handleChartReady('1')}
          />
        )}
        {activeChartTab === '2' && (
          <VChart
            spec={spec_model_line}
            option={CHART_CONFIG}
            onClick={onChartClick}
            onLegendItemClick={handleLegendItemClick}
            onReady={handleChartReady('2')}
          />
        )}
        {activeChartTab === '3' && (
          <VChart
            spec={spec_pie}
            option={CHART_CONFIG}
            onClick={onChartClick}
            onLegendItemClick={handleLegendItemClick}
            onReady={handleChartReady('3')}
          />
        )}
        {activeChartTab === '4' && (
          <VChart
            spec={spec_rank_bar}
            option={CHART_CONFIG}
            onClick={onChartClick}
            onLegendItemClick={handleLegendItemClick}
            onReady={handleChartReady('4')}
          />
        )}
      </div>
    </Card>
  );
};

export default ChartsPanel;
