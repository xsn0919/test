import puppeteer from "https://deno.land/x/puppeteer@16.2.0/mod.ts";

// ========== 配置区域 ==========
const CRON_SECRET_KEY = Deno.env.get("CRON_SECRET_KEY") || "YOUR_KEY_HERE";
const SCHEDULER_URL = `https://quant.ccccocccc.cc/scheduler_cronjob.php?key=${CRON_SECRET_KEY}&force=1`;
const WEBHOOK_URL = "https://webhook.site/你的唯一标识"; // 🔁 替换为你的 webhook URL

// ========== 核心函数 ==========
async function runScheduler() {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] 调度器开始执行`);
  let browser;
  let responseBody = "";
  let errorMsg = "";

  try {
    browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
    const page = await browser.newPage();
    await page.goto(SCHEDULER_URL, { waitUntil: 'networkidle2', timeout: 60000 });
    responseBody = await page.evaluate(() => document.body.innerText);
    console.log(`响应内容（前500字符）: ${responseBody.substring(0, 500)}`);
  } catch (error) {
    errorMsg = error.message;
    console.error("调度器执行失败:", errorMsg);
  } finally {
    if (browser) await browser.close();
  }

  // 发送到 webhook（无论成功或失败）
  try {
    const payload = `[${timestamp}] 调度器执行结果\nURL: ${SCHEDULER_URL}\n${
      errorMsg ? `❌ 错误: ${errorMsg}` : `✅ 响应内容:\n${responseBody}`
    }\n---\n`;
    await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: payload,
    });
    console.log("日志已发送至 webhook");
  } catch (webhookError) {
    console.error("发送 webhook 失败:", webhookError.message);
  }
}

// ========== Cron 调度 ==========
Deno.cron("quant-scheduler", "* * * * *", async () => {
  await runScheduler();
});

// ========== 健康检查 ==========
Deno.serve(() => new Response("OK"));
