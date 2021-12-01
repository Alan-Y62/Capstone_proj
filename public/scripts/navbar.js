function openSide(){
    const mq = window.matchMedia( "(max-width: 600px)" );
    if (mq.matches) {
        document.getElementById('side-menu').style.width = '100%';
    }
    else {
        document.getElementById('side-menu').style.width = '300px';
    }
}

function closeSide(){
    document.getElementById('side-menu').style.width = '0px';
}