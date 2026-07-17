// =====================================
// HSE RAMS FINDER - SHAREPOINT VERSION
// =====================================


const LIST_URL =
"https://northdown.sharepoint.com/sites/IPG/_api/web/lists/GetByTitle('RAMS Sites')/items";




// =====================================
// GET DATA FROM MICROSOFT LIST
// =====================================


async function getSites(){


    let response = await fetch(
        LIST_URL,
        {
            headers:{
                "Accept":"application/json;odata=nometadata"
            }
        }
    );


    let data = await response.json();


    return data.value;


}






// =====================================
// SEARCH BOX
// =====================================


const searchBox =
document.getElementById("searchBox");



searchBox.addEventListener(
"input",
function(){


    let value =
    this.value.trim();



    if(value.length < 3){


        document.getElementById("suggestions").innerHTML="";


        return;

    }



    searchSites(value);



});






// ENTER KEY

searchBox.addEventListener(
"keypress",
function(e){


    if(e.key==="Enter"){


        manualSearch();


    }


});






// =====================================
// LIVE SUGGESTIONS
// =====================================


async function searchSites(text){


    let sites =
    await getSites();



    text =
    text.toUpperCase();



    let matches =
    sites.filter(site=>{


        return site.Title
        .toUpperCase()
        .includes(text);


    });



    showSuggestions(matches);



}






function showSuggestions(matches){


    let box =
    document.getElementById("suggestions");


    box.innerHTML="";



    matches.forEach(site=>{


        let div =
        document.createElement("div");



        div.className =
        "suggestion";



        div.innerHTML =
        `
        <b>${site.Title}</b>
        `;



        div.onclick=function(){


            openPDF(
                site.PDFLink.Url
            );


        };



        box.appendChild(div);



    });



}








// =====================================
// SEARCH BUTTON
// =====================================


async function manualSearch(){


    let input =
    searchBox.value.trim();



    let result =
    document.getElementById("result");



    if(input===""){


        result.innerHTML =
        "Please enter address or postcode";


        return;

    }



    findSite(input);



}








// =====================================
// LOCATION BUTTON
// =====================================


function getLocation(){


let result =
document.getElementById("result");



result.innerHTML =
`
<div class="loading">
📍 Finding your location...
</div>
`;



navigator.geolocation.getCurrentPosition(


async function(position){



    let lat =
    position.coords.latitude;



    let lon =
    position.coords.longitude;




    try{


        let response =
        await fetch(

        `https://api.postcodes.io/postcodes?lat=${lat}&lon=${lon}`

        );



        let data =
        await response.json();



        if(!data.result){


            throw "No postcode";


        }



        let postcode =
        data.result[0].postcode;



        findSite(postcode);



    }



    catch(error){


        result.innerHTML =
        `
        ❌ Could not find postcode
        `;


    }



},



function(){


    result.innerHTML =
    `
    ❌ Location permission denied
    `;


}



);



}








// =====================================
// FIND SITE
// =====================================


async function findSite(search){


    let result =
    document.getElementById("result");



    let sites =
    await getSites();




    search =
    search
    .toUpperCase()
    .replace(/\s/g,"");





    let matches =
    sites.filter(site=>{



        let address =
        site.Title
        .toUpperCase()
        .replace(/\s/g,"");



        return address.includes(search);



    });







    if(matches.length===0){


        result.innerHTML =
        `
        ❌ No RAMS found
        <br><br>
        ${search}
        `;


        return;


    }







    if(matches.length===1){



        result.innerHTML =
        `
        ✅ RAMS found
        <br>
        Opening PDF...
        `;



        setTimeout(()=>{


            openPDF(
                matches[0].PDFLink.Url
            );



        },1000);



        return;


    }








    let html =
    `
    Multiple RAMS found:
    <br><br>
    `;




    matches.forEach(site=>{



        html +=
        `
        <button class="siteButton"
        onclick="openPDF('${site.PDFLink.Url}')">

        ${site.Title}

        </button>
        <br><br>
        `;



    });




    result.innerHTML =
    html;



}









// =====================================
// OPEN PDF
// =====================================


function openPDF(link){


    window.open(
        link,
        "_blank"
    );


}
