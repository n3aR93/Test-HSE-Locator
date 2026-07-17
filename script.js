// ===============================
// HSE SITE FINDER
// ===============================


const searchBox = document.getElementById("searchBox");


// START AUTOMATIC LOCATION WHEN PAGE OPENS

window.onload = function(){

    autoLocation();

};



// ===============================
// AUTO LOCATION
// ===============================


function autoLocation(){

let result = document.getElementById("result");


result.innerHTML = `
📍 Checking your location...
<br>
Please wait...
`;



let timer = setTimeout(()=>{


result.innerHTML = `

❌ Location unavailable

<br><br>

Please type postcode manually

<br><br>

<button onclick="getLocation()">
Try location again
</button>

`;


},8000);




navigator.geolocation.getCurrentPosition(

async function(position){


clearTimeout(timer);


let lat = position.coords.latitude;
let lon = position.coords.longitude;



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



findSiteByPostcode(postcode);



}

catch{


result.innerHTML =
`
❌ Could not find postcode

<br><br>

Type postcode manually

`;

}


},


function(error){


clearTimeout(timer);


result.innerHTML =

`

❌ Location disabled or unavailable

<br><br>

Please type postcode manually

<br><br>

<button onclick="getLocation()">
Try location again
</button>

`;


},


{
enableHighAccuracy:true,
timeout:7000,
maximumAge:0
}



);



}





// ===============================
// MANUAL SEARCH
// ===============================


searchBox.addEventListener(
"keypress",
function(e){

if(e.key==="Enter"){

manualSearch();

}

});





function manualSearch(){


let input =
searchBox.value.trim();



if(input===""){

document.getElementById("result").innerHTML =
"Enter postcode";

return;

}



findSiteByPostcode(input);


}







// ===============================
// FIND RAMS
// ===============================


async function findSiteByPostcode(postcode){



let result =
document.getElementById("result");



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


return site.postcode
.replace(/\s/g,"")
.toUpperCase()
===postcode;


});






if(matches.length===0){


result.innerHTML =

`

❌ No RAMS found

<br><br>

Postcode:
${postcode}

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

${site.site}

</button>

<br>

`;

});


result.innerHTML = html;



}







// ===============================
// TRY LOCATION BUTTON
// ===============================


function getLocation(){

autoLocation();

}






// ===============================
// OPEN PDF
// ===============================


function openPDF(link){


window.open(link,"_blank");


}
