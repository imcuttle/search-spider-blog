/**
 * Created by Moyu on 16/8/6.
 */
var u = require('../utils')
var db = require('../db')
const config = global.config
const spiderConfig = config.spiderConfig
let hrefs = [];

const getHrefs = (function () {
    return function getHrefs(path, i) {
        return u.getHtml(global.config.url, path, true)
            .then($ =>{
                let links = $(global.config.spiderConfig.ArticleLinkEl)
                for(let i=0; i<links.length; i++) {
                    hrefs.push(links.eq(i).attr('href'))
                }
                let path = global.config.spiderConfig.splitPagePath.replace('${page}', i+1)
                return { path: path, hrefs: hrefs };
            }).then(d => getHrefs(d.path, i+1), err=> {
                return {
                    error: err,
                    hrefs: hrefs
                }
            })
    }
}())

module.exports = function() {
    const config = global.config
    const spiderConfig = config.spiderConfig
    hrefs=[]
    return getHrefs(global.config.mainPagePath, 1)
        .then(function (d) {
            let hrefs = d.hrefs
            console.info(`[RUNNING] Get hrefs: \r\n ${JSON.stringify(hrefs, null, 4)}`)

            return Promise
                .all(hrefs.map(h => u.getHtml(config.url, h, true)))
                .then($$=>{
                    db.clear();
                    $$.forEach(($,i)=> {
                        let article = {
                            date: $(spiderConfig.ArticleDateEl).text(),
                            title: $(spiderConfig.ArticleTitleEl).text(),
                            content: $(spiderConfig.ArticleContentEl).text()
                        }
                        db.insertArticle(article.title, article.date, article.content, hrefs[i])
                    })
                    db.setURL(config.url)
                    db.save()
                    console.info(`[INFO] database has already updated!`)
                })
        })
}
/*
    .then(hrefs => {
        console.log(`[RUNNING] hrefs: \r\n${JSON.stringify(hrefs, null , 4)}`)
    })
    */
