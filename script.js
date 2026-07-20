// ===============================
// HSE RAMS FINDER
// ===============================


// ELEMENTS

const searchBox = document.getElementById("searchBox");
const result = document.getElementById("result");
const manualBox = document.querySelector(".manual");



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
// START LOCATION SEARCH
// ===============================

window.onload = function(){

    getLocation();

};



// ===============================
// MANUAL SEARCH
// ===============================

function manualSearch(){


    let input =
    searchBox.value.trim();



    let postcode =
    getPostcode(input);



    if(!postcode){


        result.innerHTML = `
        ❌ Please enter a valid postcode
        `;


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

    `;



    if(!navigator.geolocation){


        showManualOption();

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


            showManualOption();


        }



    },



    function(){


        showManualOption();


    },



    {

        enableHighAccuracy:true,

        timeout:10000,

        maximumAge:0

    }


    );


}




// ===============================
// SHOW MANUAL OPTION
// ===============================

function showManualOption(){


    result.innerHTML = `

    ❌ Could not find your location

    <br><br>

    Please enter postcode manually

    `;


    manualBox.style.display = "block";


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





    if(matches.length===0){


        result.innerHTML =
        `
        ❌ No RAMS found for ${postcode}
        `;


        return;

    }





    // ONE RAMS

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







    // MULTIPLE RAMS

    let html =
    `

    <h3>Select RAMS</h3>

    `;



    matches.forEach(site=>{


        html +=

        `

        <button
        onclick="openPDF('${site.pdf}')"
        style="
        width:100%;
        padding:12px;
        margin:8px 0;
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
