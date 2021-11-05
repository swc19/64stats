export function getTourneySlugFromURL(url) {
    // Extract something like "ceo-2016" from https://smash.gg/tournament/ceo-2016/
    // This is over-engineered but it /should/ be foolproof
    let slugIndex = 4;
    if(!url.includes("http")){
        //ex: smash.gg/tournament/ceo-2016
        slugIndex = 2;
        if(url.split("/")[1] !== "tournament"){
            //ex: smash.gg/ceo-2016
            slugIndex = 1;
        }
    }
    else if(url.split("/")[2] !== "tournament"){
        //ex: https://smash.gg/ceo-2016
        slugIndex = 3;
    }
    return url.split("/")[slugIndex];
}
