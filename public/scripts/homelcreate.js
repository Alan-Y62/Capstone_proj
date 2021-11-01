let tab_num = 0;
display(tab_num);

 function display(tab_num){
   let curr_tab = document.getElementsByClassName('tab');
   curr_tab[tab_num].style.display = 'block';
   if(tab_num === 0){
      document.getElementById('prevBtn').style.display = "none";
      document.getElementById("nextBtn").innerHTML = "Next";
   }
   if(tab_num === 1){
    document.getElementById('prevBtn').style.display = 'inline'
   }
   if(tab_num === 2){
      document.getElementById("nextBtn").innerHTML = "Next";
      document.getElementById("nextBtn").type = "button";
      numtype();
  }
    if(tab_num === 3){
      createApt()
      event.preventDefault()
      document.getElementById("nextBtn").innerHTML = "Submit";
      document.getElementById("nextBtn").type = "submit";
    }
}

function nextPrev(n){
   let x = document.getElementsByClassName('tab');
   console.log("current tab:" + tab_num);
   if(n === 1 && !validateForm()){
     return false;
   }
   if(n === -1 && tab_num === 3){
     cleanUp();
   }
   x[tab_num].style.display ="none";
   tab_num = tab_num + n;
   if (tab_num >=x.length){
     document.getElementById('theform').submit();
     return false;
   }
   display(tab_num);
 }

 function validateForm(){
  document.getElementById('invalid').style.display = "none"
   let valid = true;
   let x = document.getElementsByClassName('tab');
   let y = x[tab_num].getElementsByTagName("input");
   for (let i = 0; i < y.length; i++) {
    if (y[i].value === "" && !(y[i].parentNode.parentNode.style.display === 'none')) {
      document.getElementById('invalid').style.display = "inline"
      valid = false;
    }
    else if(y[i].type === 'radio'){
      if(!y[i].checked){
        document.getElementById('invalid').style.display = "inline"
        valid = false;
      }
      else{
        document.getElementById('invalid').style.display = "none"
        valid = true;
        return valid;
      }
      
    }
 }
 return valid;
}


function numtype(){
    let selected = getType();
    console.log("s"+selected)
    let parent = document.getElementById("pg3")
    if(selected === "onlyNum"){
      document.getElementById("num").style.display = "block"
      document.getElementById("numalpha").style.display = "none"
      document.getElementById("numnum").style.display = "none"
    }
    if(selected === "numLetter"){
      document.getElementById("num").style.display = "none"
      document.getElementById("numalpha").style.display = "block"
      document.getElementById("numnum").style.display = "none"
    }
    if(selected === "floorNum"){
      document.getElementById("num").style.display = "none"
      document.getElementById("numalpha").style.display = "none"
      document.getElementById("numnum").style.display = "block"
    }
    return selected;
}

function getType(){
  let choice = document.getElementsByName('numType')
    let selected;
    for(let i = 0; i < choice.length; i++){
      if(choice[i].checked){
        selected = choice[i].value
      }
    }
    return selected;
}

function createApt(){
    let type = getType();
    let parent = document.getElementById("pg4")
    console.log("stuff" + type)
    if(type === "onlyNum"){
      let choice = document.getElementById('nums')
      let number = choice.value;
      for(let i = 1; i <= number; i++){
        let input = document.createElement("input");
        input.type =  "text";
        input.id = "stuff"
        input.name= "some"
        input.value = i;
        parent.appendChild(input)
      }
    }
    if(type === "numLetter"){
      let numchoice = document.getElementById('numfora')
      let alphachoice = document.getElementById('alphabet')
      let num = alphachoice.value.charCodeAt(0) - 65;
      console.log(numchoice)
      console.log(num)
      for (let i = 1; i <= numchoice.value; i++){
        for (let j = 0; j <= num; j++){
          console.log('hi')
          const number = i;
          const aptnum = number.toString();
          const aptletter = String.fromCharCode(65 + j);
          const input = document.createElement("input");
          input.type =  "text";
          input.id = "stuff"
          input.name= "some"
          input.value = aptnum.concat(aptletter);
          parent.appendChild(input)
        }
      }
    }
    if(type === "floorNum"){
      let firstNum = document.getElementById('startnum').value
      let secondNum = document.getElementById('endnum').value
      for (let i = 1; i <= firstNum; i++){
        let num = i * 100;
        for (let j = 0; j <= secondNum; j++){
          const input = document.createElement("input");
          input.type =  "text";
          input.id = "stuff"
          input.name= "some"
          input.value = num + j
          parent.appendChild(input)
        }
      }
    }
}

function cleanUp(){
  let parent = document.getElementById("pg4")
  while(parent.firstChild){
    parent.removeChild(parent.lastChild);
  }
}

function numcheck(input){
  if (input.value <= 0){
    input.setCustomValidity('Must be a number greater than 0')
    input.reportValidity();
    event.preventDefault()
    input.value = '';
  }
  else{
    input.setCustomValidity('')
  }
}
