const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const randomUseragent = require('random-useragent');

const request = require('request-promise');
require('dotenv').config();

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.once('ready', () => {
    console.log('Bot is online!');
});

client.on('messageCreate', async message => {
    if (message.content.startsWith('$Check')) {


        // Read and update URLs from list.txt
        const filePath = path.join(__dirname, 'list.txt');
        const urls = fs.readFileSync(filePath, 'utf-8').split('\n').filter(Boolean);
        const updatedUrls = urls.map(updateDatesAndPeopleInUrl);

        const results = [];
        // Process each updated URL
        for (const url of updatedUrls) {
            try {
                const data = await visitAndScrape(url);
                console.log("data: ", data)
                if (data) {
                    if (!data.imageFound || !data.priceFound || !data.titleFound) {

                        // console.log('Missing elements:', {
                        //     imageFound: data.imageFound,
                        //     priceFound: data.priceFound,
                        //     titleFound: data.titleFound,
                        //     roomSizeFound: data.roomSizeFound
                        // });
                        await message.channel.send(`Missing Values: ${url}`);

                    }
                    else {

                        const embed = new EmbedBuilder()
                            .setTitle(data.title)
                            .setImage(data.image)
                            .addFields(
                                { name: 'Price', value: data.price, inline: true },
                                { name: 'Room Size', value: data.roomSize, inline: true }
                            )
                            .setURL(url)
                            .setColor('#0099ff');

                        results.push(embed);
                        await message.author.send({ embeds: [embed] });
                    }
                } else {
                    await message.channel.send(`Failed to fetch data for URL: ${url}`);
                }
            } catch (err) {
                console.error(`Failed to fetch data for URL: ${url}`, err);
                // if (err.toString() == "unspecified") {
                //     await message.channel.send(`unspecified size: ${url}`)

                //     return;
                // }
                await message.channel.send(`Failed to fetch data for URL: ${url}`);
            }
        }

        // if (results.length > 0) {
        //     await message.author.send({ embeds: results });
        // }
        await message.channel.send('Details have been sent to your DM.');
    }
});

function updateDatesAndPeopleInUrl(url) {
    const today = new Date();
    const checkinDate = new Date(today);
    const checkoutDate = new Date(today);

    checkinDate.setDate(today.getDate() + 1);
    checkoutDate.setDate(today.getDate() + 2);

    const formattedCheckin = checkinDate.toISOString().split('T')[0];
    const formattedCheckout = checkoutDate.toISOString().split('T')[0];

    // Update checkin and checkout dates
    if (url.includes('checkin=')) {
        url = url.replace(/checkin=\d{4}-\d{2}-\d{2}/, `checkin=${formattedCheckin}`);
    } else {
        url += `&checkin=${formattedCheckin}`;
    }

    if (url.includes('checkout=')) {
        url = url.replace(/checkout=\d{4}-\d{2}-\d{2}/, `checkout=${formattedCheckout}`);
    } else {
        url += `&checkout=${formattedCheckout}`;
    }

    // Ensure adults=1 and children=0
    if (url.includes('adults=')) {
        url = url.replace(/adults=\d+/, 'adults=1');
    } else {
        url += '&adults=1';
    }

    if (url.includes('children=')) {
        url = url.replace(/children=\d+/, 'children=0');
    } else {
        url += '&children=0';
    }

    return url;
}
function updateDatesAndPeopleInUrl(url) {
    const today = new Date();
    const checkinDate = new Date(today);
    const checkoutDate = new Date(today);

    checkinDate.setDate(today.getDate() + 1);
    checkoutDate.setDate(today.getDate() + 2);

    const formattedCheckin = checkinDate.toISOString().split('T')[0];
    const formattedCheckout = checkoutDate.toISOString().split('T')[0];

    // Update checkin and checkout dates
    if (url.includes('checkin=')) {
        url = url.replace(/checkin=\d{4}-\d{2}-\d{2}/, `checkin=${formattedCheckin}`);
    } else {
        url += `&checkin=${formattedCheckin}`;
    }

    if (url.includes('checkout=')) {
        url = url.replace(/checkout=\d{4}-\d{2}-\d{2}/, `checkout=${formattedCheckout}`);
    } else {
        url += `&checkout=${formattedCheckout}`;
    }

    // Ensure adults=1 and children=0
    if (url.includes('adults=')) {
        url = url.replace(/adults=\d+/, 'adults=1');
    } else {
        url += '&adults=1';
    }

    if (url.includes('children=')) {
        url = url.replace(/children=\d+/, 'children=0');
    } else {
        url += '&children=0';
    }

    if (url.includes('selected_currency=')) {
        url = url.replace(/children=\d+/, 'selected_currency=USD');
    } else {
        url += '&selected_currency=USD';
    }
    // selected_currency

    return url;
}

