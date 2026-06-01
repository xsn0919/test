Deno.serve(() => new Response("OK"));

// 你的量化系统地址和密钥（请替换成真实的）
const CRON_SECRET_KEY = "1234";  // 例如 "1234"
const TARGET_URL = "https://quant.ccccocccc.cc/cron_trigger.php";

// 定义一个函数来触发任务
async function triggerTask(taskName: string) {
  const url = `${TARGET_URL}?key=${CRON_SECRET_KEY}&task=${taskName}&force=1`;
  console.log(`[触发] ${taskName} -> ${url}`);
  try {
    const response = await fetch(url);
    const text = await response.text();
    console.log(`[结果] ${taskName} HTTP ${response.status}, 内容前200字符:`, text.substring(0, 200));
  } catch (error) {
    console.error(`[错误] ${taskName} 失败:`, error.message);
  }
}

// Cron 每分钟执行一次，先测试 daily_sync
Deno.cron("quant-daily", "* * * * *", async () => {
  console.log("========== Cron 触发 ==========");
  await triggerTask("daily_sync");
});
