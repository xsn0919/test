const CRON_SECRET_KEY = Deno.env.get("CRON_SECRET_KEY") || "1234";
const SCHEDULER_URL = `https://quant.ccccocccc.cc/scheduler_cronjob.php?key=${CRON_SECRET_KEY}&force=1`;
const WEBHOOK_URL = "https://webhook.site/02df27df-4ed5-42db-b5b8-cab3f8aaa8ba";

async function runScheduler() {
  const timestamp = new Date().toISOString();
  try {
    const response = await fetch(SCHEDULER_URL);
    const body = await response.text();
    await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: `[${timestamp}] 响应:\n${body}\n---\n`,
    });
  } catch (error) {
    await fetch(WEBHOOK_URL, {
      method: "POST",
      body: `[${timestamp}] 错误: ${error.message}`,
    });
  }
}

Deno.cron("quant-scheduler", "* * * * *", async () => {
  await runScheduler();
});

Deno.serve(() => new Response("OK"));
