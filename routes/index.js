'use strict';
var express = require('express');
var router = express.Router();
const axios = require('axios');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const fs = require('fs');
const path = require('path');
const filePath = path.join('C:', 'Users', 'lg', 'Documents', 'DigimonCard', 'data.json');
const getHTML = async (keyword) => {

    try
    {
       
      
        return await axios.get("https://digimoncard.co.kr/index.php?mid=cardlist&category=" + keyword);

    }

    catch(err)
    {
        console.log(err); 
    }


} 

function removeNewlinesAndTabs(input) {
    return input.replace(/\t/g, '');
}

// 스타일에 맞게 파싱하는 함수

function parseString(input) {
    return input.trim().split('\n').filter(item => item !== '');
}


let booster = [];

const parsing = async (keyword) => {

    const html = await getHTML(keyword);
    const $ = cheerio.load(html.data);
    const $CardList = $(".popup");
    const $CardSpec = $(".cardinfo_top_body");
    const $CardEvolEffec = $("cardinfo_bottom");
    $CardList.each((idx, node) => {
        const title = $(node).find(".card_name").text();
        const processedString = removeNewlinesAndTabs($(node).find(".cardinfo_top_body > dl").text());// 디지몬의 스펙
        const parsedArray = parseString(processedString);
        const processedString_effect = removeNewlinesAndTabs($(node).find(".cardinfo_bottom> dl").text());// 디지몬 효과(효과/진화원효과/시큐리티 효과 )
        const parsedArray_effect = parseString(processedString_effect);
        booster.push({
            Card_Num: removeNewlinesAndTabs($(node).find(".card_name").text()),
            img: "https://digimoncard.co.kr/" + $(node).find(".cardinfo_top > .card_img > img").attr("src"),
            stage: parsedArray[1],
            Type: parsedArray[3],
            Shape: parsedArray[5],
            DP: parsedArray[7],
            Play_Cost: parsedArray[9],
            Evol_Cost1: parsedArray[11],
            Evol_Cost2: parsedArray[13],
            Effect: parsedArray_effect[1],
            Soure_effect: parsedArray_effect[3],
            Security: parsedArray_effect[5],
            Buying_Source: parsedArray_effect[7]
            
            

        })

    });

   // console.log(courses);
    
}

let st = "239";
let buffer = iconv.encode(st, 'utf8');
let decodedString = iconv.decode(buffer, 'utf8');
parsing(decodedString);
/* GET home page. */


router.get('/', function (req, res) {

    res.send('DigitalGateOpen!!!')
});

router.get('/deck', function (req, res) {

    res.send(booster)
    const jsonString = JSON.stringify(booster);
    fs.writeFile(filePath, jsonString, 'utf8', (err) => {
        if (err) {
            console.error('파일 저장 오류:', err);
        } else {
            console.log('JSON 파일이 성공적으로 생성되었습니다.');
        }
    });
});



module.exports = router;
