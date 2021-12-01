const scktio = (io) => {
    io.on('connection', socket => {
        console.log('connected', io.engine.clientsCount);
      
        socket.on('joining', ({the_id}) =>{
            console.log(the_id)
            socket.join(the_id);
            socket.emit('check', 'checks')
        })
      });
}

module.exports = scktio;