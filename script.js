// ===============================
// HSE SITE FINDER
// ===============================


// LOAD ELEMENTS

const searchBox = document.getElementById("searchBox");
const suggestionsBox = document.getElementById("suggestions");
const result = document.getElementById("result");




// ===============================
// GET POSTCODE FROM ADDRESS
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
// LIVE SEARCH
// ===============================

searchBox.addEventListener(
"input",
function(){

    let value = this.value.trim();


    if(value.length < 2){

        suggestionsBox.innerHTML="";
        return;

    }


    searchSites(value);


});





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
// SEARCH JSON
// ===============================


async function searchSites(text){


    let response =
    await fetch("sites.json");


    let sites =
    await response.json();



    text =
    text.toUpperCase()
    .replace(/\s/g,"");



    let matches =
    sites.filter(site=>{


        let postcode =
        getPostcode(site.address);



        return (

            site.address
            .toUpperCase()
            .replace(/\s/g,"")
            .includes(text)


            ||

            postcode.includes(text)

        );


    });



    showSuggestions(matches);



}






// ===============================
// SHOW RESULTS
// ===============================


function showSuggestions(matches){


    suggestionsBox.innerHTML="";



    matches.forEach(site=>{


        let div =
        document.createElement("div");


        div.className="suggestion";



        div.innerHTML =
        `
        <b>${site.address}</b>
        `;



        div.onclick=function(){


            openPDF(site.pdf);


        };



        suggestionsBox.appendChild(div);



    });



}







// ===============================
// SEARCH BUTTON
// ===============================


async function manualSearch(){



    let input =
    searchBox.value.trim();



    if(input===""){


        result.innerHTML =
        "Please enter address or postcode";


        return;


    }



    let postcode =
    getPostcode(input);



    if(postcode){


        findSiteByPostcode(postcode);


    }

    else{


        searchSites(input);


    }



}







// ===============================
// AUTO LOCATION ON START
// ===============================

function getLocation(){


let result =
document.getElementById("result");



result.innerHTML = `
📍 Checking your location...
<br>
Please allow location access
`;



if(!navigator.geolocation){


result.innerHTML = `
❌ Location is not supported on this device

<br><br>

<button onclick="getLocation()">
Try location again
</button>
`;

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
Converting to postcode...
`;





try{


let response =
await fetch(
`https://api.postcodes.io/postcodes?lat=${lat}&lon=${lon}`
);



let data =
await response.json();



if(!data.result || data.result.length===0){

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
❌ Could not convert your location to postcode

<br><br>

<button onclick="getLocation()">
Try location again
</button>

<br><br>

Search postcode manually
`;

}



},




function(error){



let message;



if(error.code===1){


message =
`
❌ Location permission denied

<br><br>
Enable location access and press try again
`;

}


else if(error.code===2){


message =
`
❌ Location is switched off or unavailable
`;

}


else if(error.code===3){


message =
`
❌ Location timed out
`;

}


else{


message =
`
❌ Unable to get location
`;

}



result.innerHTML =
`
${message}

<br><br>

<button onclick="getLocation()">
Try location again
</button>

<br><br>

Search postcode manually
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


return getPostcode(site.address) === postcode;


});






if(matches.length===0){



result.innerHTML =
`
❌ No RAMS found for ${postcode}
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


openPDF(matches[0].pdf);



},800);



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
<button onclick="openPDF('${site.pdf}')">
${site.address}
</button>
<br>
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
