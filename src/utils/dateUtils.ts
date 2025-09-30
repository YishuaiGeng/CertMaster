// 将数字转换为中文大写
const numberToChinese = (num: number): string => {
  const chineseNums = ['〇', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
  return num.toString().split('').map(digit => chineseNums[parseInt(digit)]).join('');
};

// 将日期转换为中文大写格式
export const dateToChinese = (dateStr: string): string => {
  if (!dateStr) return '';
  
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  const yearChinese = numberToChinese(year);
  const monthChinese = month < 10 ? numberToChinese(month) : 
    (month === 10 ? '十' : '十' + numberToChinese(month % 10));
  const dayChinese = day < 10 ? numberToChinese(day) : 
    (day === 10 ? '十' : 
    (day < 20 ? '十' + numberToChinese(day % 10) : 
    (day === 20 ? '二十' : 
    (day === 30 ? '三十' : 
    (day < 30 ? '二十' + numberToChinese(day % 10) : '三十' + numberToChinese(day % 10))))));
  
  return `${yearChinese}年${monthChinese}月${dayChinese}日`;
};
