// ===============================
// HSE SITE FINDER
// ===============================


const searchBox =
document.getElementById("searchBox");



searchBox.addEventListener(
"input",
function(){

let value=this.value.trim();


if(value.length < 3){

document.getElementById("suggestions").innerHTML="";

return;

}


searchSites(value);


});



// ENTER KEY SEARCH

searchBox.addEventListener(
"keypress",
function(e){

if(e.key==="Enter"){

manualSearch();

}

});





// ===============================
// LIVE SUGGESTIONS
// ===============================


async function searchSites(text){


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


div.innerHTML=
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
// SEARCH BUTTON
// ===============================


async function manualSearch(){


let input =
searchBox.value.trim();



let result =
document.getElementById("result");



if(input===""){


result.innerHTML=
"Please enter postcode or address";


return;


}



// postcode format check

let postcodePattern =
/^[A-Z]{1,2}[0-9][0-9A-Z]?\s?[0-9][A-Z]{2}$/i;



if(postcodePattern.test(input)===false){


result.innerHTML=
`
❌ Invalid postcode format
<br><br>
Please check and try again
`;


return;


}



findSiteByPostcode(input);



}








// ===============================
// LOCATION BUTTON
// ===============================


function getLocation(){


let result =
document.getElementById("result");



result.innerHTML=
`
📍 Finding location...
<br>
Please wait...
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

throw "no postcode";

}



let postcode =
data.result[0].postcode;



findSiteByPostcode(postcode);



}

catch{


result.innerHTML=
`
❌ Could not find postcode
`;

}



},



function(){


result.innerHTML=
`
❌ Location permission denied
`;

}



);



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


result.innerHTML=
`
❌ No RAMS found for this address
<br><br>
${postcode}
`;


return;

}





if(matches.length===1){


result.innerHTML=
`
✅ RAMS found
<br>
Opening document...
`;



setTimeout(()=>{


openPDF(matches[0].pdf);


},1000);



return;


}





let html=
`
Multiple sites found:
<br><br>
`;



matches.forEach(site=>{


html+=
`
<button onclick="openPDF('${site.pdf}')">
${site.site}
</button>
`;

});


result.innerHTML=html;


}







function openPDF(link){


window.open(link,"_blank");


}
