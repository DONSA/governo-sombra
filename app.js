require('dotenv').config()

const fetch    = require('node-fetch');
const RSS      = require('rss')
const cheerio  = require('cheerio')
const fs       = require('fs')

async function scrape() {

    var feed = new RSS({
        title: 'Governo Sombra',
        feed_url: 'http://localhost/rss.xml',
        site_url: process.env.BASE_URL,
        image_url: 'https://www.iol.pt/multimedia/oratvi/multimedia/imagem/id/58a7505c0cf2b10cb6612529/',
    });

    fetch(`${process.env.BASE_URL}/programa/governo-sombra/53c6b3a33004dc006243d5fb`)
        .then(data => data.text())
        .then(html => {
            const $ = cheerio.load(html)

            $('#lista-episodios-content a').each(function(i, el) {
                feed.item({
                    title: $(el).find('.item-title').text().trim().replace('Governo Sombra - ', ''),
                    url: process.env.BASE_URL + $(el).attr('href'),
                    date: $(el).find('.item-date').text(),
                });
            })

            fs.writeFile("./rss.xml", feed.xml({ indent: true }), (err) => {
                if (err) throw new Error(err);
            })
        })
}

async function run() {
    try {
        await scrape()
    } catch (e) {
        console.error(e.message)

        if (process.env.ENV === 'live') {
            await fetch(`https://api.pushover.net/1/messages.json`, {
                method: 'post',
                body: JSON.stringify({
                    token: process.env.PUSHOVER_TOKEN,
                    user: process.env.PUSHOVER_USER,
                    title: "Scraper",
                    message: e.message
                }),
                headers: { 'Content-Type': 'application/json' }
            })
            .then(res => res.json())
            .then(json => console.log(json));
        }
    }
}

module.export = run()

