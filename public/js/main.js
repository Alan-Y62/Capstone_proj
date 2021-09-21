function descSub() {
    const inputDesc = document.querySelector('#desc').value;
    addToMain(inputDesc)
}

function addToMain(upNew) {
    const x = document.createElement('p');
    x.setAttribute('id','post');
    const y = document.createElement('p');
    y.setAttribute('id','time_info');
    const time = new Date();
    const m = document.querySelector('.new-bar');
    const o = document.querySelector('.old-bar');
    m.appendChild(x);
    m.appendChild(y);
    x.textContent = upNew;
    y.textContent = time.getFullYear() + 
        " - " + time.getDate() + " - " + 
        time.toLocaleString('default',{month: 'short'}) 
        + " : " + time.getHours() + ":" + time.getMinutes() 
        + ":" + time.getSeconds();
    m.insertBefore(x, m.childNodes[0]);
    m.insertBefore(y, m.childNodes[0]);
    // if(upNew.value.length != 0) {
    //     if(m.hasChildNodes()) {
    //         o.insertBefore(m.childNodes[1], o.childNodes[0]);
    //         o.insertBefore(m.childNodes[0], o.childNodes[0]);
    //     }
    //         m.childNodes[0].textContent = time;
    //         m.childNodes[1].textContent = upNew;
    // }
}