# 验证

## 截图
`forge/shot.sh out.png "http://localhost:5173/room.html?t=6&view=bed" 1600x808`
- headless Chrome **不要加 --disable-gpu / swiftshader**（几秒 vs 3 分钟）；不要新建 user-data-dir（会挂）；Vite 只监听 `[::1]`，用 `localhost`。
- 视口用视频比例（16:9）。
- 时钟比 `?t` 约多 2.5s。

## 并排
`forge/compare.sh frame_01.jpg out.png cmp.jpg` → 逐项列偏差再改。

## 诊断
- `?diag=sun`：纯直射光图。墙/天花板必须黑；光斑位置按几何核算。
- `?diag=pose`：关节值 + 包围盒（角色"消失"多半是穿进被子/墙或落在过渡段）。
- 不要用 ego-browser 之类共享浏览器截图——会抓到用户正在用的标签页。

## 何时算过
每个物件：特写截图对照参考特征清单 ≥8 分；整体：并排图布局/颜色/光一致；动作：逐幕像人。
