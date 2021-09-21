function editRow(button) {
    button.style.display='none';
    button.parentNode.lastChild.style.display ='block';
    //DOESNT WORK FOR DYNAMICALLY CREATED ONES 
    //DYNAMIC ROWS
    //button.parentNode.nextSibling.firstChild.style.display='none';
    //button.parentNode.nextSibling.lastChild.style.display='block';
    //HARD CODED ROWS
    button.parentNode.nextSiblingfirstChild.style.display='none';
    button.parentNode.nextSiblinglastChild.style.display='block';
}

function removeRow(button) {
    var table = document.getElementsByClassName('body')[0];
    var row = button.parentNode.parentNode.rowIndex-1;
    console.log(row);
    table.deleteRow(row);
}

function addNewRow() {
    //get values from input
    building = document.getElementById('Building').value;
    apt = document.getElementById('APT').value;
    tenant = document.getElementById('TENANT').value;


    //create new element and select table body
    var table = document.getElementsByClassName('body')[0];
    var row = document.createElement('tr');
    
    //add child elements for new rows
    for(var i=0;i<5;i++) {
        row.append(document.createElement('th'));
    }

    //addd button child elements for the last positions in the row
    for(var j=0;j<2;j++) {
        row.childNodes[3].append(document.createElement('button'));
        row.childNodes[4].append(document.createElement('button'));
    }

    //set the button attributes
    row.childNodes[3].childNodes[0].classList = "btn btn-e";
    row.childNodes[3].childNodes[0].setAttribute('onclick','editRow(this)');

    row.childNodes[3].childNodes[1].classList = "btn btn-s";
    row.childNodes[3].childNodes[1].setAttribute('onclick','saveRow(this)');

    row.childNodes[4].childNodes[0].classList = "btn btn-r";
    row.childNodes[4].childNodes[0].setAttribute('onclick','removeRow(this)');

    row.childNodes[4].childNodes[1].classList = "btn btn-c";
    row.childNodes[4].childNodes[1].setAttribute('onclick','cancelRow(this)');

    //set the attributes of the first 3 children
    for(var k=0;i<3;i++) {
        row.childNodes[k].contentEditable = "true";
        row.childNodes[k].spellcheck = "false";
    }

    //set the text content for the first 3 children to the input provided
    row.childNodes[0].textContent = building;
    row.childNodes[1].textContent = apt;
    row.childNodes[2].textContent = tenant;

    row.childNodes[3].childNodes[0].textContent = "EDIT";
    row.childNodes[3].childNodes[1].textContent = "SAVE";

    row.childNodes[4].childNodes[0].textContent = "REMOVE";
    row.childNodes[4].childNodes[1].textContent = "CANCEL";

    //appends compelete row to table body
    table.insertBefore(row,table.children[table.childElementCount-1]);
}

function saveRow(button) {
    button.style.display='none';
    button.parentNode.firstChild.style.display ='block';
    button.parentNode.nextSibling.firstChild.style.display='block';
    button.parentNode.nextSibling.lastChild.style.display='none';
}

function cancelRow(button) {
    button.style.display='none';
    button.parentNode.firstChild.style.display ='block';
    button.parentNode.previousSibling.firstChild.style.display='block';
    button.parentNode.previousSibling.lastChild.style.display='none';
}

