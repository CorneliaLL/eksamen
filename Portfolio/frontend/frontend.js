//1. make a async function
//2. await a fetch to an endpoint(URL)
//3. await the data from the previous reponse

//not API!!! runs in the browser 
//even though we are using the api it is not the api itselef 

const userDiv = document.getElementById("users")
const userDiv1 = document.getElementById("user")



async function getData() {
    const response = await fetch("http://localhost:3001/data")

    const data = await response.text()
}

getData()

async function getUsers() {
    const reponse = await fetch("http://localhost:3001/users")

    // [{ id: 1, name: "cornelia", }]
    const data = await reponse.json()

    //[]
    data.forEach(item => {
// item = { id: 1, name: "cornelia", }
        userDiv.innerHTML = item.name
    })
}

async function getUser(){
    const response = await fetch ("http://localhost:3001/users/1")

    //{ id: 1, name: "cornelia", }
    const data = await response.json()
    
    userDiv1.innerHTML = data.name
}

getUsers()
getUser()

