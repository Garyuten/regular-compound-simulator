// urlHandler.js

function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Example usage
console.log(getUrlParameter('exampleParam'));