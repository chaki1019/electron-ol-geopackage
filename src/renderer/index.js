// Initial welcome page. Delete the following line to remove it.
'use strict';

import Map from 'ol/Map';
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
import {fromLonLat} from 'ol/proj';
import VectorTileLayer from 'ol/layer/VectorTile';
import VectorTileSource from 'ol/source/VectorTile';
import MVT from 'ol/format/MVT';
import {Fill, Icon, Stroke, Style, Text, Circle} from 'ol/style';
import zlib from 'zlib';

import fs, { read } from 'fs';
import {remote, ipcRenderer} from 'electron';

import {GeoPackageAPI} from '@ngageoint/geopackage'

const {BrowserWindow, dialog} = remote;

const map = new Map({
    target: document.getElementById('app'),
    view: new View({
        center: fromLonLat([136.93, 35.12]),
        zoom: 15,
    }),
    layers: [
        new TileLayer({
            source: new XYZ({
                url: "http://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
            }),
            minZoom: 0,
            maxZoom: 17,
        })
    ]
});

var style = new Style({
    fill: new Fill({
        color: 'rgba(255, 255, 255, 0.6)',
    }),
    stroke: new Stroke({
        color: '#319FD3',
        width: 1,
    }),
    text: new Text({
        font: '12px Calibri,sans-serif',
        fill: new Fill({
            color: '#000',
        }),
        stroke: new Stroke({
            color: '#fff',
            width: 3,
        }),
    }),
});

//openFileボタンが押されたとき（ファイル名取得まで）
function openFile() {
    const win = BrowserWindow.getFocusedWindow();
    const fileNames = dialog.showOpenDialogSync(
        win,
        {
            properties: ['openFile'],
            // filters: [
            //     {
            //         name: 'Document',
            //         extensions: ['csv', 'txt']
            //     }
            // ]
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
    console.log('featureDao:getCount', featureDao.getCount())

    const info = gpkg.getInfoForTable(featureDao)
    console.log('info', info)

    // query for all features
                // featureDao.queryForEach((err, row, rowDone) => {
                //     var feature = featureDao.getFeatureRow(row);
                //     var geometry = currentRow.getGeometry();
                //     if (geometry) {
                //         var geoJson = geometry.geometry.toGeoJSON();

                //         geoJson.properties = {};
                //         for (var key in feature.values) {
                //         if(feature.values.hasOwnProperty(key) && key != feature.getGeometryColumn().name) {
                //             var column = info.columnMap[key];
                //             geoJson.properties[column.displayName] = currentRow.values[key];
                //         }
                //         }
                //     }
                //     rowDone();
                // });

    // new MBTiles(`${path}?mode=ro`, (err, mbtiles) => {
    //     console.log(mbtiles); // mbtiles object with methods listed below
    //     const towniiHouseLayer = new VectorTileLayer({
    //         source: new VectorTileSource({
    //             format: new MVT(),
    //             url: 'http://localhost:3000/tile/townii/poly_water/{z}/{x}/{y}.mvt',
    //             tileLoadFunction: (tile, url) => {
    //                 tile.setLoader((extent, resolution, projection) => {
    //                     const tileCoord = tile.getTileCoord();
    //                     console.log('tileCoord', tileCoord);
    //                     mbtiles.getTile(tileCoord[0], tileCoord[1], tileCoord[2], (err, data, headers) => {
    //                         if (err) {
    //                             console.error(err);
    //                             return;
    //                         }
    //                         console.log('getTile', headers);
    //                         zlib.gunzip(data, (err, bin) => {
    //                             if (err) {
    //                                 console.error(err);
    //                                 return;
    //                             }

    //                             const format = tile.getFormat() // ol/format/MVT configured as source format
    //                             const features = format.readFeatures(bin, {
    //                                 extent: extent,
    //                                 featureProjection: projection
    //                             });

    //                             tile.setFeatures(features);
    //                         });
    //                     });
    //                 });
    //             },
    //         }),
    //         minZoom: 12,
    //         // maxZoom: 23,
    //         style: (feature) => {
    //             return style;
    //         }
    //     });

    //     towniiHouseLayer.setMap(map);
    // });
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
    // const vueScript=document.createElement('script');
// vueScript.setAttribute('type','text/javascript'),
// vueScript.setAttribute('src','https://unpkg.com/vue'),
// vueScript.onload=init,
// document.head.appendChild(vueScript),

setTimeout(() => {
    map.updateSize();
}, 200);
