# 边捏边看（Live preview）

1. 脚手架：`package.json`(vite + three) → `index.html`/`room.html` → `npm i` → `npx vite --port 5173 --strictPort` 后台运行 → `open http://localhost:5173/room.html`。
2. 分 STAGE 写：地形/墙 → 家具 → 光 → 人物 → 动作 → 运镜。每个 STAGE 一次写入即热更新；页面角落 `#stage` 标签写当前阶段。
3. 多页面：`vite.config.js` 的 `rollupOptions.input` 列出所有 html。
4. 每次写入后 `curl localhost:5173/src/x.js` 看 200 只能证明语法能编译；**运行时错误要靠截图或 `window.onerror` 显示在页面上**（把错误写进 stage 标签）。
5. 用户浏览器里的页面就是"验收面"，我方截图只是辅助；用户随时可能截图发回，要能对上。
6. 调试 URL 参数（模板已内置）：`?t=秒` 跳时间线、`?view=g1|g2|cat|desk|bed|rug`、`?view=free&cam=x,y,z&look=x,y,z`、`?diag=sun`、`?diag=pose`、`?intro=1&it=秒`。
