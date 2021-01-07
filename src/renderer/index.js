// Initial welcome page. Delete the following line to remove it.
'use strict';

import Map from 'ol/Map';
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
import {fromLonLat} from 'ol/proj';
import VectorLayer from 'ol/layer/Vector';
import {Fill, Icon, Stroke, Style, Text, Circle} from 'ol/style';
import {Vector} from 'ol/source';
import {GeoJSON} from 'ol/format';
import {bbox} from 'ol/loadingstrategy';

import fs, { read } from 'fs';
import {remote, ipcRenderer} from 'electron';

import {GeoPackageAPI, BoundingBox} from '@ngageoint/geopackage'

const {BrowserWindow, dialog} = remote;

const map = new Map({
  target: document.getElementById('app'),
  view: new View({
    // center: fromLonLat([136.93, 35.12]),
    center: fromLonLat([139.68, 35.6]),
    zoom: 15,
  }),
  layers: [
    new TileLayer({
      source: new XYZ({
        url: "http://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
      }),
      minZoom: 0,
      maxZoom: 23,
    }),
  ]
});

//openFileボタンが押されたとき（ファイル名取得まで）
function openFile() {
    const win = BrowserWindow.getFocusedWindow();
    const fileNames = dialog.showOpenDialogSync(
        win,
        {
            properties: ['openFile'],
            filters: [
                {
                    name: 'GeoPackage',
                    extensions: ['gpkg']
                }
            ]
        },
        // (fileNames) => {
        //     console.log('fileNames', fileNames);
        //     if (fileNames) {
        //         readFile(fileNames[0]); //複数選択の可能性もあるので配列となる。
        //     }
        // }
    );
    if (fileNames) {
        readFile(fileNames[0])
    }
}

//指定したファイルを読み込む
async function readFile(path) {
    const gpkg = await GeoPackageAPI.open(path)

    // get the feature table names
    const tables = gpkg.getFeatureTables()
    console.log('tables', tables)

    // get the info for the first table
    const featureDao = gpkg.getFeatureDao(tables[0])
    // const indexed = await gpkg.indexFeatureTable(tables[0])
    // console.log('indexed',indexed)
    // const indexed2 = await gpkg.createGeometryIndexTable(featureDao);
    // console.log('indexed2',indexed2)
    // const featureDao = gpkg.getFeatureDaoWithTableName(tables[0])
    console.log('featureDao:getCount', featureDao.getCount())

    const info = gpkg.getInfoForTable(featureDao)
    console.log('info', info)

    const source = new Vector({
      format: new GeoJSON(),
      loader: (extent, resolution, projection) => {
        console.log(extent)
        const bbox = new BoundingBox(extent[0], extent[2], extent[1], extent[3]);
        // const featureIterator = featureDao.fastQueryWebMercatorBoundingBox(bbox);
        const featureIterator = featureDao.queryIndexedFeaturesWithWebMercatorBoundingBox(bbox);
        const features = [];
        while (true) {
          const {done, value} = featureIterator.next()
          if (done) {
            console.log('break!!!');
            break;
          }

          const geom = value.geometry;
          if (geom) {
            const geoJson = {
              type: 'Feature'
            }
            geoJson.geometry = geom.toGeoJSON();
            geoJson.properties = {};
            for (var key in value.values) {
              if (key === value.geometryColumn.name) {
                continue;
              }
              geoJson.properties[key] = value.values[key];
            }
            features.push(geoJson)
          }
        }
        // vectorSource.removeLoadedExtent(extent);
        source.clear();
        source.addFeatures(source.getFormat().readFeatures({
          type: 'FeatureCollection',
          features
        }));
      },
      strategy: bbox
    });
    const vectorLayer = new VectorLayer({
      source,
    });
    map.addLayer(vectorLayer)
}

ipcRenderer.on('open_file', (event, arg) => {
    console.log('open_file');
    openFile();
});

const styles = document.createElement('style');
styles.innerText=`
body {
    margin: 0;
}
#app{
    display:flex;
    flex-direction:column;
    justify-content:center;
    height:100vh;
    position:relative;
    width:100%;
}
`;
document.head.appendChild(styles);

setTimeout(() => {
    map.updateSize();
}, 200);
