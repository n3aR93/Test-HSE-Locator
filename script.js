// ===============================
// HSE SITE FINDER
// ===============================


const searchBox = document.getElementById("searchBox");




// ===============================
// START LOCATION ON PAGE OPEN
// ===============================


window.onload = function(){

    autoLocation();

};





// ===============================
// LIVE SEARCH SUGGESTIONS
// ===============================


searchBox.addEventListener(
"input",
function(){

let value=this.value.trim();


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


return (

site.site
.toUpperCase()
.includes(text)


||

site.postcode
.toUpperCase()
.includes(text)


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
<b>${site.site}</b>
<br>
${site.postcode}
`;



div.onclick=function(){


openPDF(site.pdf);


};



box.appendChild(div);



});


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
// MANUAL SEARCH BUTTON
// ===============================


function manualSearch(){


let input =
searchBox.value.trim();



let result =
document.getElementById("result");



if(input===""){


result.innerHTML =
"Please enter postcode or address";


return;


}



findSiteByPostcode(input);


}








// ===============================
// AUTOMATIC LOCATION
// ===============================


function autoLocation(){


let result =
document.getElementById("result");



result.innerHTML =

`
📍 Checking your location...
<br>
Please wait...
`;




let timeout = setTimeout(()=>{


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


clearTimeout(timeout);



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

throw "no postcode";

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

Search manually

`;

}


},



function(){


clearTimeout(timeout);



result.innerHTML =

`

❌ Location disabled

<br><br>

Please enter postcode manually

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
// LOCATION BUTTON
// ===============================


function getLocation(){


autoLocation();


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


return (

site.postcode
.replace(/\s/g,"")
.toUpperCase()

===

postcode

);



});








if(matches.length===0){


result.innerHTML =

`

❌ No RAMS found

<br><br>

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
// OPEN PDF
// ===============================


function openPDF(link){


window.open(link,"_blank");


}
