// ===============================
// HSE SITE FINDER
// ===============================


// LOAD ELEMENTS

const searchBox = document.getElementById("searchBox");
const result = document.getElementById("result");


// Hide manual search at start

searchBox.style.display = "none";

document.querySelector(".manual button").style.display = "none";


// ===============================
// START MENU
// ===============================

function showStartMenu() {

    result.innerHTML = `

    <h3>Find your RAMS</h3>

    <button 
    onclick="getLocation()"
    style="width:100%;padding:15px;font-size:18px;margin:10px 0;">
    
    📍 Find RAMS by Location
    
    </button>


    <button 
    onclick="showManualSearch()"
    style="width:100%;padding:15px;font-size:18px;">
    
    ⌨️ Enter Postcode Manually
    
    </button>

    `;

}


// ===============================
// MANUAL SEARCH SCREEN
// ===============================

function showManualSearch() {


    result.innerHTML = `

    <h3>Enter postcode</h3>

    `;


    searchBox.style.display = "block";

    document.querySelector(".manual button").style.display = "block";


    searchBox.focus();

}



// ===============================
// GET POSTCODE
// ===============================

function getPostcode(address) {


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

    if(e.key === "Enter"){

        manualSearch();

    }

});




// ===============================
// MANUAL SEARCH
// ===============================

async function manualSearch(){


    let input = searchBox.value.trim();



    if(input === ""){


        result.innerHTML =
        "Please enter a postcode";


        return;

    }



    let postcode = getPostcode(input);



    if(!postcode){


        result.innerHTML =
        "Please enter a valid full postcode";


        return;

    }



    findSiteByPostcode(postcode);


}





// ===============================
// LOCATION SEARCH
// ===============================

function getLocation(){



    result.innerHTML = `

    📍 Checking your location...

    <br><br>

    Please allow location access

    `;



    if(!navigator.geolocation){


        result.innerHTML =
        "❌ Location not supported";


        return;

    }



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



            if(!data.result){

                throw "No postcode";

            }



            let postcode =
            data.result[0].postcode
            .replace(/\s/g,"")
            .toUpperCase();



            findSiteByPostcode(postcode);



        }


        catch{


            result.innerHTML = `

            ❌ Could not find postcode

            <br><br>

            Please use manual search

            `;

            showManualSearch();

        }



    },



    function(error){



        result.innerHTML = `

        ❌ Location permission denied

        <br><br>

        Please allow location or use manual search

        `;


        showManualSearch();



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


    postcode =
    postcode
    .replace(/\s/g,"")
    .toUpperCase();



    let response =
    await fetch("sites.json");



    let sites =
    await response.json();



    let matches =
    sites.filter(site=>{


        return getPostcode(site.address)
        === postcode;


    });




    if(matches.length === 0){


        result.innerHTML =
        `❌ No RAMS found for ${postcode}`;


        return;

    }





    // ONE RAMS

    if(matches.length === 1){


        result.innerHTML = `

        ✅ RAMS found

        <br>

        Opening PDF...

        `;


        setTimeout(()=>{


            openPDF(matches[0].pdf);


        },500);



        return;


    }






    // MULTIPLE RAMS


    let html = `

    <h3>Select RAMS</h3>

    <p>
    ${matches.length} jobs found for ${postcode}
    </p>

    `;



    matches.forEach(site=>{


        html += `

        <button

        onclick="openPDF('${site.pdf}')"

        style="
        display:block;
        width:100%;
        margin:10px 0;
        padding:12px;
        font-size:16px;
        ">

        ${site.address}

        </button>

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



// ===============================
// START PAGE
// ===============================

window.onload = function(){

    showStartMenu();

};
