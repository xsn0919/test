// 使用 fetch 方案，不需要 Puppeteer
const CRON_SECRET_KEY = Deno.env.get("CRON_SECRET_KEY") || "1234";
const SCHEDULER_URL = `https://quant.ccccocccc.cc/scheduler_cronjob.php?key=${CRON_SECRET_KEY}&force=1`;
const WEBHOOK_URL = "https://webhook.site/02df27df-4ed5-42db-b5b8-cab3f8aaa8ba"; // 你的 webhook 地址

async function runScheduler() {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] 开始执行调度器`);
  try {
    const response = await fetch(SCHEDULER_URL);
    const body = await response.text();
    // 发送到 webhook
    await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: `[${timestamp}] 调度器响应:\n${body}\n---\n`,
    });
    console.log("日志已发送至 webhook");
  } catch (error) {
    await fetch(WEBHOOK_URL, {
      method: "POST",
      body: `[${timestamp}] 错误: ${error.message}`,
    });
    console.error("执行失败:", error.message);
  }
}

// 每分钟执行一次
Deno.cron("quant-scheduler", "* * * * *", async () => {
  await runScheduler();
});

// 健康检查
Deno.serve(() => new Response("OK"));
