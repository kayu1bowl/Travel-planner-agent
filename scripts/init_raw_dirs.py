import os

# 项目根目录下的raw根路径
RAW_ROOT = r"./rag_knowledge_base/data/raw"
# 每个地区固定3个子文件夹
SUB_DIRS = ["selfdrive", "season_guide", "photography"]

# 目录配置定义
dir_config = {
    "asia": {
        "china": ["guizhou", "yunnan", "beijing"],  # 中国细分省份
        "thailand": None,
        "vietnam": None,
        "malaysia": None
    },
    "oceania": {
        "new_zealand": None,
        "australia": None
    },
    "europe": {
        "france": None,
        "switzerland": None,
        "italy": None
    },
    "north_america": {
        "canada": None
    },
    "africa": {
        "south_africa": None,
        "kenya": None
    }
}

def build_all_dirs():
    for continent, country_dict in dir_config.items():
        cont_path = os.path.join(RAW_ROOT, continent)
        for country, provinces in country_dict.items():
            country_path = os.path.join(cont_path, country)
            # 中国需要再细分省份
            if provinces is not None:
                for prov in provinces:
                    prov_path = os.path.join(country_path, prov)
                    for sub in SUB_DIRS:
                        full_path = os.path.join(prov_path, sub)
                        os.makedirs(full_path, exist_ok=True)
            # 国外国家，直接创建三级子目录
            else:
                for sub in SUB_DIRS:
                    full_path = os.path.join(country_path, sub)
                    os.makedirs(full_path, exist_ok=True)
    print(f"✅ 全部全球旅游素材目录创建完成，根路径：{RAW_ROOT}")

if __name__ == "__main__":
    build_all_dirs()
