# 全球旅游知识库 raw 素材分层规范
## 层级规则（从大到小）
1. 一级目录：大洲 asia / europe / north_america / africa / oceania
2. 二级目录：国家/地区英文小写命名（china、new_zealand、thailand）
3. 三级目录：省份（仅中国细分，如guizhou、yunnan）
4. 四级固定业务分类：selfdrive / season_guide / photography

## 文件命名规范
{地区简写}_{素材主题}.txt
例：guizhou_drive.txt、nz_photo.txt、swiss_season.txt

## 元数据自动继承规则
分片脚本会自动读取文件路径，自动生成分层标签存入chunk metadata：
continent（大洲）、country（国家）、province（国内省份，国外为空）、travel_type（自驾/季节/摄影）
