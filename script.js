// ================================
// HSE SITE FINDER
// Complete script
// ================================


// Search box typing
document
.getElementById("searchBox")
.addEventListener("input", function(){

    let value = this.value.trim();

    if(value.length < 3){

        document.getElementById("suggestions").innerHTML = "";

        return;

    }


    searchSites(value);

});




// ================================
// Manual search
// ================================

async function searchSites(search){

    let response =
    await fetch("sites.json");


    let sites =
    await response.json();



    search =
    search.replace(/\s/g,"")
    .toUpperCase();



    let matches =
    sites.filter(site=>{


        let postcode =
        site.postcode
        .replace(/\s/g,"")
        .toUpperCase();


        let name =
        site.site
        .toUpperCase();



        return postcode.includes(search)
        ||
        name.includes(search);


    });



    showSuggestions(matches);

}





// ================================
// Show suggestions
// ================================

function showSuggestions(matches){


    let box =
    document.getElementById("suggestions");


    box.innerHTML = "";



    matches.forEach(site=>{


        let div =
        document.createElement("div");


        div.className =
        "suggestion";


        div.innerHTML =
        `
        <strong>${site.site}</strong>
        <br>
        ${site.postcode}
        `;


        div.onclick=function(){

            openPDF(site.pdf);

        };


        box.appendChild(div);


    });


}






// ================================
// GPS LOCATION
// ================================

function getLocation(){


    let result =
    document.getElementById("result");



    result.innerHTML =
    `
    📍 Finding your location...
    <br><br>
    Please wait...
    `;



    if(!navigator.geolocation){


        result.innerHTML =
        "❌ Location is not supported";


        return;

    }



    navigator.geolocation.getCurrentPosition(

        async function(position){


            let lat =
            position.coords.latitude;


            let lon =
            position.coords.longitude;



            try{


                result.innerHTML =
                `
                📍 Location found
                <br>
                Checking postcode...
                `;



                // Convert GPS to postcode

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
                data.result[0].postcode;



                result.innerHTML =
                `
                ✅ Found postcode:
                <br>
                ${postcode}
                <br><br>
                Searching HSE documents...
                `;



                findSiteByPostcode(postcode);



            }


            catch(error){


                result.innerHTML =
                `
                ❌ Could not find postcode.
                <br>
                Please type it manually.
                `;


            }



        },


        function(){


            result.innerHTML =
            `
            ❌ Location permission denied.
            <br>
            Please type postcode.
            `;


        }


    );


}






// ================================
// Find PDF by postcode
// ================================

async function findSiteByPostcode(postcode){



    let result =
    document.getElementById("result");



    let response =
    await fetch("sites.json");


    let sites =
    await response.json();




    let cleanPostcode =
    postcode
    .replace(/\s/g,"")
    .toUpperCase();



    let matches =
    sites.filter(site=>{


        let sitePostcode =
        site.postcode
        .replace(/\s/g,"")
        .toUpperCase();



        return sitePostcode === cleanPostcode;


    });






    if(matches.length===0){


        result.innerHTML =
        `
        ❌ No HSE site found
        <br><br>
        ${postcode}
        `;


        return;

    }





    if(matches.length===1){


        result.innerHTML =
        `
        ✅ Site found
        <br><br>
        Opening document...
        `;



        setTimeout(()=>{


            openPDF(matches[0].pdf);


        },1000);



        return;

    }






    // Multiple sites

    let html =
    `
    Multiple sites found:
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







// ================================
// Open PDF
// ================================

function openPDF(link){


    window.open(link,"_blank");


}
