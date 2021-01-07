# ElectronでGeoPackageファイルを読み込み、OpenLayersで表示する

## データ
国土数値情報から東京のバス停データを使用した。

### データ加工
ダウンロードしたファイルはshpファイルなので、GeoPackageファイルに変換しておく。

自分の環境では別の検証でPostGISに入れてあったのでそこからGeoPackageに変換した。
```
shp2pgsql -W cp932 P11-10_13-jgd-g_BusStop.shp busstop > busstop.sql
psql -U <user> -h <host> -f busstop.sql <DBNAME>
```

### ogr2ogrでGeoPackageに変換
元のshpファイルの座標系が世界測地系緯度経度なので、WebメルカトルのEPSG:3857に変換した上で出力
```
ogr2ogr -f GPKG D:\tiles\busstop.gpkg -t_srs EPSG:3857 -s_srs EPSG:4326 PG:"dbname='<DBNAME>' port='5432' user='<user>' password='<password>'" "busstop"
```

## 動作
![](https://github.com/chaki1019/electron-ol-geopackage/blob/master/geopackage.gif?raw=true)
