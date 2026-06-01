// 北京时间工具
function getBeijingTime() {
  const now = new Date();
  const beijingTime = new Date(now.getTime() + 8 * 60 * 60 * 1000);
  return {
    hour: beijingTime.getUTCHours(),
    minute: beijingTime.getUTCMinutes(),
    dayOfMonth: beijingTime.getUTCDate(),
    month: beijingTime.getUTCMonth() + 1,
    dayOfWeek: beijingTime.getUTCDay() === 0 ? 7 : beijingTime.getUTCDay(),
    totalMinutes: beijingTime.getUTCHours() * 60 + beijingTime.getUTCMinutes(),
  };
}

// 静态任务表（简化版，只放几个测试）
const staticTasks: Record<string, string> = {
  "31 1 * * *": "daily_sync",
  "36 1 * * *": "daily_sync_2",
  "0 8 * * *": "morning_pick_1a",
};

function matchCron(cronExpr: string, hour: number, minute: number, dayOfMonth: number, month: number, dayOfWeek: number): boolean {
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

Deno.cron("quant-scheduler", "* * * * *", async () => {
  const { hour, minute, dayOfMonth, month, dayOfWeek, totalMinutes } = getBeijingTime();
  console.log(`调度检查: ${hour}:${minute.toString().padStart(2,'0')}`);
  
  const tasks: string[] = [];
  for (const [cron, task] of Object.entries(staticTasks)) {
    if (matchCron(cron, hour, minute, dayOfMonth, month, dayOfWeek)) {
      tasks.push(task);
    }
  }
  
  if (tasks.length === 0) {
    console.log("无任务");
    return;
  }
  console.log("待执行任务:", tasks.join(", "));
  // 暂时不执行实际网络请求，只打印
});

Deno.serve(() => new Response("OK"));
