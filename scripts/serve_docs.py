#!/usr/bin/env python3
"""
本地预览服务器 — 为 docs/ 目录提供静态文件服务

用法：
    python scripts/serve_docs.py

默认在 http://localhost:8000/ 启动，服务 docs/ 目录。

依赖：仅使用 Python 标准库，无需安装第三方包。
"""

import http.server
import os
import socket
import sys

# 配置
HOST = "localhost"
PORT = 8000
ROOT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "docs")


def find_free_port(start_port, max_attempts=10):
    """寻找可用端口，从 start_port 开始递增尝试"""
    for port in range(start_port, start_port + max_attempts):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            try:
                s.bind((HOST, port))
                return port
            except OSError:
                continue
    return None


def main():
    root = os.path.normpath(ROOT_DIR)

    if not os.path.isdir(root):
        print(f"错误：docs/ 目录不存在：{root}")
        sys.exit(1)

    # 切换到 docs/ 目录，使服务器以 docs/ 为根
    os.chdir(root)

    port = find_free_port(PORT)
    if port is None:
        print(f"错误：端口 {PORT}–{PORT + 9} 均被占用，请手动指定端口。")
        sys.exit(1)

    handler = http.server.SimpleHTTPRequestHandler

    # 添加正确的 MIME 类型
    handler.extensions_map.update({
        ".mjs": "text/javascript",
        ".wasm": "application/wasm",
    })

    with http.server.HTTPServer((HOST, port), handler) as httpd:
        print(f"  文档预览服务器已启动")
        print(f"  地址：http://{HOST}:{port}/")
        print(f"  目录：{root}")
        print(f"  按 Ctrl+C 停止服务器")
        print()
        print(f"  提示：请勿直接双击 index.html，")
        print(f"        浏览器对本地文件的跨域限制可能导致 PDF 无法加载。")
        print()

        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n服务器已停止。")


if __name__ == "__main__":
    main()
