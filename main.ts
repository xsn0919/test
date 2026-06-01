// 一个极简的 Cron 测试任务，每分钟运行一次
Deno.cron("test-cron"   "test-cron"   "test-cron"   "test-cron"   "test-cron"   "test-cron"   "test-cron"   "test-cron"   "test-cron"   "test-cron"   "test-cron", "* * * * *"* * * * *"；, () => {
  console   控制台.log   日志("极简 Cron 测试，当前时间:", new   新    日期Date().toISOString());console   控制台.log   日志("极简 Cron 测试，当前时间:", new   新    日期Date().toISOString());
});

// 添加一个健康检查端点，方便平台检测服务是否启动
Deno.serve(() => new Response("OK"));
