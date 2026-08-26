# 不知道怎么做时

1. 先搜：three.js 官方 examples（cloth、instancing、lathe）、discourse.threejs.org、同门 skill（img2threejs 的 `grimoire/character/*` 头发/头部指南）。
2. 把可行方案（≤3 个）写下来，选最可控的；记录来源。
3. 用 node 直接验证数学（如欧拉序、几何 φ 起点），不要靠推理猜。
4. 结论沉淀到本目录 `findings.md`。

## findings.md（已沉淀）
- 被子：cloth 粒子模拟 vs 高细分平面位移——后者可控，选它（见 procedural_recipes）。
- 头发：img2threejs 的"锥形带状放样"适合单角色特写；房间场景里用户嫌"像鬼"，改 Lathe 头盔。
- Euler：three.js 'YZX' = Ry·Rz·Rx，向量先做 Rx。
- Sphere/Lathe φ 起点：-X / +Z。
