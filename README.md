# 韦人仁 Waylen · 个人主页（源码版）

一份**完全手写**的静态站点：HTML + CSS + 原生 JS，没有框架、没有构建、没有 Framer 运行时。
双击 `index.html` 能直接看（推荐用本地服务器预览，见下），也可以直接丢到 GitHub Pages。

## 结构

```
站点源码/
├─ index.html          ← 所有文字都在这里，直接改
├─ css/style.css       ← 全部样式：颜色、字号、间距、动画时长
├─ js/main.js          ← 交互：菜单、滚动入场、手风琴、跑马灯、表单
├─ fonts/              ← Instrument Serif / Satoshi / Inter（本地文件，断网可用）
├─ img/                ← 18 张压缩后的照片，4.3 MB
└─ .nojekyll           ← 给 GitHub Pages 用：告诉它别走 Jekyll
```

## 本地预览

直接双击 `index.html` 也能看，但用本地服务器更接近线上（`file://` 下字体预加载会被拦）：

```powershell
python -m http.server 8901 --directory 站点源码
# 然后浏览器打开 http://127.0.0.1:8901
```

## 怎么改

| 想改什么 | 改哪里 |
|---|---|
| 任何文字 | `index.html`，搜中文直接替换（这次没有三份断点复制，改一次就够） |
| 主色 / 背景色 | `css/style.css` 顶部的 `:root` 变量：`--cream` `--green` `--olive` |
| 大标题字体大小 | `.hero h1` 里的 `clamp(2.9rem, 8vw, 6.2rem)` |
| 区块间距 | `--section-y`、`--section-pad` |
| 加一条经历 | 复制 `index.html` 里任意一段 `<article class="exp-item reveal">…</article>`，改编号/标题/描述/图片 |
| 技能条目 | 复制一段 `<div class="acc__item">…</div>`，改 `acc__idx` 和 `acc__name` |
| 换照片 | 把新图放进 `img/` 覆盖同名文件（`hero.jpg`、`exp-01…09.jpg`、`shot-01…06.jpg`），或改 `src` |
| 跑马灯速度 | `css/style.css` 的 `animation: marquee 46s`，数字越大越慢 |
| 联系方式 | `index.html` 搜 `WRR520.COM` / `5201314` / `github.com/Waylen123`，`js/main.js` 里 mailto 也有一处 |

## 交互都在这（`js/main.js`）

1. 顶栏滚动后变半透明实底；
2. 手机汉堡菜单（全屏、锁滚动、Esc 关闭、点链接自动关）；
3. 滚动入场（IntersectionObserver，尊重 `prefers-reduced-motion`）；
4. 技能手风琴（同时只开一个）；
5. 摄影跑马灯（JS 克隆一份卡片实现无缝循环，hover 暂停）；
6. 表单：没填 `data-endpoint` 时走本机邮件客户端。

### 让表单真能收信

去 [Formspree](https://formspree.io/) 或 [FormSubmit](https://formsubmit.co/) 拿一个 endpoint，填到：

```html
<form class="form reveal" id="contactForm" data-endpoint="https://formspree.io/f/xxxxxxx">
```

填了之后 `main.js` 会用 `fetch` 直接 POST，不再弹邮件客户端。

## 部署到 GitHub Pages

```powershell
cd 站点源码
git init
git add .
git commit -m "Waylen personal site"
git branch -M main
git remote add origin https://github.com/<你的用户名>/<仓库名>.git
git push -u origin main
```

然后仓库 → **Settings → Pages** → Source 选 `Deploy from a branch` → Branch `main` / `root` → Save。
一两分钟后访问 `https://<用户名>.github.io/<仓库名>/`。

- 想用根路径（`https://<用户名>.github.io/`）：仓库名必须叫 `<用户名>.github.io`。
- 想绑自己的域名：仓库根目录加一个 `CNAME` 文件，内容写域名；DNS 加 CNAME 指向 `<用户名>.github.io`。
- 全部体积约 4.5 MB，远低于 Pages 的限制（站点 1 GB、单文件 100 MB）。

## 和 Framer 线上版的差异

- 首屏、关于我、经历 9 项、荣誉、技能、摄影作品、联系、页脚——**内容和顺序都对齐**。
- 布局是重新实现的：更紧凑的栅格、统一圆角、滚动入场，**不是** Framer 那套像素结构，所以不会再受 Framer 限制。
- 原站「经历」那块 JS 驱动的环形旋转卡片，这里改成左右交替的大图卡（信息一样，视觉更稳）。
- 摄影作品从手动横向滚动变成**自动无缝循环**（本地版之前只在备份里实现过，现在正式站也有了）。
- 图片沿用模板里的托斯卡纳素材，**换成你自己的照片**直接覆盖 `img/` 里的文件即可。
