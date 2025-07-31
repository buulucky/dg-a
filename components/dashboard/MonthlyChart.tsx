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
  // สร้างข้อมูل 6 เดือนย้อนหลังแบบต่อเนื่อง
  const generateContinuousMonths = () => {
    const result: MonthlyData[] = [];
    const dataMap = new Map<string, MonthlyData>();
    
    // สร้าง Map จากข้อมูลที่ได้รับ
    data.forEach(item => {
      dataMap.set(item.month, item);
    });
    
    // สร้าง 6 เดือนย้อนหลังแบบต่อเนื่อง
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-based (July = 6)
    
    for (let i = 5; i >= 0; i--) {
      // คำนวณเดือนและปีที่ต้องการ
      let targetMonth = currentMonth - i;
      let targetYear = currentYear;
      
      // จัดการกรณีที่เดือนติดลบ (ข้ามปี)
      while (targetMonth < 0) {
        targetMonth += 12;
        targetYear -= 1;
      }
      
      // สร้างรูปแบบ YYYY-MM
      const monthStr = `${targetYear}-${String(targetMonth + 1).padStart(2, '0')}`;
      
      // ใช้ข้อมูลที่มี หรือสร้างใหม่เป็น 0
      const existingData = dataMap.get(monthStr);
      result.push({
        month: monthStr,
        newPOs: existingData?.newPOs || 0,
        expiredPOs: existingData?.expiredPOs || 0
      });
    }
    
    return result;
  };
  
  const chartData = generateContinuousMonths();
  
  console.log('Original data:', data);
  console.log('Chart data (continuous 6 months):', chartData);

  // Format month for display (YYYY-MM to MMM YYYY)
  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    
    // ใช้การแปลงเดือนแบบไทยเอง
    const monthNames = [
      'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
    ];
    
    const monthIndex = parseInt(month) - 1;
    return `${monthNames[monthIndex]} ${year}`;
  };

  // หาค่าสูงสุดเพื่อกำหนดความสูงของแท่งกราฟ
  const maxValue = Math.max(
    ...chartData.map(item => Math.max(item.newPOs, item.expiredPOs)),
    1 // ป้องกันกรณีที่ maxValue เป็น 0
  );

  const getBarHeight = (value: number) => {
    return maxValue > 0 ? (value / maxValue) * 200 : 0;
  };

  return (
    <div className="w-full">
      <div className="flex items-end justify-between h-72 border-b border-l border-gray-200 relative">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-xs text-gray-500 -ml-8">
          <span>{maxValue}</span>
          <span>{Math.floor(maxValue * 0.75)}</span>
          <span>{Math.floor(maxValue * 0.5)}</span>
          <span>{Math.floor(maxValue * 0.25)}</span>
          <span>0</span>
        </div>

        {/* Bars */}
        {chartData.map((item, index) => (
          <div key={`${item.month}-${index}`} className="flex flex-col items-center flex-1">
            <div className="flex items-end justify-center w-full mb-3" style={{ height: '200px' }}>
              {/* New POs Bar */}
              <div 
                className="bg-green-500 mx-0.5 rounded-t transition-all duration-300 hover:bg-green-600 relative group"
                style={{ 
                  height: `${item.newPOs === 0 ? 8 : Math.max(getBarHeight(item.newPOs), 8)}px`,
                  width: '16px',
                  opacity: item.newPOs === 0 ? 0.3 : 1
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
                  height: `${item.expiredPOs === 0 ? 8 : Math.max(getBarHeight(item.expiredPOs), 8)}px`,
                  width: '16px',
                  opacity: item.expiredPOs === 0 ? 0.3 : 1
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
            <div className="text-xs text-gray-600 text-center leading-tight">
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
