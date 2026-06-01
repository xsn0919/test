// 任务映射表：cron表达式 -> 任务名（全部使用北京时间）
const taskSchedule: Record<string, string> = {
  "31 1 * * *": "daily_sync",
  "36 1 * * *": "daily_sync_2",
  "41 1 * * *": "daily_sync_3",
  "46 1 * * *": "daily_sync_3",
  "51 1 * * *": "sync_etf_daily",
  "56 1 * * *": "daily_sync_list",
  "1 2 * * *": "factor_calc_1",
  "6 2 * * *": "factor_calc_2",
  "11 2 * * *": "factor_calc_3",
  "16 2 * * *": "factor_calc_4",
  "21 2 * * *": "factor_calc_5",
  "26 2 * * *": "factor_calc_6",
  "0 8 * * *": "morning_pick_1a",
  "5 8 * * *": "morning_pick_1b",
  "10 8 * * *": "morning_pick_2a",
  "15 8 * * *": "morning_pick_2b",
  "20 8 * * *": "morning_pick_3",
  "25 8 * * *": "morning_pick_1c",
  "20 9 * * *": "morning_analysis_trigger",
  "21 9 * * *": "morning_analysis_worker",
  "30 9 * * *": "enhance_pick_worker",
  "0 4 1 * *": "sync_names",
  "0 5 1 * *": "update_weights",
  "30 4 * * *": "historical_sync"
};

// 获取北京时间
function getBeijingTime() {
  const now = new Date();
  const beijing = new Date(now.getTime() + 8 * 60 * 60 * 1000);
  return {
    hour: beijing.getUTCHours(),
    minute: beijing.getUTCMinutes(),
    dayOfMonth: beijing.getUTCDate(),
    month: beijing.getUTCMonth() + 1,
    dayOfWeek: beijing.getUTCDay() === 0 ? 7 : beijing.getUTCDay()
  };
}

// 检查当前时间是否匹配 cron 表达式（简单版，只支持数字和*）
function matchesCron(cronExpr: string, { hour, minute, dayOfMonth, month, dayOfWeek }: ReturnType<typeof getBeijingTime>): boolean {
  const parts = cronExpr.split(" ");
  if (parts.length !== 5) return false;
  const [cMin, cHour, cDay, cMon, cDow] = parts;
  if (cMin !== "*" && parseInt(cMin) !== minute) return false;
  if (cHour !== "*" && parseInt(cHour) !== hour) return false;
  if (cDay !== "*" && parseInt(cDay) !== dayOfMonth) return false;
  if (cMon !== "*" && parseInt(cMon) !== month) return false;
  if (cDow !== "*" && parseInt(cDow) !== dayOfWeek) return false;
  return true;
}

// 每分钟执行一次的全局调度器
Deno.cron("quant-scheduler", "* * * * *", async () => {
  const now = getBeijingTime();
  const { hour, minute, dayOfMonth, month, dayOfWeek } = now;
  const totalMinutes = hour * 60 + minute;
  const tasksToRun: string[] = [];

  // 检查静态任务
  for (const [cron, task] of Object.entries(taskSchedule)) {
    if (matchesCron(cron, now)) {
      tasksToRun.push(task);
    }
  }

  // 动态任务（AI评分Worker）
  if (hour >= 2 && hour <= 4 && totalMinutes >= 151 && totalMinutes <= 261 && minute % 10 === 1) {
    tasksToRun.push("ai_score_worker");
  }

  // 盘中监控（周一至五 9:25-15:10 每15分钟）
  const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
  if (isWeekday && totalMinutes >= 565 && totalMinutes <= 910 && minute % 15 === 0) {
    tasksToRun.push("intraday_30m");
  }

  // 实时监控（周一至五 9:28-15:05 每5分钟）
  if (isWeekday && totalMinutes >= 568 && totalMinutes <= 905 && minute % 5 === 0) {
    tasksToRun.push("realtime_monitor");
  }

  // NIM 保活（复杂逻辑，你可以先忽略，后面再加）
  // ...

  // 去重
  const uniqueTasks = [...new Set(tasksToRun)];
  if (uniqueTasks.length === 0) {
    console.log("当前无任务");
    return;
  }

  console.log(`[任务] ${uniqueTasks.join(", ")}`);
  for (const task of uniqueTasks) {
    await triggerTask(task);
    await new Promise(r => setTimeout(r, 1000)); // 间隔1秒，避免过载
  }
});
