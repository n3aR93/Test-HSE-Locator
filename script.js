let sites = [];


// LOAD DATABASE

async function loadSites(){

    let response = await fetch("sites.json");

    sites = await response.json();

    console.log("Sites loaded:", sites.length);

}


loadSites();



// START LOCATION AUTOMATICALLY

window.onload=function(){

    getLocation();

};





// LOCATION SEARCH


function getLocation(){


let result=document.getElementById("result");


result.innerHTML=
`
📍 Finding your location...
<br>
Please wait...
`;



if(!navigator.geolocation){


result.innerHTML=
`
❌ Location not supported

<br><br>

Please enter postcode manually
`;

return;

}




navigator.geolocation.getCurrentPosition(

async function(position){


let lat=position.coords.latitude;

let lon=position.coords.longitude;



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



result.innerHTML=
`
📍 Location found:
${postcode}

<br>
Searching RAMS...
`;



findSite(postcode);



}


catch{


result.innerHTML=
`
❌ Could not convert location to postcode

<br><br>

Enter postcode manually
`;

}



},



function(error){


let message="❌ Location error";


if(error.code===1){

message=
"❌ Location permission denied";

}

if(error.code===2){

message=
"❌ Location unavailable";

}

if(error.code===3){

message=
"❌ Location timed out";

}



result.innerHTML=
`
${message}

<br><br>

<button onclick="getLocation()">
Try Again
</button>

<br><br>

Enter postcode manually
`;

}



);



}








// FIND SITE BY POSTCODE


function findSite(postcode){


postcode =
postcode
.replace(/\s/g,"")
.toUpperCase();



let matches =
sites.filter(site=>{


return site.postcode
.replace(/\s/g,"")
.toUpperCase()
===postcode;



});





if(matches.length===1){


document.getElementById("result").innerHTML=
`
✅ RAMS Found

<br>

Opening document...
`;



setTimeout(()=>{


window.open(matches[0].pdf,"_blank");


},1000);



return;

}





if(matches.length>1){


let html=
"Multiple sites found:<br><br>";



matches.forEach(site=>{


html+=
`
<button onclick="openPDF('${site.pdf}')">

${site.site}

</button>
<br><br>
`;

});


document.getElementById("result").innerHTML=html;


return;


}




document.getElementById("result").innerHTML=
`
❌ No RAMS found for:

<br>

${postcode}

<br><br>

Please enter postcode manually
`;



}







// MANUAL SEARCH


function manualSearch(){


let text =
document.getElementById("searchBox").value
.trim()
.toUpperCase();



if(text==="") return;



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




if(matches.length===1){


openPDF(matches[0].pdf);


}

else if(matches.length>1){


let html="Choose site:<br><br>";


matches.forEach(site=>{


html+=
`
<button onclick="openPDF('${site.pdf}')">
${site.site}
</button>
<br>
`;

});


document.getElementById("suggestions").innerHTML=html;


}

else{


document.getElementById("suggestions").innerHTML=
"❌ No matching RAMS";


}



}







function openPDF(link){


window.open(link,"_blank");


}
