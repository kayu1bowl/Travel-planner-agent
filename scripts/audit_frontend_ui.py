"""
使用 Python Playwright 自动化启动浏览器，实测前端 UI 所有交互与视觉排版
"""
import os
import sys
import time
from pathlib import Path
from playwright.sync_api import sync_playwright

OUTPUT_DIR = Path(r"C:\Users\MINISUNSHINE\.gemini\antigravity\brain\8c1ab947-c709-410d-bf46-d678dbb3059e\scratch")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

def audit_ui():
    url = "http://localhost:5174"
    print(f"🚀 正在连接前端页面: {url}")
    
    issues = []
    
    with sync_playwright() as p:
        browser = p.chromium.launch(channel="msedge", headless=True)
        # 1920x1080 标准桌面分辨率
        context = browser.new_context(viewport={"width": 1920, "height": 1080})
        page = context.new_page()
        
        console_logs = []
        page.on("console", lambda msg: console_logs.append(f"[{msg.type}] {msg.text}"))
        page.on("pageerror", lambda exc: console_logs.append(f"[ERROR] {exc}"))
        
        try:
            page.goto(url, wait_until="networkidle", timeout=10000)
        except Exception as e:
            # 尝试 5173
            url = "http://localhost:5173"
            print(f"切换至: {url}")
            page.goto(url, wait_until="networkidle", timeout=10000)
            
        print("📸 1. 截取初始状态主页面全景...")
        page.screenshot(path=str(OUTPUT_DIR / "01_initial_home.png"), full_page=True)
        
        # 检查控制台报错
        errors = [log for log in console_logs if "[error]" in log.lower() or "[warn]" in log.lower()]
        if errors:
            print("⚠️ 控制台输出:", errors)
        
        # 检查排版是否发生垂直/水平非预期滚动
        has_h_scroll = page.evaluate("() => document.documentElement.scrollWidth > window.innerWidth")
        print(f"视口是否有意外的页面级横向滚动条: {has_h_scroll}")
        if has_h_scroll:
            issues.append("页面最外层存在非预期的横向滚动条，部分宽度超出了屏幕视口。")
            
        # 测试 1: 切换中英文
        print("🧪 2. 测试中英文切换按钮...")
        lang_btn = page.locator(".navbar-lang-btn")
        if lang_btn.count() > 0:
            lang_btn.click()
            time.sleep(0.5)
            page.screenshot(path=str(OUTPUT_DIR / "02_english_mode.png"))
            # 切换回中文
            lang_btn.click()
            time.sleep(0.5)
            
        # 测试 2: 切换天数药丸
        print("🧪 3. 测试每日行程天数切换...")
        day_pills = page.locator(".day-pill-btn")
        pill_count = day_pills.count()
        print(f"发现天数药丸数量: {pill_count}")
        if pill_count > 1:
            day_pills.nth(1).click() # 点击 Day 2
            time.sleep(0.5)
            page.screenshot(path=str(OUTPUT_DIR / "03_day2_schedule.png"))
            
        # 测试 3: 美食分类药丸
        print("🧪 4. 测试美食与地标分类筛选...")
        food_pills = page.locator(".filter-pill-btn")
        if food_pills.count() >= 3:
            food_pills.nth(1).click() # 点击 美食
            time.sleep(0.3)
            page.screenshot(path=str(OUTPUT_DIR / "04_food_filtered.png"))
            food_pills.nth(2).click() # 点击 地标
            time.sleep(0.3)
            page.screenshot(path=str(OUTPUT_DIR / "05_landmark_filtered.png"))
            food_pills.nth(0).click() # 恢复 全部
            time.sleep(0.3)
            
        # 测试 4: 摄影机位复制与分享
        print("🧪 5. 测试摄影卡片复制与分享按钮...")
        copy_btns = page.locator(".spot-actions-group .spot-action-icon-btn")
        if copy_btns.count() >= 2:
            copy_btns.nth(0).click()
            time.sleep(0.3)
            copy_btns.nth(1).click()
            time.sleep(0.3)
            page.screenshot(path=str(OUTPUT_DIR / "06_photo_actions.png"))
            
        # 测试 5: 点击 Settings 或 Bell 打开诊断弹窗
        print("🧪 6. 测试系统状态诊断弹窗...")
        settings_btn = page.locator(".nav-tab-btn:has-text('Settings'), .nav-tab-btn:has-text('设置')")
        if settings_btn.count() > 0:
            settings_btn.click()
            time.sleep(0.8)
            page.screenshot(path=str(OUTPUT_DIR / "07_status_modal.png"))
            # 关闭弹窗
            close_btn = page.locator(".modal-close-btn")
            if close_btn.count() > 0:
                close_btn.click()
                time.sleep(0.3)
                
        # 测试 6: 发送自然语言对话
        print("🧪 7. 测试左侧自然语言输入与对话交互...")
        input_box = page.locator(".pill-text-input")
        if input_box.count() > 0:
            input_box.fill("帮我规划4天新西兰南岛自驾，重点去特卡波看星空和吃三文鱼")
            send_btn = page.locator(".pill-send-btn")
            send_btn.click()
            print("已发送测试提问，等待响应流...")
            time.sleep(1.5)
            page.screenshot(path=str(OUTPUT_DIR / "08_chat_sending.png"))
            time.sleep(2.5)
            page.screenshot(path=str(OUTPUT_DIR / "09_chat_finished.png"))
            
        # 测试 7: 测试在较小笔记本屏幕 (1366x768 / 1440x900) 上的排版
        print("🧪 8. 测试不同笔记本分辨率下的排版与溢出...")
        context_laptop = browser.new_context(viewport={"width": 1440, "height": 900})
        page_laptop = context_laptop.new_page()
        page_laptop.goto(url, wait_until="networkidle", timeout=10000)
        time.sleep(0.5)
        page_laptop.screenshot(path=str(OUTPUT_DIR / "10_laptop_1440x900.png"))
        
        # 检查各卡片文本截断与溢出
        table_overflow = page_laptop.evaluate("() => { const el = document.querySelector('.schedule-table-wrapper'); return el ? el.scrollWidth > el.clientWidth : false; }")
        print(f"1440x900 下日程表格是否产生内部横向滚动: {table_overflow}")
        
        context_laptop_small = browser.new_context(viewport={"width": 1280, "height": 800})
        page_laptop_small = context_laptop_small.new_page()
        page_laptop_small.goto(url, wait_until="networkidle", timeout=10000)
        time.sleep(0.5)
        page_laptop_small.screenshot(path=str(OUTPUT_DIR / "11_laptop_1280x800.png"))

        browser.close()
        print("✅ 自动化 UI 交互与视觉测试完成！")

if __name__ == "__main__":
    audit_ui()
