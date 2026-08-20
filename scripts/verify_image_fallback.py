import urllib.request
import urllib.parse
import json
import ssl
import sys

# 创建宽松的 SSL 上下文防止本地证书链拦截
ssl_ctx = ssl.create_default_context()
ssl_ctx.check_hostname = False
ssl_ctx.verify_mode = ssl.CERT_NONE

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 RoamAiBot/1.0'
}

def test_level1_unsplash():
    print("=" * 60)
    print("📸 [Test Level 1] Unsplash 官方高清摄影图库 API 连通性测试...")
    test_urls = [
        ("三文鱼美食", "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&auto=format&fit=crop&q=80"),
        ("好牧羊人教堂", "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&auto=format&fit=crop&q=80"),
        ("Fergburger 大汉堡", "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&auto=format&fit=crop&q=80")
    ]
    
    success_count = 0
    for name, url in test_urls:
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            with urllib.request.urlopen(req, context=ssl_ctx, timeout=10) as resp:
                status = resp.status
                c_type = resp.headers.get('Content-Type', '')
                c_len = resp.headers.get('Content-Length', 'unknown')
                print(f"  ✅ [200 OK] {name}: Type={c_type}, Size={c_len}B")
                success_count += 1
        except Exception as e:
            print(f"  ❌ {name} 请求异常: {e}")
            
    print(f"📊 Level 1 测试结果: {success_count}/{len(test_urls)} 通过\n")
    return success_count > 0

def test_level2_wikimedia():
    print("=" * 60)
    print("🏛️ [Test Level 2] Wikimedia Commons / Wikipedia 官方开放实拍 API 测试...")
    test_spots = [
        ("特卡波湖", "Lake_Tekapo"),
        ("好牧羊人教堂", "Church_of_the_Good_Shepherd,_Lake_Tekapo"),
        ("普卡基湖", "Lake_Pukaki"),
        ("米尔福德峡湾", "Milford_Sound"),
        ("皇后镇 Fergburger", "Fergburger")
    ]
    
    success_count = 0
    for label, wiki_title in test_spots:
        try:
            api_url = f"https://en.wikipedia.org/w/api.php?action=query&titles={urllib.parse.quote(wiki_title)}&prop=pageimages&format=json&pithumbsize=600"
            req = urllib.request.Request(api_url, headers=HEADERS)
            with urllib.request.urlopen(req, context=ssl_ctx, timeout=10) as resp:
                data = json.loads(resp.read().decode('utf-8'))
                pages = data.get('query', {}).get('pages', {})
                found_thumb = None
                for pid, pdata in pages.items():
                    if 'thumbnail' in pdata:
                        found_thumb = pdata['thumbnail']['source']
                        break
                        
                if found_thumb:
                    # 验证缩略图是否真实可访问
                    img_req = urllib.request.Request(found_thumb, headers=HEADERS)
                    with urllib.request.urlopen(img_req, context=ssl_ctx, timeout=10) as img_resp:
                        print(f"  ✅ [200 OK] {label} ({wiki_title}):\n     -> 实拍图: {found_thumb[:80]}... (Type: {img_resp.headers.get('Content-Type')})")
                        success_count += 1
                else:
                    print(f"  ⚠️ {label} 词条存在但未收录 PageImage 缩略图")
        except Exception as e:
            print(f"  ❌ {label} API 查询异常: {e}")
            
    print(f"📊 Level 2 测试结果: {success_count}/{len(test_spots)} 成功拉取实拍图\n")
    return success_count > 0

def test_level3_ai_generative():
    print("=" * 60)
    print("✨ [Test Level 3] AI 实时生图 / Generative Visual 连通性测试...")
    test_prompts = [
        ("高山三文鱼定制概念图", "Fresh Alpine salmon sashimi plate near Lake Pukaki snow mountain New Zealand gourmet"),
        ("特卡波星空银河概念图", "Church of the Good Shepherd Lake Tekapo starry sky milky way arch photography")
    ]
    
    success_count = 0
    for label, prompt in test_prompts:
        try:
            url = f"https://image.pollinations.ai/prompt/{urllib.parse.quote(prompt)}?width=400&height=250&nologo=true"
            req = urllib.request.Request(url, headers=HEADERS)
            with urllib.request.urlopen(req, context=ssl_ctx, timeout=15) as resp:
                status = resp.status
                c_type = resp.headers.get('Content-Type', '')
                print(f"  ✅ [200 OK] {label}: Type={c_type}, URL={url[:70]}...")
                success_count += 1
        except Exception as e:
            print(f"  ❌ {label} AI 生图异常: {e}")
            
    print(f"📊 Level 3 测试结果: {success_count}/{len(test_prompts)} 成功生成概念图\n")
    return success_count > 0

def run_all_verification():
    print("🚀 开始执行多级 Fallback 图片服务与全层级真实连通性测试...\n")
    l1 = test_level1_unsplash()
    l2 = test_level2_wikimedia()
    l3 = test_level3_ai_generative()
    
    print("=" * 60)
    print(f"🏁 全层级 Fallback 验证汇总:")
    print(f"  - Level 1 (Unsplash 摄影图库): {'🟢 正常可用' if l1 else '🔴 失败'}")
    print(f"  - Level 2 (Wikimedia 真实地标实拍): {'🟢 正常可用' if l2 else '🔴 失败'}")
    print(f"  - Level 3 (AI 实时视觉生图): {'🟢 正常可用' if l3 else '🔴 失败'}")
    print("=" * 60)
    
    if l1 and l2 and l3:
        print("🎉 全部三级 Fallback 均已真实联通并验证成功！")
        return 0
    else:
        print("⚠️ 存在部分层级未通过，请检查网络或配置")
        return 1

if __name__ == "__main__":
    sys.exit(run_all_verification())
