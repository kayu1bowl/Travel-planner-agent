import time
from pathlib import Path
from playwright.sync_api import sync_playwright

def run_round1_audit():
    scratch_dir = Path(r"C:\Users\MINISUNSHINE\.gemini\antigravity\brain\8c1ab947-c709-410d-bf46-d678dbb3059e\scratch")
    scratch_dir.mkdir(parents=True, exist_ok=True)
    
    with sync_playwright() as p:
        # iPhone 14 Pro Mobile Viewport (390 x 844)
        browser = p.chromium.launch(channel="msedge", headless=True)
        context = browser.new_context(
            viewport={"width": 390, "height": 844},
            is_mobile=True,
            has_touch=True,
            user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1"
        )
        page = context.new_page()
        
        # 1. 访问首页并测试探索看板
        print("📸 [Round 1] Auditing Mobile Home (390x844)...")
        page.goto("http://localhost:5174", wait_until="networkidle")
        time.sleep(0.8)
        page.screenshot(path=str(scratch_dir / "r1_01_mobile_home.png"))
        
        # 2. 点击底部 Tab 切换至 AI 向导 (Chat)
        print("📸 [Round 1] Auditing Mobile Chat Tab...")
        page.locator(".mobile-nav-item").nth(0).click()
        time.sleep(0.6)
        page.screenshot(path=str(scratch_dir / "r1_02_mobile_chat.png"))
        
        # 3. 点击底部 Tab 切换至 全景路线 (Timeline)
        print("📸 [Round 1] Auditing Mobile Itineraries Tab...")
        page.locator(".mobile-nav-item").nth(2).click()
        time.sleep(0.6)
        page.screenshot(path=str(scratch_dir / "r1_03_mobile_itineraries.png"))
        
        # 4. 点击底部 Tab 切换至 预订待办 (Bookings)
        print("📸 [Round 1] Auditing Mobile Bookings Tab...")
        page.locator(".mobile-nav-item").nth(3).click()
        time.sleep(0.6)
        page.screenshot(path=str(scratch_dir / "r1_04_mobile_bookings.png"))
        
        # 5. 点击顶部状态诊断按钮
        print("📸 [Round 1] Auditing Mobile Status Modal...")
        page.locator(".mobile-icon-btn").first.click()
        time.sleep(0.6)
        page.screenshot(path=str(scratch_dir / "r1_05_mobile_status_modal.png"))
        page.locator(".modal-close-btn, .modal-footer-btn").first.click()
        time.sleep(0.3)
        
        # 6. 切换至 Android 分辨率 (412x915)
        print("📸 [Round 1] Auditing Android Mobile (412x915)...")
        page.set_viewport_size({"width": 412, "height": 915})
        page.locator(".mobile-nav-item").nth(1).click() # 切回看板
        time.sleep(0.6)
        page.screenshot(path=str(scratch_dir / "r1_06_android_home.png"))
        
        browser.close()
        print("✅ Round 1 Audit Screenshots captured successfully!")

if __name__ == "__main__":
    run_round1_audit()
