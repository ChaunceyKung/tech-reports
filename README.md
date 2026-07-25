# PDF Online Viewer

基于 GitHub Pages 和 Mozilla PDF.js 的在线 PDF 阅读器。

支持目录、页码跳转、缩放、全文搜索、打印和下载。

## PDF 在线阅读

本项目使用 GitHub Pages 和 PDF.js 提供在线 PDF 阅读能力。

### 在线访问

GitHub Pages 启用后，可通过以下地址访问：

`https://<username>.github.io/<repository>/`

### 本地预览

```bash
python scripts/serve_docs.py
```

然后访问：

`http://localhost:8000/`

### 添加新文档

1. 将 PDF 放入 `docs/reports/`；
2. 在 `docs/assets/app.js` 的 `documents` 数组中添加条目；
3. 提交并推送代码。

### 手机浏览

本项目同时支持电脑和手机浏览。

- 电脑端默认使用完整 PDF.js 阅读器（新标签页打开）；
- 手机端使用适配后的 PDF.js 阅读器（当前页面打开），默认按页面宽度显示；
- 手机端提供"系统阅读器打开"按钮，可在 PDF.js 加载失败时作为备用；
- 建议使用最新版 Safari、Chrome、Edge 或 Firefox；
- 微信内置浏览器出现问题时，可选择"在浏览器中打开"。

### 技术架构

- 纯静态网站，无需后端服务
- 基于 [Mozilla PDF.js](https://github.com/mozilla/pdf.js) v6.1.200 的 Generic Viewer（Modern Build）
- 使用原生 HTML、CSS、JavaScript，无框架依赖
- 移动端通过独立 CSS 覆盖和 JS 逻辑适配，不修改 PDF.js 核心代码

## ⚠️ 安全与隐私提示

- GitHub Pages 为公开访问，所有上传的 PDF 将对互联网可见；
- **请勿**将未公开论文、内部项目材料、合作方数据、基金申请材料等上传至公开仓库；
- 对于私密文档，应改用有访问控制的文档平台或内部部署方式。

## 部署到 GitHub Pages

1. 将代码推送到 GitHub 仓库；
2. 在仓库 **Settings → Pages** 中：
   - **Source** 选择 "Deploy from a branch"
   - **Branch** 选择 `main`（或默认分支）
   - **Folder** 选择 `/docs`
3. 保存后等待部署完成（通常 1–2 分钟）。

## License

本项目代码采用 MIT License。PDF.js 采用 Apache License 2.0，详见 [docs/pdfjs/LICENSE](docs/pdfjs/LICENSE)。
