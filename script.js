// ===============================
// HSE SITE FINDER
// ===============================


const searchBox = document.getElementById("searchBox");



// START LOCATION WHEN PAGE OPENS

window.onload = function(){

    autoLocation();

};




// ===============================
// EXTRACT POSTCODE FROM ADDRESS
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
// LIVE SUGGESTIONS
// ===============================


searchBox.addEventListener(
"input",
function(){


let value =
this.value.trim();



if(value.length < 3){


document.getElementById("suggestions").innerHTML="";


return;


}



searchSuggestions(value);



});







async function searchSuggestions(text){


let response =
await fetch("sites.json");



let sites =
await response.json();



text =
text.toUpperCase();



let matches =
sites.filter(site=>{


let postcode =
getPostcode(site.address);



return (

site.address
.toUpperCase()
.includes(text)


||

postcode
.includes(
text.replace(/\s/g,"")
)

);


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



div.className="suggestion";



div.innerHTML =

`

<b>${site.address}</b>

<br>

`;



div.onclick=function(){


openPDF(site.pdf);


};



box.appendChild(div);



});



}







// ===============================
// ENTER SEARCH
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
"Please enter postcode or address";


return;


}



findSite(input);


}








// ===============================
// LOCATION
// ===============================


function autoLocation(){


let result =
document.getElementById("result");



result.innerHTML =
`

📍 Checking location...

<br>

Please wait...

`;



let timer =
setTimeout(()=>{


result.innerHTML =

`

❌ Location unavailable

<br><br>

Please enter postcode manually

<br><br>

<button onclick="getLocation()">
Try location again
</button>

`;



},8000);





navigator.geolocation.getCurrentPosition(

async function(position){


clearTimeout(timer);



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



catch{


result.innerHTML =
"❌ Could not find postcode";


}



},



function(){


clearTimeout(timer);



result.innerHTML =

`

❌ Location disabled

<br><br>

Please search manually

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







function getLocation(){


autoLocation();


}








// ===============================
// FIND SITE
// ===============================


async function findSite(input){



let result =
document.getElementById("result");



let search =
input
.replace(/\s/g,"")
.toUpperCase();





let response =
await fetch("sites.json");



let sites =
await response.json();






let matches =
sites.filter(site=>{


let postcode =
getPostcode(site.address);



return postcode === search;



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


openPDF(matches[0].pdf);


},800);



return;


}








let html =

`

Multiple sites found:

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
