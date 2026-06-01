// 1. 先保留原有的 HTTP 服务（让平台认为应用在运行）
Deno.serve(() => new Response("OK"));

// 2. 添加一个最简单的 Cron 任务，每分钟执行一次
Deno.cron("test-cron", "* * * * *", () => {
  console.log("Cron 任务执行了！", new Date().toISOString());
});