async function visitAndScrape(url) {
    try {
        url = updateDatesAndPeopleInUrl(url);
        console.log("visiting:", url);
        const options = {
            method: 'GET',
            url: url,
            qs: {
                // selected_currency: 'USD'
            },
            headers: {
                'cookie': 'px_init=0; pcm_personalization_disabled=0; pcm_consent=analytical%3Dtrue%26countryCode%3DPK%26consentId%3Dc545bdfc-9d0d-4f77-b605-b410016cc489%26consentedAt%3D2024-07-27T08%3A48%3A16.141Z%26expiresAt%3D2025-01-23T08%3A48%3A16.141Z%26implicit%3Dtrue%26marketing%3Dtrue%26regionCode%3DPB%26regulation%3Dnone%26legacyRegulation%3Dnone; cors_js=1; px_init=0; bkng_sso_session=e30; bkng_sso_ses=e30; _gcl_au=1.1.1845631761.1722070414; FPID=FPID2.2.6Xi12RHy7g4NPHQUiKRJmqLvNgGirOwxZ3cGsY6CFeg%3D.1722070120; _yjsu_yjad=1722070420.fce0b073-127c-46fe-9878-ccd38b837014; _pin_unauth=dWlkPU9EZzNZVE5pTnpFdFlURmxOQzAwWWpZeUxXRmxaVE10T1RSbE9EUmpNMlk1WVdGbA; BJS=-; _gid=GA1.2.824691717.1722448889; bkng_prue=1; FPLC=s%2B%2By3HBwI0JS9%2BMWSkD74J2ZF%2BJW1sDBxptqlHSWz7%2FjkvcrtUvAImqAXvRzvJCoBkY3WnKJPZW%2FOtAMAYjgEDclHNBuXNbrL4EuwYM0W8rxAAf3u%2FeJZBuCrtv3Sw%3D%3D; bkng_sso_auth=CAIQsOnuTRpmZpbzU77OfhYJDYJkkFlZPad/TvXFQ9PoZMZusnIZj7s8eK96HI/oz6ggj9FGfB+rh16Y3pdb8WY78BmYJLgr2WNs57ZpljlblH06anFOTOG/JC0PgxdpNRHVxlLkCuIq0E5HCmJh; cgumid=icAkjK55vICK7WjE3OpVrXFryroeqdVM; OptanonConsent=implicitConsentCountry=nonGDPR&implicitConsentDate=1722070115348&isGpcEnabled=0&datestamp=Thu+Aug+01+2024+15%3A51%3A44+GMT%2B0500+(Pakistan+Standard+Time)&version=202403.2.0&browserGpcFlag=0&isIABGlobal=false&hosts=&consentId=f1e8cd66-3b5e-4cd2-ad38-172ea4a93276&interactionCount=1&isAnonUser=1&landingPath=NotLandingPage&groups=C0001%3A1%2CC0002%3A1%2CC0004%3A1&AwaitingReconsent=false; _ga=GA1.1.836749112.1722070120; cto_bundle=b_VhUV9xJTJCR2pyQnNxUnoyYVN3TkxmMVFLdmNzOExIYnlqZ1NWbGwlMkZlazJPb3BWTkFNb09PcGRLenphUmR5eWNRJTJGWGp1ZWVGYyUyRkRnYjY1alZVbnpBY0Q0ZnpualZqS1pKdGZOVU1ZdUFZSEJlQ3ByUHJJTjdsYkdZQXQlMkIlMkI4Y3dLcXhxMjlnViUyRmlhTU5ZUFdYVXQlMkJnb2tYTjRETXhBZ1UwTFE4Rmhtc1l0VkNOTVdBeUdBQklBU2sxZTh3RCUyQlg1V0tpRThGZ0hLWDB5WTBFSXVsJTJCJTJCZXNpTHlwUSUzRCUzRA; _ga_SEJWFCBCVM=GS1.1.1722508455.11.1.1722509512.43.0.0; _ga_A12345=GS1.1.1722508456.11.1.1722509519.0.0.140840793; _uetsid=06b5ca004f6711efa7dd17cb8e8358c3; _uetvid=b7b7aa104bf511ef85db49580f763ed5; bkng=11UmFuZG9tSVYkc2RlIyh9Yaa29%2F3xUOLbVA9iGwA%2BUSyAyE4EOjZnxydP%2B4mUpYvTQjF2q0XYUAGXM%2BtCxkK2vXGTj2%2BeCF01TElcb4CpBLKDtVe89ZVmmV%2F41EHdycWuIg3QY%2FuViC1wDIX8ZXbfrI%2FcuTzUicRzLFeqZnNOLY6U4j7MXKxDaLyWlraEKzHMZFmlwUiZT4I%3D; aws-waf-token=0dda77a8-49d2-485e-8f2b-f9723e944d93:BQoAg+9LRHa6AQAA:nDX1XQFGZQ12lIx0LwVoLLJztxLSJCv0rYEamGNPOWP1TPJTnmmnWV1K440jkorrvZdQc8yD/wQOfrOugwPLM4zm0WF++mx9BDOSYPPaTwPaELWc6/oK9S4wwPDsdm3Td+U/nR02YBZx34pJE24TxW70Zxs9acC+kXxT6uu0bGej5iZsx77uL1I9Wa3hbXla3Xi06i/vzeD1TxP3mXZnnDkfL9Z17Mcmt5MGFOH4accTOCoXGhIaAkzLyyYv9Fuv6E8=; lastSeen=0',


                // 'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                // 'accept-language': 'en-US,en;q=0.9',
                // 'cache-control': 'no-cache',
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                'Connection': 'keep-alive',
                'Pragma': 'no-cache',
                'Cache-Control': 'no-cache',
                'DNT': '1',
                'Upgrade-Insecure-Requests': '1',
                // # You may want to change the user agent if you get blocked
                // 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.113 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',

                'Referer': 'https://www.booking.com/index.en-gb.html',
                'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
            },
            resolveWithFullResponse: true
        };

        let response = await request(options);
        let hotelName = null;
        let Image = null;
        let Price = null;
        let roomSize = "unspecified";

        // Logging the response body for debugging


        try {
            let hotelNamePart = response.body.split("b_hotel_name: '");
            hotelName = hotelNamePart[1] ? hotelNamePart[1].split("'")[0] : null;
            if (typeof hotelName !== 'string' || hotelName.trim() === '') {
                console.log('Invalid hotelName:', hotelName);
                hotelName = null;
            }
        } catch (e) {
            console.log("hotelName Error: ", e);
        }
 

        try {
            let parts = response.body.split("allRoomPhotos:");
            if (parts.length > 1) {
                let imageParts = parts[1].split("large_url: '");
                if (imageParts.length > 1) {
                    Image = imageParts[1].split("'")[0];
                }
            }
            if (typeof Image !== 'string' || Image.trim() === '') {
                console.log('Invalid Image:', Image);
                Image = null;
            }
        } catch (e) {
            console.log("Image Error: ", e);
        }

        try {
            // response.body.split("allRoomPhotos:")[1].split("large_url:'")[1].split("'");
            Price = response.body.split("b_rooms_available_and_soldout:")[1].split('b_blocks":')[1].split('"b_price":"')[1].split('"')[0];
            console.log("Price: :", Price);
            if (Price.length == 0) {
                Price = response.body.split("b_rooms_available_and_soldout:")[1].split('"b_price":"')[2].split('"')[0];
            }
        } catch (e) {
            if (response.body.includes('have no availability here between') || response.body.includes('have no availability') || response.body.includes('For your check-in date, there is a minimum length of stay')) {
                Price = "price not available";
            }
            else {
                console.log("Price Error: ", e);
            }
            Price = "price not available";
        }

        try {
            let parts = response.body.split('data-name-en="room size"');
            if (parts.length > 1) {
                roomSize = parts[1].split('</svg>')[1]?.split("</span>")[0] || '';
            }
            if (typeof roomSize !== 'string' || roomSize.trim() === '') {
                console.log('Invalid Image:', roomSize);
                roomSize = null;
            }
        } catch (e) {
            console.log("roomSize Error: ", e);
        }

        console.log(`Hotel Name: ${hotelName}`);
        console.log(`Image: ${Image}`);
        console.log(`Price: ${Price}`);
        console.log(`Room Size: ${roomSize}`);

        let data = {
            "image": Image,
            "price": Price,
            "roomSize": roomSize,
            "title": hotelName,
            "imageFound": !!Image,
            "titleFound": !!hotelName,
            "roomSizeFound": !!roomSize,
            "priceFound": !!Price
        };
        // console.log("dd:", data);

        // if (!data.roomSizeFound) {
        //     return "unspecified";
        // }
        return data;
        // if (!data.imageFound || !data.priceFound || !data.titleFound) {

        //     // console.log('Missing elements:', {
        //     //     imageFound: data.imageFound,
        //     //     priceFound: data.priceFound,
        //     //     titleFound: data.titleFound,
        //     //     roomSizeFound: data.roomSizeFound
        //     // });
        //     throw new Error('Required elements not found');
        // }

        // return data;
    } catch (error) {

        console.log(`Error while processing URL111: ${url}`, error);

    }
    return {
        "imageFound": false,
        "titleFound": false,
        "roomSizeFound": false,
        "priceFound": false,
    };
}

