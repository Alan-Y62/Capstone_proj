function postJoin(path,params,method='post'){
    const form = document.createElement('form');
    form.method = method;
    form.action = path;
    for(const keys in params){
        if(params.hasOwnProperty(keys)){
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = keys;
            input.value = params[keys];
            form.appendChild(input);
        }
    }
    document.body.appendChild(form);
    form.submit();
}

function search(){
    let searchVal = document.getElementById('search');
    let filter = searchVal.value.toUpperCase();
    let table = document.getElementById('thetable');
    let searchBy = document.getElementById('searchBy').value;
    let tr = table.getElementsByTagName('tr');
    for(let i = 0;  i < tr.length; i++){
        let td = tr[i].getElementsByTagName('td')[searchBy];
        if(td){
            let tdVal  = td.textContent;
            if(tdVal.toUpperCase().indexOf(filter) > -1){
                tr[i].style.display = '';
            }
            else{
                tr[i].style.display = 'none';
            }
        }
    }
}

function refresh(){
    document.getElementById('search').value = '';
}