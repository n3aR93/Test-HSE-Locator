// ======================================
// HSE SITE FINDER - script.js
// ======================================


// -----------------------------
// Manual search box autocomplete
// -----------------------------

const searchBox = document.getElementById("searchBox");
const suggestions = document.getElementById("suggestions");


if (searchBox) {

    searchBox.addEventListener("input", async function () {


        let text = searchBox.value
            .toUpperCase()
            .trim();


        suggestions.innerHTML = "";


        if (text.length < 2) {
            return;
        }


        let response = await fetch("sites.json");

        let sites = await response.json();



        let matches = sites.filter(site =>

            site.postcode
                .toUpperCase()
                .includes(text)

            ||

            site.site
                .toUpperCase()
                .includes(text)

            ||

            (site.address &&
            site.address
                .toUpperCase()
                .includes(text))

        );



        if (matches.length === 0) {

            suggestions.innerHTML =
                "No sites found";

            return;

        }



        matches.forEach(function(site){


            let option =
                document.createElement("div");


            option.className =
                "suggestion";


            option.innerHTML =

                "<b>" +
                site.site +
                "</b><br>" +

                site.postcode +

                "<br>" +

                (site.address || "");



            option.onclick = function(){


                openPDF(site);


            };



            suggestions.appendChild(option);


        });



    });

}



// -----------------------------
// Open PDF
// -----------------------------

function openPDF(site) {


    document.getElementById("result").innerHTML =

        "Opening:<br><b>" +
        site.site +
        "</b>";



    setTimeout(function(){


        window.location.href =
            site.pdf;


    },1000);


}



// -----------------------------
// GPS LOCATION BUTTON
// -----------------------------

function getLocation(){


    if (!navigator.geolocation) {


        alert(
            "Location is not supported on this device."
        );


        return;

    }



    navigator.geolocation.getCurrentPosition(

        function(position){


            let latitude =
                position.coords.latitude;


            let longitude =
                position.coords.longitude;



            document.getElementById("result").innerHTML =

                "Location found:<br>" +

                "Latitude: " +
                latitude +

                "<br>" +

                "Longitude: " +
                longitude +

                "<br><br>" +

                "Next step: converting location to postcode...";


            /*
            
            NEXT STEP:
            
            Latitude + Longitude
                    |
                    v
            Full postcode
                    |
                    v
            Search sites.json
                    |
                    v
            Open PDF
            
            */


        },


        function(){


            alert(
                "Could not get your location. Please search manually."
            );


        }


    );


}



// -----------------------------
// Search button (optional)
// -----------------------------

async function findPostcode(){


    let text =
        document.getElementById("searchBox")
        .value
        .toUpperCase()
        .trim();



    if(text === ""){

        alert(
            "Please enter postcode or site name"
        );

        return;

    }



    let response =
        await fetch("sites.json");


    let sites =
        await response.json();



    let matches =
        sites.filter(site =>

            site.postcode
            .toUpperCase()
            === text

        );



    if(matches.length === 1){


        openPDF(matches[0]);


    }


    else if(matches.length > 1){


        let result =
            document.getElementById("result");


        result.innerHTML =
            "<h3>Select site:</h3>";



        matches.forEach(site=>{


            let button =
                document.createElement("button");


            button.innerHTML =
                site.site;



            button.onclick=function(){


                openPDF(site);


            };



            result.appendChild(button);


        });


    }


    else {


        document.getElementById("result").innerHTML =

            "No matching site found";


    }


}