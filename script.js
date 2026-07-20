// ===============================
// HSE SITE FINDER
// ===============================

// LOAD ELEMENTS

const searchBox = document.getElementById("searchBox");
const result = document.getElementById("result");

// ===============================
// GET POSTCODE FROM ADDRESS
// ===============================

function getPostcode(address) {

    let match = address.match(
        /[A-Z]{1,2}[0-9][0-9A-Z]?\s?[0-9][A-Z]{2}/i
    );

    if (match) {

        return match[0]
            .replace(/\s/g, "")
            .toUpperCase();

    }

    return "";

}

// ===============================
// ENTER KEY
// ===============================

searchBox.addEventListener("keypress", function (e) {

    if (e.key === "Enter") {

        manualSearch();

    }

});

// ===============================
// SEARCH BUTTON
// ===============================

async function manualSearch() {

    let input = searchBox.value.trim();

    if (input === "") {

        result.innerHTML = "Please enter a postcode.";

        return;

    }

    let postcode = getPostcode(input);

    if (!postcode) {

        result.innerHTML = "Please enter a valid full postcode.";

        return;

    }

    findSiteByPostcode(postcode);

}

// ===============================
// AUTO LOCATION ON START
// ===============================

function getLocation() {

    result.innerHTML = `
    📍 Checking your location...
    <br>
    Please allow location access
    `;

    if (!navigator.geolocation) {

        result.innerHTML = `
        ❌ Location is not supported on this device

        <br><br>

        <button onclick="location.reload()">
        Try location again
        </button>
        `;

        return;

    }

    navigator.geolocation.getCurrentPosition(

        async function (position) {

            let lat = position.coords.latitude;
            let lon = position.coords.longitude;

            result.innerHTML = `
            📍 Location found
            <br>
            Converting to postcode...
            `;

            try {

                let response = await fetch(
                    `https://api.postcodes.io/postcodes?lat=${lat}&lon=${lon}`
                );

                let data = await response.json();

                if (!data.result || data.result.length === 0) {

                    throw "No postcode";

                }

                let postcode = data.result[0].postcode
                    .replace(/\s/g, "")
                    .toUpperCase();

                findSiteByPostcode(postcode);

            }

            catch {

                result.innerHTML = `
                ❌ Could not convert your location to postcode

                <br><br>

                <button onclick="location.reload()">
                Try location again
                </button>

                <br><br>

                Search postcode manually
                `;

            }

        },

        function (error) {

            let message;

            if (error.code === 1) {

                message = `
                ❌ Location permission denied

                <br><br>

                Enable location access and press Try Again
                `;

            }

            else if (error.code === 2) {

                message = `
                ❌ Location is switched off or unavailable
                `;

            }

            else if (error.code === 3) {

                message = `
                ❌ Location timed out
                `;

            }

            else {

                message = `
                ❌ Unable to get location
                `;

            }

            result.innerHTML = `
            ${message}

            <br><br>

            <button onclick="location.reload()">
            Try location again
            </button>

            <br><br>

            Search postcode manually
            `;

        },

        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }

    );

}

// ===============================
// FIND RAMS
// ===============================

async function findSiteByPostcode(postcode) {

    postcode = postcode.replace(/\s/g, "").toUpperCase().trim();

    let response = await fetch("sites.json");
    let sites = await response.json();

    let matches = sites.filter(site => {

        let sitePostcode = getPostcode(site.address)
            .replace(/\s/g, "")
            .toUpperCase()
            .trim();

        return sitePostcode === postcode;

    });

    if (matches.length === 0) {

        result.innerHTML = `
        ❌ No RAMS found for ${postcode}
        `;

        return;

    }

    // One RAMS
    if (matches.length === 1) {

        result.innerHTML = `
        ✅ RAMS found
        <br>
        Opening PDF...
        `;

        setTimeout(() => {
            openPDF(matches[0].pdf);
        }, 500);

        return;

    }

    // Multiple RAMS
    let html = `
    <h3>Select a RAMS</h3>
    <p>${matches.length} jobs were found for postcode <b>${postcode}</b>.</p>
    `;

    matches.forEach(site => {

        html += `
        <button
            style="display:block;width:100%;margin:10px 0;padding:12px;font-size:16px;cursor:pointer;"
            onclick="openPDF('${site.pdf}')">
            ${site.address}
        </button>
        `;

    });

    result.innerHTML = html;

}

// ===============================
// OPEN PDF
// ===============================

function openPDF(link) {

    window.open(link, "_blank");

}
