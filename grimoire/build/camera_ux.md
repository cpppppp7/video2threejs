# 相机体验

- OrbitControls：拖拽旋转、滚轮缩放、右键平移；`minDistance/maxDistance/maxPolarAngle` 限制。
- 初始机位来自 `solve_camera.py`；用户可按 `C` 复制当前 `CAM/LOOK/fov` 发回固化；`R` 重置；localStorage 记住用户视角。
- 开场运镜：屋内高角全景（4s，缓慢推近）→ 局部特写 1（书桌角）→ 局部特写 2（床角）→ 2.8s 平滑落到初始机位并交还控制；点击/按键跳过；带 `view/diag` 参数时不播。
- 全景机位必须在屋顶之下、墙内；否则拍到天花板背面。
