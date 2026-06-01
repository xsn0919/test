import puppeteer from "https://deno.land/x/puppeteer@16.2.0/mod.ts";

const CRON_SECRET_KEY = Deno.env.get("CRON_SECRET_KEY") || "1234";
const TARGET_URL = "https://quant.ccccocccc.cc/cron_trigger.php";

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

async function executeTask(taskName: string): Promise<void> {
  const url = `${TARGET_URL}?key=${CRON_SECRET_KEY}&task=${taskName}&force=1`;
  console.log(`[执行] ${taskName}`);
  let browser;
  try {
    browser = await puppeteer.launch({ args: ["--no-sandbox"] });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2", timeout: 25000 });
    const body = await page.evaluate(() => document.body.innerText);
    const success = body.includes("OK") || body.includes("成功");
    console.log(`[结果] ${taskName} ${success ? "✅ 成功" : "❌ 失败"}`);
    await page.close();
  } catch (err) {
    console.error(`[错误] ${taskName}:`, err.message);
  } finally {
    if (browser) await browser.close();
  }
}

const staticTasks: Record<string, string> = {
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
  "30 4 * * *": "historical_sync",
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
  const tasksToRun: string[] = [];

  // 静态任务
  for (const [cron, task] of Object.entries(staticTasks)) {
    if (matchCron(cron, hour, minute, dayOfMonth, month, dayOfWeek)) {
      tasksToRun.push(task);
    }
  }

  // 动态任务（这里只加一个示例，你可以根据需要添加全部）
  const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
  if (isWeekday && totalMinutes >= 565 && totalMinutes <= 910 && minute % 15 === 0) {
    tasksToRun.push("intraday_30m");
  }
  if (isWeekday && totalMinutes >= 568 && totalMinutes <= 905 && minute % 5 === 0) {
    tasksToRun.push("realtime_monitor");
  }

  // ... 其他动态任务可按原样添加，但建议先测试这部分

  const uniqueTasks = [...new Set(tasksToRun)];
  if (uniqueTasks.length === 0) {
    console.log("无任务");
    return;
  }
  console.log(`待执行: ${uniqueTasks.join(", ")}`);
  for (const task of uniqueTasks) {
    await executeTask(task);
    await new Promise(r => setTimeout(r, 1000));
  }
});

Deno.serve(() => new Response("OK"));
