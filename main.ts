import puppeteer from "https://deno.land/x/puppeteer@16.2.0/mod.ts";

// 你的密钥（与 config.php 中的 cron_secret_key 一致）
const CRON_SECRET_KEY = Deno.env.get("CRON_SECRET_KEY") || "1234";
const SCHEDULER_URL = `https://quant.ccccocccc.cc/scheduler_cronjob.php?key=${CRON_SECRET_KEY}&force=1`;

// 替换为你的 webhook.site URL
const WEBHOOK_URL = "https://webhook.site/02df27df-4ed5-42db-b5b8-cab3f8aaa8ba";

async function runScheduler() {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] 开始执行调度器`);
  let browser;
  try {
    browser = await puppeteer.launch({ args: ["--no-sandbox"] });
    const page = await browser.newPage();
    await page.goto(SCHEDULER_URL, { waitUntil: "networkidle2", timeout: 30000 });
    const body = await page.evaluate(() => document.body.innerText);

    // 将响应内容发送到 webhook.site
    await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain; charset=utf-8" },
      body: `[${timestamp}] 调度器响应:\n${body}\n---\n`,
    });
    console.log("日志已发送至 webhook");
  } catch (error) {
    await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: `[${timestamp}] 错误: ${error.message}`,
    });
    console.error("执行失败:", error.message);
  } finally {
    if (browser) await browser.close();
  }
}

Deno.cron("quant-scheduler", "* * * * *", async () => {
  await runScheduler();
});

Deno.serve(() => new Response("OK"));
