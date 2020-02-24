const axios = require('axios');
const cheerio = require('cheerio');
const express = require('express');
const cors = require('cors');
const matData = require('./mat.json');
const urls = mapSkola(matData.skolor);
const schools = formatSchool(matData);

const app = express();
app.use(cors());
app.use(express.json());

//?school=SEARCH PARAM
app.get('/schools', (req,res)=>{
    if (req.query.school){
        res.send(findSchools(req.query.school.toLowerCase()));
    }else{
        res.status(200).json(schools);
    }
});
app.post('/schools', (req, res) => {
    const names = req.body.names;
    const validSchools = [];
    names.forEach(name => {
        const schools = findSchools(name.toLowerCase())[0]
        if (schools){
            validSchools.push(schools)
        }
    });
    res.status(200).json(validSchools);
})
app.get('/:id/:week', async (req, res) => {
    const id = parseInt(req.params.id);
    const week = req.params.week;
    if (id > urls.size) return res.status(404).send("School not found") ;
    const preUrl = urls.get(id).url;
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

function mapSkola(skolor){
    const urlMap = new Map();
    skolor.map((skola, index) => {
        urlMap.set(index, skola);
    });
    return urlMap;
}
function formatSchool(data){
    const skola = data.skolor.map((skola, index) => {
        return {value: index, label: skola.namn};
    });
    return skola;
}
function findSchools(name){
    const match = schools.filter(skola => {
        const label = skola.label.toLowerCase();
        if(label.includes(name)){
            return skola;
        };
    });
    return match;
}

app.listen(process.env.PORT || 4000, console.log('working'));