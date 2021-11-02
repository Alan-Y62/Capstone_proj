function postDelete(path,params,method='post'){
    const form = document.createElement('form');
    console.log(path)
    form.method = method;
    form.action = path;
    console.log(params)
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