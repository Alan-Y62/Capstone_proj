
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

// function randomName() {
//     const first = ['Bob','Juan','Teresa','Norma',
//                     'Elbert','Eric','Anthony','Elissa',
//                     'Robert','Chad','Claire','Richard']
//     const last = ['Santos','Mayfield','Johnson','Baker',
//                 'Archibald','Smith','Skinner','Pearson'
//                 ,'Butler','Pope','Myers']
//     let f = Math.floor((Math.random() * first.length));
//     let l = Math.floor((Math.random() * last.length));
//     let fullName = first[f] + " " + last[l]
//     return fullName
// }

// function randomIssue() {
//     const issue = ['Water','Heat','Door','Paint','Bathroom','Gas'
//                 ,'Lights','Electricity']
//     return issue[Math.floor((Math.random() * issue.length))]
// }

// function randomStatus() {
//     const status = ['pending','completed']
//     return status[Math.round((Math.random()))]
// }

// function randomChance() {
//     return Math.round((Math.random))
// }

// function generateRepairs(stuff) {
//     const exists = 'N'
//     if(randomChance() === 1) {
//         exists = 'exists'
//     }
//     const a = new Repair({
//         landlord: 'admin',
//         building: stuff,
//         apt: Math.floor((Math.random() * 10) + 1),
//         tenant: randomName(),
//         issue: randomIssue(),
//         image: exists,
//         comments: "Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in vel illum qui dolorem eum fugiat quo voluptas nulla pariatur. ",
//         status: randomStatus()
//     })
//     a.save()
// }