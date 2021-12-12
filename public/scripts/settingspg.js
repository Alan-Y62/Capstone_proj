function changeBG1(){
    const images = ['url("../public/images/1186048.jpg")','url("../public/images/hi_res_landscape.jpg")','url("../public/images/unknown.png")']
    const bg = images[0];
    document.querySelector("body").style.backgroundImage = bg;
}
function changeBG2(){
    const images = ['url("../public/images/1186048.jpg")','url("../public/images/hi_res_landscape.jpg")','url("../public/images/unknown.png")']
    const bg = images[1];
    document.querySelector("body").style.backgroundImage = bg;
}
function changeBG3(){
    const images = ['url("../public/images/1186048.jpg")','url("../public/images/hi_res_landscape.jpg")','url("../public/images/unknown.png")']
    const bg = images[2];
    document.querySelector("body").style.backgroundImage = bg;
}

// Shows the selected tab and its contents
function showSection(evt, cityName) {
    var i, tabcontent, tablinks;

    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
    }

    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    document.getElementById(cityName).style.display = "block";
    evt.currentTarget.className += " active";
}
// Get the element with id="defaultOpen" and click on it
document.getElementById("defaultOpen").click();