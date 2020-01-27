const axios = require('axios');
const cheerio = require('cheerio');
const express = require('express');
const cors = require('cors');
const urls = ['https://webmenu.foodit.se/?r=13&m=1380&p=789&c=10120&w=0&v=Week&l=undefined','https://webmenu.foodit.se/?r=13&m=1380&p=787&c=10118&w=0&v=Week&l=undefined'];

const app = express();

app.use(cors());
// /0/0 = kattegatt current week
// /0/1 = kattegatt next week
// /1/0 = sannarp current
app.get('/:id/:week', async (req, res) => {
    const id = req.params.id;
    const week = req.params.week;
    if (id > urls.length-1) return res.status(404).send("School not found") ;
    const preUrl = urls[req.params.id];
    const url = preUrl.replace('w=0', `w=${week}`);
    await getData(url).then(response => {
        res.send(response);
    }).catch(err => {
        res.status(500).send(err);
    })
});

async function getData(url) {
    const foodData = [];
    await axios(url).then(response => {
        const html = response.data;
        const $ = cheerio.load(html);
        const foodList = $('#MenuRowContent > li');

        foodList.each(function () {
            const foods = [];
            const day = $(this).find('.block-a > strong').text();
            const date = $(this).find('.block-a > span').text();
            $(this).find('.meal-text', '.dis-inline').each(function () {
                foods.push($(this).text());
            });
            foods.reverse();
            foodData.push({
                day,
                date,
                foods
            });
        });
    }).catch(err => {
        console.log(err);
    })
    return foodData;
}

app.listen(process.env.PORT || 4000, console.log('working'));