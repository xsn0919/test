// 纯 fetch 方案，无需 Puppeteer
const CRON_SECRET_KEY = Deno.env.get("CRON_SECRET_KEY") || "1234";
const SCHEDULER_URL = `https://quant.ccccocccc.cc/scheduler_cronjob.php?key=${CRON_SECRET_KEY}&force=1`;
const WEBHOOK_URL = "https://webhook.site/02df27df-4ed5-42db-b5b8-cab3f8aaa8ba";

async function runScheduler() {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] 开始请求调度器`);
  try {
    const response = await fetch(SCHEDULER_URL);
    const body = await response.text();
    // 发送到 webhook 以便查看结果
    await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: `[${timestamp}] 响应内容:\n${body}\n---\n`,
    });
    console.log("已发送到 webhook");
  } catch (error) {
    await fetch(WEBHOOK_URL, {
      method: "POST",
      body: `[${timestamp}] 错误: ${error.message}`,
    });
    console.error("请求失败:", error.message);
  }
}

// 每分钟执行一次
Deno.cron("quant-scheduler", "* * * * *", async () => {
  await runScheduler();
});

// 健康检查端点
Deno.serve(() => new Response("OK"));
