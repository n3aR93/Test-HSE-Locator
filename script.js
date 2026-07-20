// ===============================
// HSE SITE FINDER
// ===============================


const searchBox = document.getElementById("searchBox");
const result = document.getElementById("result");

const manualButton = document.getElementById("manualButton");
const locationButton = document.getElementById("locationButton");
const searchButton = document.getElementById("searchButton");



// ===============================
// START SCREEN
// ===============================

window.onload = function(){

    result.innerHTML = `
    Choose how you want to find RAMS
    `;

};



// ===============================
// MANUAL SEARCH BUTTON
// ===============================

function showManualSearch(){

    searchBox.style.display = "block";
    searchButton.style.display = "block";

    manualButton.style.display = "none";
    locationButton.style.display = "none";

    result.innerHTML = `
    Enter postcode and press Open RAMS
    `;

    searchBox.focus();

}



// ===============================
// GET POSTCODE
// ===============================

function getPostcode(address){

    let match = address.match(
        /[A-Z]{1,2}[0-9][0-9A-Z]?\s?[0-9][A-Z]{2}/i
    );


    if(match){

        return match[0]
        .replace(/\s/g,"")
        .toUpperCase();

    }


    return "";

}




// ===============================
// ENTER KEY
// ===============================

searchBox.addEventListener(
"keypress",
function(e){

    if(e.key==="Enter"){

        manualSearch();

    }

});




// ===============================
// MANUAL SEARCH
// ===============================

function manualSearch(){


    let input =
    searchBox.value.trim();


    let postcode =
    getPostcode(input);


    if(!postcode){

        result.innerHTML =
        "Please enter a valid postcode";

        return;

    }


    findSiteByPostcode(postcode);


}




// ===============================
// LOCATION SEARCH
// ===============================

function getLocation(){


    result.innerHTML = `
    📍 Checking location...
    `;


    navigator.geolocation.getCurrentPosition(


    async function(position){


        let lat =
        position.coords.latitude;


        let lon =
        position.coords.longitude;



        result.innerHTML = `
        📍 Location found
        <br>
        Finding postcode...
        `;



        try{


            let response =
            await fetch(
            `https://api.postcodes.io/postcodes?lat=${lat}&lon=${lon}`
            );


            let data =
            await response.json();



            let postcode =
            data.result[0].postcode
            .replace(/\s/g,"")
            .toUpperCase();



            findSiteByPostcode(postcode);



        }


        catch{


            result.innerHTML =
            "❌ Could not find postcode";


        }



    },



    function(){


        result.innerHTML = `

        ❌ Location permission denied

        <br><br>

        Please allow location or use manual search

        `;


    },


    {

        enableHighAccuracy:true,
        timeout:10000,
        maximumAge:0

    }


    );

}




// ===============================
// FIND RAMS
// ===============================

async function findSiteByPostcode(postcode){


    let response =
    await fetch("sites.json");


    let sites =
    await response.json();



    let matches =
    sites.filter(site =>
        getPostcode(site.address) === postcode
    );



    if(matches.length===0){

        result.innerHTML =
        `❌ No RAMS found for ${postcode}`;

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

            openPDF(matches[0].pdf);

        },500);


        return;

    }



    let html =
    `
    <h3>Select RAMS</h3>
    `;


    matches.forEach(site=>{


        html +=
        `
        <button onclick="openPDF('${site.pdf}')">

        ${site.address}

        </button>
        <br><br>
        `;


    });



    result.innerHTML = html;


}




// ===============================
// OPEN PDF
// ===============================

function openPDF(link){

    window.open(link,"_blank");

}
