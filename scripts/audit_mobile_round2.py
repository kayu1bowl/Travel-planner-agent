import time
from pathlib import Path
from playwright.sync_api import sync_playwright

def run_round2_audit():
    scratch_dir = Path(r"C:\Users\MINISUNSHINE\.gemini\antigravity\brain\8c1ab947-c709-410d-bf46-d678dbb3059e\scratch")
    scratch_dir.mkdir(parents=True, exist_ok=True)
    
    with sync_playwright() as p:
        browser = p.chromium.launch(channel="msedge", headless=True)
        
        # 1. iPhone 14 Pro Portrait (390 x 844) - 验证修复后的日程卡片流
        print("📸 [Round 2] Test 1: iPhone 14 Pro Portrait (390x844) with fixed schedule card stream...")
        ctx_mobile = browser.new_context(
            viewport={"width": 390, "height": 844},
            is_mobile=True,
            has_touch=True,
            user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)"
        )
        page = ctx_mobile.new_page()
        page.goto("http://localhost:5174", wait_until="networkidle")
        time.sleep(0.6)
        page.screenshot(path=str(scratch_dir / "r2_01_iphone_fixed_home.png"))
        
        # 测试点击第 2 天天数药丸
        print("📸 [Round 2] Test 2: iPhone Day 2 Switch...")
        page.locator(".mobile-portrait-view .day-pill-btn").nth(1).click()
        time.sleep(0.5)
        page.screenshot(path=str(scratch_dir / "r2_02_iphone_day2_switch.png"))
        
        # 测试预订清单中的打勾交互
        print("📸 [Round 2] Test 3: iPhone Bookings Toggle...")
        page.locator(".mobile-nav-item").nth(3).click()
        time.sleep(0.5)
        # 点击第一个未确认的预订复选框
        page.locator(".mobile-portrait-view .booking-check-btn").first.click()
        time.sleep(0.5)
        page.screenshot(path=str(scratch_dir / "r2_03_iphone_bookings_toggled.png"))
        ctx_mobile.close()
        
        # 2. 模拟旋转至手机横屏 (844 x 390) - 验证横屏自动切回桌面 Bento 看板
        print("📸 [Round 2] Test 4: Mobile Landscape Rotation (844x390)...")
        ctx_landscape = browser.new_context(viewport={"width": 844, "height": 390})
        page_ls = ctx_landscape.new_page()
        page_ls.goto("http://localhost:5174", wait_until="networkidle")
        time.sleep(0.6)
        page_ls.screenshot(path=str(scratch_dir / "r2_04_mobile_landscape_rotation.png"))
        ctx_landscape.close()
        
        # 3. iPad 竖屏 (768 x 1024) - 验证平板竖屏
        print("📸 [Round 2] Test 5: iPad Tablet Portrait (768x1024)...")
        ctx_ipad = browser.new_context(viewport={"width": 768, "height": 1024})
        page_ipad = ctx_ipad.new_page()
        page_ipad.goto("http://localhost:5174", wait_until="networkidle")
        time.sleep(0.6)
        page_ipad.screenshot(path=str(scratch_dir / "r2_05_ipad_portrait.png"))
        ctx_ipad.close()
        
        # 4. 桌面大屏 (1920 x 1080) - 验证横竖屏隔离性与零样式污染
        print("📸 [Round 2] Test 6: Desktop Landscape (1920x1080) Zero Bleed Check...")
        ctx_desktop = browser.new_context(viewport={"width": 1920, "height": 1080})
        page_dt = ctx_desktop.new_page()
        page_dt.goto("http://localhost:5174", wait_until="networkidle")
        time.sleep(0.6)
        page_dt.screenshot(path=str(scratch_dir / "r2_06_desktop_zero_bleed.png"))
        ctx_desktop.close()
        
        browser.close()
        print("🎉 Round 2 Audit completed successfully with all orientation checks!")

if __name__ == "__main__":
    run_round2_audit()