// async function visitAndScrape(url) {
//     try {
//         console.log("visiting:", url)
//         var options = {
//             'method': 'GET',
//             'url': url,
// qs: {
//     // selected_currency: 'USD'
// },
//             'headers': {
//                 // accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
//                 // 'accept-language': 'en-US,en;q=0.9',
//                 // 'cache-control': 'no-cache',
//                 // pragma: 'no-cache',
//                 // priority: 'u=0, i',
//                 // 'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
//                 // 'sec-ch-ua-mobile': '?0',
//                 // 'sec-ch-ua-platform': '"Windows"',
//                 // 'sec-fetch-dest': 'document',
//                 // 'sec-fetch-mode': 'navigate',
//                 // 'sec-fetch-site': 'none',
//                 // 'sec-fetch-user': '?1',
//                 // 'upgrade-insecure-requests': '1',
//                 // 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
//                 'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
//                 'accept-language': 'en-US,en;q=0.9',
//                 'cache-control': 'no-cache',
//                 'cookie': 'pcm_personalization_disabled=0; bkng_sso_auth=CAIQsOnuTRpme6EefdYbqtmqCgF8OIM47eegMXNBugGYujtK14jZlHJcIscvsiDTNhxjsz1xVEw46D5ryRXHanHSK7hVbSgbskxlgKbfU/5l+G40PI9PPN10P/KyquNhOhs1ys4e/9J/F79fIWDN; pcm_consent=analytical%3Dtrue%26countryCode%3DPK%26consentId%3Dc545bdfc-9d0d-4f77-b605-b410016cc489%26consentedAt%3D2024-07-27T08%3A48%3A16.141Z%26expiresAt%3D2025-01-23T08%3A48%3A16.141Z%26implicit%3Dtrue%26marketing%3Dtrue%26regionCode%3DPB%26regulation%3Dnone%26legacyRegulation%3Dnone; cors_js=1; px_init=0; bkng_sso_session=e30; bkng_sso_ses=e30; _gcl_au=1.1.1845631761.1722070414; bkng_prue=1; FPID=FPID2.2.6Xi12RHy7g4NPHQUiKRJmqLvNgGirOwxZ3cGsY6CFeg%3D.1722070120; _yjsu_yjad=1722070420.fce0b073-127c-46fe-9878-ccd38b837014; _pin_unauth=dWlkPU9EZzNZVE5pTnpFdFlURmxOQzAwWWpZeUxXRmxaVE10T1RSbE9EUmpNMlk1WVdGbA; OptanonConsent=implicitConsentCountry=nonGDPR&implicitConsentDate=1722070115348&isGpcEnabled=0&datestamp=Sat+Jul+27+2024+15%3A52%3A21+GMT%2B0500+(Pakistan+Standard+Time)&version=202403.2.0&browserGpcFlag=0&isIABGlobal=false&hosts=&consentId=f1e8cd66-3b5e-4cd2-ad38-172ea4a93276&interactionCount=1&isAnonUser=1&landingPath=NotLandingPage&groups=C0001%3A1%2CC0002%3A1%2CC0004%3A1&AwaitingReconsent=false; _ga=GA1.1.836749112.1722070120; cgumid=0y8bAxck4QEds71GFzYoz7ixg503D08h; cto_bundle=fZqISl85TFk1eXlzWjVVcElLTlAwM0E4NXBPJTJCUWw2aDB6dkFtWkNvTzVhQUJ1UHFWYUEyZCUyQjQlMkZzZjh0aVRhd1NGYmhlMWtBJTJCd2xUNHc0bFRPdE5mQUhGMHIwemRyaG5xcVkzY1prNlpoNEtvcWlnY2syOCUyRm5NVXM0UU5QaG1JeE83RElaR0JHSUlWWU91M3hURkZicWh0eFVBaUgwaHYlMkJ2ZWhsYlVqWnZCZlk5UmFrVVY3V09vMTlaRVZJYkJqYmxOVklZcmJOZ1E3SVFuVGxoVzdNNCUyQnozd1ElM0QlM0Q; _uetvid=b7b7aa104bf511ef85db49580f763ed5; bkng=11UmFuZG9tSVYkc2RlIyh9Yaa29%2F3xUOLbiKbS0JOgDBJQ9fUVQuM5HRrvGlErZOpS1dlIu3CZKi%2BJ4lrT1PvCg98yXbboNER0%2BOlgtmVMFi%2Fsi7a9MnGwRjObiPkiKptbyx0hFDA%2BitCc6AWGYP7wvTzw9O3K2fOTv%2F6J24coNiMcAqBsFpcIRuomg%2BLIAIiBS83vpPn5I%2BQ%3D; _ga_SEJWFCBCVM=GS1.1.1722085551.4.0.1722085551.60.0.0; _ga_A12345=GS1.1.1722085551.4.0.1722085551.0.0.120973716; aws-waf-token=1db29c5e-b7f0-43c3-aaa8-3ae85165beea:BQoAk5la4aHgAAAA:1+91LO15Rf7+crIiigLa1/c7QTUOYbk+ViICAOH4inWakJ0kxv5KkzMO2vHcjKyjqfLbntH6eLPbOHBBDHI0C1nhwiFh23W3ZL84K+/O6ghQ3lAbcufem9TQvZRFRpxWf4tDorOKhhFL+LNC7Q81Hmf1n0OuOrdjXU+G6Si5X29DU7faRdli8/0dyImNYVvi65xOL7qeEWuZpyytx+g7FX4wmfnhxileOc8U0STun6tLJQNScqyuQLjmsLNtS7ehDmI=; lastSeen=1722085553836; px_init=0; bkng=11UmFuZG9tSVYkc2RlIyh9Yaa29%2F3xUOLblgO%2Fz4BDP5vUAojrF7%2BtvAkZqLDSahPK%2BqCD2IpOrDktqXzRyVYc0u8K6HtgmvgnIHLGMVm0%2FkrsOCIV9di75v1dWTcrlXoQXTEtcs2vV7FYCFls4gReiTnpUP6xccaIllV8Wyp1SPDM5D%2FUNnt66v7Sqv8KJLKEvgaJZFZHDl0%3D; bkng_sso_auth=CAIQsOnuTRpmGnLAYnQttcyUhGLhgrysNS9xOoHguPqslcdmtTq9bTdSZYZxrYNYAn9aLyyt10oz75a94912SiQ4HHHzewqCwIOw9ETzfm270JAGUJfD/HBw4kNKWgw555TTTdHH4zgpFGxWW7GB; pcm_consent=analytical%3Dtrue%26countryCode%3DPK%26consentId%3Dc1f2ec5c-54b4-47cb-9146-27626c786fc4%26consentedAt%3D2024-07-27T11%3A14%3A32.731Z%26expiresAt%3D2025-01-23T11%3A14%3A32.731Z%26implicit%3Dtrue%26marketing%3Dtrue%26regionCode%3DPB%26regulation%3Dnone%26legacyRegulation%3Dnone; pcm_personalization_disabled=0',

