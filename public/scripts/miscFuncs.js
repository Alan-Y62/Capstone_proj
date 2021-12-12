
function addTwoWeeks(date) {
    let d = new Date(date).getTime()
    let adds = 60*60 * 1000 * 24 * 1
    let newDate = new Date(d + adds)
    return newDate
}

//new code
const randomStr = (length = 32) => {
    // Declare all characters
    let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    // Pick characers randomly
    let str = '';
    for (let i = 0; i < length; i++) {
        str += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return str;

};
//

module.exports = { addTwoWeeks, randomStr }
