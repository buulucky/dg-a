"use client";

interface MonthlyData {
  month: string;
  newPOs: number;
  expiredPOs: number;
}

interface MonthlyChartProps {
  data: MonthlyData[];
}

export default function MonthlyChart({ data }: MonthlyChartProps) {
  // Format month for display (YYYY-MM to MMM YYYY)
  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('th-TH', { 
      month: 'short', 
      year: 'numeric' 
    });
  };

  // หาค่าสูงสุดเพื่อกำหนดความสูงของแท่งกราฟ
  const maxValue = Math.max(
    ...data.map(item => Math.max(item.newPOs, item.expiredPOs))
  );

  const getBarHeight = (value: number) => {
    return maxValue > 0 ? (value / maxValue) * 200 : 0;
  };

  return (
    <div className="w-full">
      <div className="flex items-end justify-between h-64 border-b border-l border-gray-200 relative">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-500 -ml-8">
          <span>{maxValue}</span>
          <span>{Math.floor(maxValue * 0.75)}</span>
          <span>{Math.floor(maxValue * 0.5)}</span>
          <span>{Math.floor(maxValue * 0.25)}</span>
          <span>0</span>
        </div>

        {/* Bars */}
        {data.map((item, index) => (
          <div key={`${item.month}-${index}`} className="flex flex-col items-center flex-1 px-1">
            <div className="flex items-end justify-center w-full mb-2" style={{ height: '200px' }}>
              {/* New POs Bar */}
              <div 
                className="bg-green-500 mx-0.5 rounded-t transition-all duration-300 hover:bg-green-600 relative group"
                style={{ 
                  height: `${getBarHeight(item.newPOs)}px`,
                  width: '20px',
                  minHeight: item.newPOs > 0 ? '2px' : '0'
                }}
                title={`เข้า: ${item.newPOs}`}
              >
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  เข้า: {item.newPOs}
                </div>
              </div>
              
              {/* Out Bar */}
              <div 
                className="bg-red-500 mx-0.5 rounded-t transition-all duration-300 hover:bg-red-600 relative group"
                style={{ 
                  height: `${getBarHeight(item.expiredPOs)}px`,
                  width: '20px',
                  minHeight: item.expiredPOs > 0 ? '2px' : '0'
                }}
                title={`ออก: ${item.expiredPOs}`}
              >
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  ออก: {item.expiredPOs}
                </div>
              </div>
            </div>
            
            {/* Month Label */}
            <div className="text-xs text-gray-600 text-center transform -rotate-45 w-16">
              {formatMonth(item.month)}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex justify-center space-x-6 mt-4">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
          <span className="text-sm text-gray-700">เข้า</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
          <span className="text-sm text-gray-700">ออก</span>
        </div>
      </div>
    </div>
  );
}
