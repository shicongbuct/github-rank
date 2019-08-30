import fetch from 'node-fetch';
import cheerio from 'cheerio';
import { sleep } from './sleep';
import path from 'path';

import { ScholarUserModel } from './scholarUserModel';


async function initScholarUser() {
    await ScholarUserModel.sync({ force: false })
}

const baseUrl: string = `https://scholar.google.com`;

export interface ScholarUser {
    id: string;
    name: string;
    desc: string;
    page_url: string;
    cite: string;
    major: string;
    photo: string;
    [key: string]: any;
}

interface fetchResult {
    next_url: string;
    isContuinue: boolean;
    data: ScholarUser[];
}

export async function getScholarUsers(capital: string) {
    let url = `https://scholar.google.com/citations?view_op=search_authors&mauthors=${capital}`;
    //let url = `https://scholar.google.com//citations?view_op=search_authors&hl=zh-TW&oe=ASCII&mauthors=a&after_author=XZgAADF6_v8J&astart=140`;
    while (true) {
        let {isContuinue, data, next_url} = await fetchUserList(url);
        url = baseUrl + next_url;
        console.log(url)
        // save data
        await saveToSql(data);
        console.log(`isContuinue: ${isContuinue}`)
        if (!isContuinue) {
            console.log(`now isContuinue is ${isContuinue}, break down`);
            break;
        }
        
        await sleep(2)
    }
}

async function saveToSql(data: ScholarUser[]) {
    return new Promise(async (resolve, reject) => {
        for (let user of data) {
            await ScholarUserModel.upsert({
                id: user.id,
                name: user.name,
                desc: user.desc,
                cite: user.cite,
                major: user.major,
                photo: user.photo,
                h_index: user.h_index,
                i10_index: user.i10_index,
                cite_2014: user.cite_2014,
                h_index_2014: user.h_index_2014,
                i10_index_2014: user.i10_index_2014,
            });
        }

        return resolve()
    });
}

async function fetchUserList(url: string): Promise<fetchResult> {
    let isContuinue = true;

    return new Promise(async (resolve) => {
        let html = await fetch(url).then(res => res.text())
        //console.log(html)
        
        let $ = cheerio.load(html);


        let resultData:ScholarUser[] = []
        let next_page_url = $("button.gs_btnPR").attr('onclick').replace('window.location=', '').replace(/\'/g, "")
        console.log(next_page_url)
        next_page_url = next_page_url.replace(/\\x3d/g, '=').replace(/\\x26/g, '&')
        console.log(next_page_url);
        next_page_url = next_page_url.replace('hl=zh-TW&', 'hl=zh-CN&');
        next_page_url = next_page_url.replace('oe=BIG5&', '');

        $('#gsc_sa_ccl .gs_ai_chpr').each((idx, item) => {
            let name = $(item).find('h3.gs_ai_name a').text().trim();
            let page_url = $(item).find('h3.gs_ai_name a').attr('href').trim();
            let id = page_url.match(/user=([-\w]+)/i)[1];
            let desc = $(item).find('div.gs_ai_aff').text().trim();
            let cite_e = $(item).find('div.gs_ai_cby').text();
            let cite_match = cite_e.match(/(\d+)/g);
            console.log(cite_match);
            let cite = cite_match[0];
            let major = $(item).find('a.gs_ai_one_int').text().trim();
            let photo = $(item).find('span.gs_rimg img').attr('src').trim()
            
            let userTmpObj = {id: id, name: name, page_url: page_url, desc: desc, cite: cite, major: major, photo:photo}
            resultData.push(userTmpObj)
        });

        for (let user of resultData) {
            if (user.page_url) {
                console.log(`user.cite: ${user.cite}`);
                if (Number(user.cite) < 100000) {
                    console.log(`detect`)
                    isContuinue = false;
                }
                console.log(`page ${user.page_url} start to fetch detail`);
                user = await fetchUserDetail(user.page_url, user);
            }
        }

        console.log(resultData);
        return resolve({data: resultData, next_url: next_page_url, isContuinue: isContuinue})
    });
}


async function fetchUserDetail(url: string, s_user: ScholarUser): Promise<ScholarUser> {
    url = baseUrl + url;
    let html = await fetch(url).then(res => res.text())
    let $ = cheerio.load(html)

    let tbody_list = $('#gsc_rsb_st tbody tr')
    s_user.h_index = tbody_list.eq(1).find('td').eq(1).text().trim()
    s_user.i10_index = tbody_list.eq(2).find('td').eq(1).text().trim()
    s_user.cite_2014 = tbody_list.eq(0).find('td').eq(2).text().trim()
    s_user.h_index_2014 = tbody_list.eq(1).find('td').eq(2).text().trim()
    s_user.i10_index_2014 = tbody_list.eq(2).find('td').eq(2).text().trim()
    
    return s_user
}


!async function() {
    await initScholarUser();
    for (let i = 99; i < 123; i++) {
        let char_capital = String.fromCharCode(i)
        console.log(`start to fetch char_capital: ${char_capital}`)
        await sleep(2);
        await getScholarUsers(char_capital);
    }
}();

