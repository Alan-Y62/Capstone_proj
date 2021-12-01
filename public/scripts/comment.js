const socket = io();
const commentBox = document.querySelector('.comment_container')
const the_id = document.getElementById('ident').innerText
const chatForm = document.getElementById('chat-form');

socket.emit('joining', {the_id})

socket.on('check', (check) =>{
    console.log(check)
    console.log(the_id)
})

socket.on('comment', (obj) => {
    post(obj.comment ,obj.id)
})


function post(comment,ID) {
    let the_comment = document.createElement('div')
    the_comment.classList.add('card','border-light','mb-3', 'comment')

    let comment_sec = `
        <div class="card-body">
            <h6>Put Name here</h6>
            <p>${comment}</p>
            <div>
                <small>time</small>
            </div>
        </div>
    `
    the_comment.innerHTML = comment_sec
    commentBox.prepend(the_comment)
    checkVisible(document.querySelector('.comment'),ID)
}

const checkVisible = (element,ID) => {
    console.log('heuy')
    const rect = element.getBoundingClientRect();
    console.log(rect.bottom)
    console.log(window.innerHeight)
    if (rect.top < 0) {
        let button = document.createElement("Button");
        button.innerHTML = "Unread Comments"
        button.style = "top:0; right:0; position:fixed; z-index: 9999"
        document.body.appendChild(button);
        button.onclick = () => {
            document.body.scrollTop = document.documentElement.scrollTop = 0;
            button.parentNode.removeChild(button);
        }
    }
}