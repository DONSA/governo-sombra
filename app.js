const fetch    = require('node-fetch');
const RSS      = require('rss')
const cheerio  = require('cheerio')
const fs       = require('fs')

const BASE_URL = 'http://tviplayer.iol.pt'

var feed = new RSS({
    title: 'Governo Sombra',
    feed_url: 'http://localhost/rss.xml',
    site_url: BASE_URL,
    image_url: 'http://www.iol.pt/multimedia/oratvi/multimedia/imagem/id/58a7505c0cf2b10cb6612529/',
});

function scrape() {

    fetch(`${BASE_URL}/programa/governo-sombra/53c6b3a33004dc006243d5fb`)
        .then(data => data.text())
        .then(html => {
            const $ = cheerio.load(html)

            $('#lista-episodios-content a').each(function(i, el) {
                feed.item({
                    title: $(el).find('.item-title').text().trim().replace('Governo Sombra - ', ''),
                    url: BASE_URL + $(el).attr('href'),
                    date: $(el).find('.item-date').text(),
                });
            })

            fs.writeFile("./public/rss.xml", feed.xml({ indent: true }), (err) => {
                if (err) console.error(err)
            })

        })
        .catch(err => console.error(err))
}

module.export = scrape()
