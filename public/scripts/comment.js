const socket = io();
const commentBox = document.querySelector('.comment_container')
const the_id = document.getElementById('ident').innerText
const chatForm = document.getElementById('chat-form');
const text  = document.getElementById('textarea')

socket.emit('joining', { the_id })

socket.on('check', (check) => {
    console.log(check)
    console.log(the_id)
})

socket.on('comment', (obj) => {
    post(obj.comment, obj.id, obj.to, obj.from, obj.buildID)
    console.log('hellt')
})


function post(comment, ID, to, from, buildID) {
    let the_comment = document.createElement('div')
    the_comment.classList.add('card', 'border-light', 'mb-3', 'comment')
    const date = new Date().toLocaleDateString();
    console.log(date)
    let comment_sec = `
        <div class="card-body">
            <p><strong> ${from} </strong></p>
            <p>${comment}</p>
            <div>
                <small>${date}</small>
            </div>
        </div>
    `
    the_comment.innerHTML = comment_sec
    commentBox.prepend(the_comment)
    checkVisible(document.querySelector('.comment'), ID, to, buildID)
}

const checkVisible = (element, ID, to, buildID) => {
    console.log('heuy')
    const rect = element.getBoundingClientRect();
    console.log(rect.bottom)
    console.log(window.innerHeight)
    if (rect.top < 0) {
        isRead(ID,to,buildID,"false");
        let button = document.createElement("Button");
        button.innerHTML = "Unread Comments"
        button.style = "top:0; right:0; position:fixed; z-index: 9999"
        document.body.appendChild(button);
        button.onclick = () => {
            isRead(ID,to,buildID,"true");
            document.body.scrollTop = document.documentElement.scrollTop = 0;
            button.parentNode.removeChild(button);
        }
    }
}

const isRead = (ID,to, buildID, read) => {
    const xhr = new XMLHttpRequest();
    const tf = {tf: read, id:ID};
    console.log(tf)
    if(to == 'landlord'){
        xhr.open("POST", `/admin/${buildID}/requests/${the_id}/read`, true);
    }
    else{
        xhr.open("POST", `/user/${buildID}/history/${the_id}/read`, true);
    }
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify(tf));
}

const tosubmit = (event, buildID, reqID, type) => {
    event.preventDefault();
    const xhr = new XMLHttpRequest();
    const formdata = new FormData(chatForm);
    const what = {}
    for (let [key, value] of formdata.entries()) { 
        what[key] = value
      }
    if(type === 'admin'){
        xhr.open("POST", `/${type}/${buildID}/requests/${reqID}`, true);
    }
    else{
        xhr.open("POST", `/${type}/${buildID}/history/${reqID}`, true);
    }
   
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify(what));
    text.value = "";
}