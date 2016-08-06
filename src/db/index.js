/**
 * Created by Moyu on 16/8/6.
 */
var fs = require('fs');

const DB_PATH = __dirname + "/db.json";

const initialDB = {
    url: "",
    articles: [],
    dateMap: {},
    titleMap: {}
};

let contentMap = null

console.info(`[INFO] loading ${DB_PATH} ...`)
let db = fs.existsSync(DB_PATH) ? JSON.parse(fs.readFileSync(DB_PATH).toString()) : initialDB;
module.exports = {
    save() {
        return new Promise(function (resolve, reject) {
            fs.writeFile(DB_PATH, JSON.stringify(db, null , 4) ,function (err) {
                if(err) reject(err);
                else resolve();
            })
        })
    },
    read() {
        return new Promise(function (resolve, reject) {
            fs.readFile(DB_PATH, function (err, data) {
                if(err) reject(err);
                else resolve(data.toString());
            })
        })
    },
    clear() {
        db = initialDB
    },
    setURL(url) {
        db.url = url;
    },
    getURL() {
        return db.url
    },
    insertArticle(title, date, content, path) {
        date = date.trim().toLowerCase();
        title = title.trim().toLowerCase();
        db.articles = db.articles || [];
        db.articles.push({
            title: title,
            date: date,
            content: content,
            path: path
        })

        db.dateMap[date] = db.dateMap[date] || [];
        db.titleMap[title] = db.titleMap[title] || [];
        db.titleMap[title].push(db.articles.length-1)
        db.dateMap[date].push(db.articles.length-1)
    },
    getAll() {
        return db['articles'];
    },
    _search(str, value) {
        let rlt = []
        let keywords = str.trim().toLowerCase().split(/[\s\+]+/)

        keywords.forEach((x,i)=>{
            let regS = new RegExp(x, "gi");
            let pos = value.search(regS)
            let p = 0
            if(pos!=-1) {
                rlt.push(pos + p)
            }
        })
        return rlt;
    },

    searchByContent(content, num) {
        return this._searchCom(content, num, 'content');
    },
    searchByDate: function (date, num) {
        return this._searchCom(date, num, 'date');
    },
    searchByTitle(title, num) {
        return this._searchCom(title, num, 'title');
    },
    _searchCom(str, num, type) {
        if(typeof str==='undefined') {
            return [];
        }
        let map
        switch (type){
            case 'title':
                map = db.titleMap;
                break;
            case 'date':
                map = db.dateMap;
                break;
            case 'content':
                if(contentMap!=null) {
                    map = contentMap
                }else {
                    map = {}
                    db.articles.forEach((x,i)=>{
                        map[x.content] = map[x.content] || []
                        map[x.content].push(i)
                    });
                    contentMap = map;
                }
                break;
        }

        num = num || 0;
        let keys = Object.keys(map)
        const _search = this._search;
        if(num>0) {
            return keys.map(k=>{
                return {
                    type: type,
                    key: k,
                    indexs: _search(str, k)
                }
            }).filter(x=>{
                return x.indexs.length>0
            }).sort(function (a, b) {
                return b.indexs.length-a.indexs.length
            }).slice(0, num)
                .map(x=>{
                    let key = x.key
                    delete x.key
                    let rlt = Object.assign({}, x, {articles: map[key].map(i=>{return db.articles[i]})});
                    return rlt;
                })
        }else {
            return keys.map(k=>{
                return {
                    type: type,
                    articles: map[k].map(i=>{return db.articles[i]}),
                    indexs: _search(str, k)
                }
            }).filter(x=>{
                return x.indexs.length>0
            }).sort(function (a, b) {
                return b.indexs.length-a.indexs.length
            })
        }
    }
}
