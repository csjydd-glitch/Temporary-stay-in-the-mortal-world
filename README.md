# 墨夜观照视频作品集

这是一个纯 HTML/CSS/JS 的静态个人视频作品集。作品卡片数据不写在脚本里，而是由 `data/works.csv` 提供。

## 本地运行

直接双击 HTML 文件时，浏览器通常会拦截 CSV 的 `fetch` 请求。请在站点目录启动一个静态服务器：

```bash
cd "/Users/chenshijia/Documents/New project/ink-portfolio"
python3 -m http.server 8000
```

然后访问：

```text
http://localhost:8000
```

## 更新作品数据

当前 CSV 字段与 `/Users/chenshijia/个人网站/作品数据.xlsx` 的 `Sheet1` 一致：

```text
title,description,thumbnail,videoUrl,category,year,story
```

编辑 Excel 后，可以把 `Sheet1` 另存或导出为 CSV，再覆盖 `data/works.csv`。`thumbnail` 可以留空；如果填入图片 URL，卡片会显示封面。`videoUrl` 可以填第三方作品链接；若填入直接指向 `.mp4`、`.webm` 或 `.mov` 的地址，卡片悬停时还会尝试静音预览。

## GitHub Pages 部署

1. 新建 GitHub 仓库，并把 `ink-portfolio` 目录中的文件提交到仓库根目录。
2. 在仓库 `Settings` -> `Pages` 中选择 `Deploy from a branch`。
3. 选择要发布的分支，例如 `main`，目录选择 `/ (root)`。
4. 保存后等待 Pages 构建完成，访问 GitHub 给出的站点地址。

如果想把这个目录保留在更大的仓库里，也可以把 Pages 发布目录改成专门的发布分支，并只推送这些静态文件。