//                 'pragma': 'no-cache',
//                 'priority': 'u=0, i',
//                 'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
//                 'sec-ch-ua-mobile': '?0',
//                 'sec-ch-ua-platform': '"Windows"',
//                 'sec-fetch-dest': 'document',
//                 'sec-fetch-mode': 'navigate',
//                 'sec-fetch-site': 'none',
//                 'sec-fetch-user': '?1',
//                 'upgrade-insecure-requests': '1',
//                 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
//                 // 'Cookie': 'px_init=0; bkng=11UmFuZG9tSVYkc2RlIyh9Yaa29%2F3xUOLbof7CEiNviT%2BaOIlyaOjnLvW06utKRN85BxeUp4EGgyXaa%2FZSCt8T%2Bm0dK2xeQk9X3qTPPGf49cC7jeTeUAaZ2PBI38j%2BW8SUSY8kwmUgqQ7x9WmirMZIW0PnsipCytvkrtzwD3ZCHB%2Byof2EYDLL8GQlEqWal37slkLPFhO4Fqo%3D; bkng_sso_auth=CAIQsOnuTRpmQwdQlTx13xcuuNuIy3hFcBG+Vh1cT9lJCXGuQDHNgEsgM0Jr8bUGBZpJRhu3iIRLAMhM3ZEM3Wk1EP2YbCSd5KIPQztMkPTsV1wZ+dr+8bf0Kogp77YLfUgC7fhwzb5TrMX06n5N; pcm_consent=analytical%3Dtrue%26countryCode%3DPK%26consentId%3Dc1f2ec5c-54b4-47cb-9146-27626c786fc4%26consentedAt%3D2024-07-27T11%3A14%3A32.731Z%26expiresAt%3D2025-01-23T11%3A14%3A32.731Z%26implicit%3Dtrue%26marketing%3Dtrue%26regionCode%3DPB%26regulation%3Dnone%26legacyRegulation%3Dnone; pcm_personalization_disabled=0'
//             },
//             resolveWithFullResponse: true
//         };

