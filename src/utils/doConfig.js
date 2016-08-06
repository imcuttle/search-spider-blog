/**
 * Created by Moyu on 16/8/5.
 */
var fs = require('fs');
var path = require('path');

const CONFIG_PATH = path.resolve(__dirname, "../../blogconfig.json");

function read() {
    console.log(`[INFO] Loading ${CONFIG_PATH} ...`)
    var string = fs.readFileSync(CONFIG_PATH).toString();
    var config = JSON.parse(string);
    console.log(`[INFO] Loaded ${CONFIG_PATH} ...`)
    return config;
}
global.config = read()


fs.watchFile(CONFIG_PATH, function (stats) {
    let str = `[INFO] config changed: \r\nfrom ${JSON.stringify(config, null ,4)} to `
    global.config = read()
    str+=`${JSON.stringify(config, null ,4)}`
    console.info(str)
    require('../main/load')()
});
