# 人物

## 骨架
root(YZX) → hips → torso → head / shoulders(L,R) → arm；hips → thigh(L,R) → knee → calf + foot。
参数表 `pose({x,z,ry,rx,rz,hipsY,torsoX,headX,headY,aLx,aLz,aRx,aRz,tL,cL,tR,cR,phone,via})`。

## 关节约定（用 node 数值验证过）
- root 欧拉序 **YZX**：rx 俯仰躺平 → rz 绕身体长轴翻滚 → ry 偏航。
- 仰躺 `rx=-π/2`；趴 `rx=-π/2, rz=π`；侧躺 `rx=-π/2, rz=±π/2`（+ 为右侧着地）；躺床头朝床头墙 `ry=0`。
- 大腿 rotX **负 = 向前抬**；小腿 rotX **正 = 向后折**（趴着踢腿用正值，坐着小腿下垂用正值）。
- 手臂 rotZ ± 向外/上抬（±2.75 = 举过头顶），rotX 负 = 向前伸。

## 外形
- 动漫头身比：头 r0.165，腿细长，卫衣宽大 capsule(0.235)，印花 CanvasTexture 贴在胸前。
- 脸：白眼白椭球 + 蓝虹膜 + 瞳孔 + 高光 + 小嘴。
- 发型 = **LatheGeometry 钟形头盔**：轮廓点**从下到上**（法线朝外），`phiStart/phiLength` 挖掉正面，刘海是前扇区旋成体、齐眉平剪；材质 DoubleSide。用户明确反对丝状发绺/马尾。
- three.js 坑：SphereGeometry φ=0 在 -X、正前 φ=π/2；LatheGeometry φ=0 在 +Z。

## 动作
- 幕表驱动：每幕 4.5s，1s 过渡；相邻幕位置差 >0.3 时自动站立行走（腿摆），`via` 指定绕行点（绕过床尾）。
- 坐床沿 hipsY ≈ 被面 +0.25，躺床 ≈ 被面 +0.4；地面坐 0.24，侧躺 0.24，仰躺 0.17。
- 每个躺姿都要：`?diag=pose` 打关节值 + 包围盒，再从合适机位截图核对；截图时钟比 `?t` 约多 2.5s，避开幕间过渡。