//         let response = await request(options);

//         let hotelName = null;
//         let Image = null;
//         let Price = null;
//         let roomSize = null

//         try {
//             // console.log(await page.evaluate(() => window.booking.env))
//         }
//         catch (e) {
//             console.log(e);
//         }
//         try {
//             hotelName = response.body.split("b_hotel_name: '")[1].split("'")[0]
//             // await page.evaluate(() => window.booking.env.b_hotel_name);
//         }
//         catch (e) {
//             console.log("hotelName Error: ", e);
//         }
// console.log("ereee");
// fs.writeFile(`${hotelName}.txt`, response.body, 'utf-8', ((err) => {
//     if (err) {
//         console.error('Error writing to file:', err);
//     } else {
//         console.log('File written successfully!');
//     }
// }));
//         try {
//             Image = response.body.split("allRoomPhotos:")[1].split("large_url: '")[1].split("'")[0];
//             console.log(Image)
//             // Image = await page.evaluate(() => window.booking.env.allRoomPhotos[0].large_url);
//         }
//         catch (e) {
//             console.log("Image Error: ", e);
//         }
//         try {
// // response.body.split("allRoomPhotos:")[1].split("large_url:'")[1].split("'");
// Price = response.body.split("b_rooms_available_and_soldout:")[1].split('b_blocks":')[1].split('"b_price":"')[1].split('"')[0];
// console.log(Price)
// if (Price.length == 0) {
//     Price = response.body.split("b_rooms_available_and_soldout:")[1].split('b_blocks":')[1].split('"b_price":"')[2].split('"')[0];
// }
//             // console.log(response.body.split("b_rooms_available_and_soldout:")[1].split("b_cheapest_price_that_fits_search_eur")[1]);
//             // Price = JSON.parse(response.body.split("b_rooms_available_and_soldout:")[1].split("b_cheapest_price_that_fits_search_eur")[1])[0].b_blocks[0].b_price;
//             // // Price = await page.evaluate(() => window.booking.env.b_rooms_available_and_soldout[0].b_blocks[0].b_price);
//         }
//         catch (e) {
//             console.log("Price Error: ", e);
//         }
//         try {
//             roomSize = response.body.split('data-name-en="room size"')[1].split('</svg>')[1].split("</span>")[0];
//             console.log(roomSize);
//             // roomSize = document.querySelector(`[data-name-en="room size"]`).innerText;
//         }
//         catch (e) {
//             console.log("roomSize Error: ", e);
//         }
//         // await page.screenshot({ path: 'example.png' });

