const lo = document.getElementById('location').value

function postDelete(path,params,method='post'){
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

 function pendAccept(params,method="post"){
    const chooseApt = document.getElementById(String(params.ident)).value
    const form = document.createElement('form');
    form.method = method;
    form.action = `/admin/${lo}/manage/useraccept`;
    params.chooseApt = chooseApt
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

 function pendDeny(params,method="post"){
    const chooseApt = document.getElementById(String(params.ident)).value
    const form = document.createElement('form');
    form.method = method;
    form.action =  `/admin/${lo}/manage/userdeny`;
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