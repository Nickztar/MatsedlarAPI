const axios = require('axios');
const cheerio = require('cheerio');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

app.get('/', async(req,res)=>{
    await getData().then(response => {
        res.send(response);
    }).catch(err => {
        res.send(err);
    })
});

const url = 'https://webmenu.foodit.se/?r=13&m=1380&p=789&c=10120&w=0&v=Week&l=undefined';

async function getData(){
    const foodData = [];
    await axios(url).then(response => {
        const html = response.data;
        const $ = cheerio.load(html);
        const foodList = $('#MenuRowContent > li');
    
        foodList.each(function(){
            const foods = [];
            const day = $(this).find('.block-a > strong').text();
            const date = $(this).find('.block-a > span').text();
            $(this).find('.meal-text', '.dis-inline').each(function(){
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

app.listen(4999, console.log(4999));