//         console.log(`Hotel Name: ${hotelName}`);
//         console.log(`Image: ${Image}`)
//         console.log(`Price: ${Price}`);
//         console.log(`Room Size: ${roomSize}`);
//         let data = {
//             "image": Image,
//             "price": Price,
//             "roomSize": roomSize,
//             "title": hotelName,
//             "imageFound": Image != null && Image != undefined,
//             "titleFound": hotelName != null && hotelName != undefined,
//             "roomSizeFound": roomSize != null && roomSize != undefined,
//             "priceFound": Price != null && Price != undefined
//         }


//         if (!data.roomSizeFound) {
//             throw new Error("unspecified");
//         }
//         if (!data.imageFound || !data.priceFound || !data.titleFound) {
//             console.log('Missing elements: ', {
//                 imageFound: data.imageFound,
//                 priceFound: data.priceFound,
//                 titleFound: data.titleFound,
//                 roomSizeFound: data.roomSizeFound
//             });
//             throw new Error('Required elements not found');
//         }
//         else if (!data.roomSizeFound) {
//             throw new Error("unspecified");
//         }

//         return data;
//     }
//     catch (error) {
//         console.log(`Error while processing URL: ${url}`, error);
//         return error;
//     }

// }

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

client.login(process.env.BOT_TOKEN);
