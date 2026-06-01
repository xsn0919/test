// 正确的 Cron 语法：三个参数，第三个必须是一个函数
Deno.cron("test-cron", "* * * * *", () => {
  console.log("极简 Cron 测试，当前时间:", new Date().toISOString());
});

// 健康检查端点
Deno.serve(() => new Response("OK"));
