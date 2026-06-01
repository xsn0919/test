import puppeteer from "https://deno.land/x/puppeteer@16.2.0/mod.ts";

// ========== 配置区域 ==========
// 方式一：从环境变量读取（推荐，安全）
const CRON_SECRET_KEY = Deno.env.get("CRON_SECRET_KEY") || "1234";
// 方式二：如果环境变量没生效，可以临时硬编码（测试用，记得改回）
// const CRON_SECRET_KEY = "你的真实密钥";

// 调度器入口 URL（使用 scheduler_cronjob.php）
const SCHEDULER_URL = `https://quant.ccccocccc.cc/scheduler_cronjob.php?key=${CRON_SECRET_KEY}&force=1`;

// ========== 核心函数：执行调度器 ==========
async function runScheduler() {
  console.log(`[${new Date().toISOString()}] 开始触发调度器...`);
  let browser;
  try {
    // 启动浏览器（Deno Deploy 环境需要 --no-sandbox）
    browser = await puppeteer.launch({ args: ["--no-sandbox"] });
    const page = await browser.newPage();

    // 访问调度器 URL，等待网络空闲（确保 JS 挑战完成）
    await page.goto(SCHEDULER_URL, { waitUntil: "networkidle2", timeout: 30000 });

    // 获取页面文本内容（即 PHP 脚本的输出）
    const body = await page.evaluate(() => document.body.innerText);

    console.log("调度器响应内容（前500字符）:");
    console.log(body.substring(0, 500));
    console.log(`[${new Date().toISOString()}] 调度器执行完成`);
  } catch (error) {
    console.error("调度器执行失败:", error.message);
  } finally {
    if (browser) await browser.close();
  }
}

// ========== 注册 Cron 任务：每分钟执行一次 ==========
Deno.cron("quant-scheduler", "* * * * *", async () => {
  await runScheduler();
});

// ========== 健康检查端点（让 Deno Deploy 知道应用已启动）==========
Deno.serve(() => new Response("OK", { status: 200 }));
