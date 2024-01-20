/**
 * This file is loaded via the <script> tag in the index.html file and will
 * be executed in the renderer process for that window.
 */
getNotes = async () => {
    console.log('getNotes')
    const notes = await window.electron.getNotes()
    console.log(notes)
    document.querySelector('#servicesContainer').style.visibility = 'visible'
    if (!notes) {
        document.querySelector('#login').style.display = 'block'
        return
    }

    let notesHTML = "";
    for (const note of notes) {
        notesHTML += `
            <div data-id="${note.location}" id="cabinElements" class="list-group-item list-group-item-action py-3 lh-sm cabins">
            Cabin name: ${note.cabin}, Location: ${note.location}
           
                
            </div>
        `;
    }
    // Hörs till divven ovan, tog bort eftersom vi inte behöver del knappar
    //  <input class="btn-del" data-id="${note._id}" type="button" value="del"></input>

    document.querySelector('#owned').innerHTML = notesHTML;

}
getNotes()


getServices = async () => {
    const services = await window.electron.getServices()
    if (!services) {
        document.querySelector('#login').style.display = 'none'
        return
    }

    let servicesHTML = "";
    for (const service of services) {
        servicesHTML += `
            <div data-id="${service.id}" data-name="${service.services}" id="servicesElements" class="list-group-item list-group-item-action py-3 lh-sm servicesSelected">
            Service: ${service.services}
            
                
            </div>
        `;
    }
    document.querySelector('#services').innerHTML = servicesHTML;
{/* <input class="btn-del" data-id="${service._id}" type="button" value="del"></input> */}
}
getServices()

logout = async () => {

    await window.electron.logout()

}


getOrders = async () => {
    const orders = await window.electron.getOrders()
    if (!orders) {
        document.querySelector('#login').style.display = 'none'
        return
    }
    let ordersHTML = "";
    for (const order of orders) {
        ordersHTML += `
            <div data-id="${order.id}" data-location="${order.location}" data-serviceName="${order.services}" id="orderElements" class="list-group-item list-group-item-action py-3 lh-sm ordersSelected">
            Date: ${order.date} <br>
            Service: ${order.services} <br>
            Location: ${order.location} 
            </div>
            
        `;
    }
    document.querySelector('#orders').innerHTML = ordersHTML;

}
getOrders()


document.querySelector('#btn-login').addEventListener('click', async () => {
    document.querySelector('#msg').innerText = ''
    const login_failed = await window.electron.notesLogin({
        email: document.querySelector('#email').value,
        password: document.querySelector('#password').value
    })
    if (login_failed) {
        document.querySelector('#msg').innerText = login_failed.msg
        return 
    }

    document.querySelector('#login').style.display = 'none'
    document.querySelector('#loginContainer').style.display = 'none'
    document.querySelector('#servicesContainer').style.display = 'block'
    document.querySelector('#ordersContainer').style.display = 'block'
    
    getNotes()
})

let selectedCabin = null
let selectedService = null
let selectedServiceName = null
let selectedOrder = null

// SAVE FUNKTIONEN FÖR EN ORDER
document.querySelector('#btn-save').addEventListener('click', async () => {
    
    const cabinLocation = selectedCabin
    const service_id = selectedService
    const date = document.querySelector('#dateSelect').value
    const servName = selectedServiceName
    

    console.log("here is date: " + date)
    console.log("here is service_id: " + service_id)
    console.log("here is location: " + cabinLocation)
    const orderSaved = await window.electron.saveNote({
        date: date,
        service_id: service_id,
        location: cabinLocation, 
        service: servName
        
    })
    console.log(orderSaved)
    getOrders()

})

let updateLocation = null
let updateServiceName = null

// KNAPPEN FÖR ATT EDIT EN ORDER
document.querySelector('#btn-update').addEventListener('click', async () => {

    document.querySelector('#displayUpdate').style.display ='none'
    const date = document.querySelector('#dateUpdate').value
    console.log(selectedOrder)
    console.log(date)
    const orderSaved = await window.electron.editOrder({
        date: date,
        id: selectedOrder, 
        location: updateLocation,
        service: updateServiceName
      
    })
    console.log(orderSaved)
    getOrders()

})

// KNAPPEN FÖR ATT EDIT EN ORDER
document.querySelector('#btn-edit').addEventListener('click', async () => {
    document.querySelector('#displayUpdate').style.display ='block'

    getOrders()

})

document.querySelector('#btn-logout').addEventListener('click', async () => {
    logout()
    document.querySelector('#login').style.display = 'block'
    document.querySelector('#loginContainer').style.display = 'block'
    document.querySelector('#servicesContainer').style.display = 'none'
    document.querySelector('#ordersContainer').style.display = 'none'

    // getOrders()

})


document.querySelector('#btn-delete').addEventListener('click', async () => {
 
    const orderDeleted = await window.electron.delNote({
        id: selectedOrder
    })
    console.log(orderDeleted)
    getOrders()

})


document.querySelector('#owned').addEventListener('click', async (event) => {
    
    console.log("this is the selected target: ")
    console.log(event.target)
    const nodeList = document.querySelectorAll('#cabinElements')
    for (let i = 0; i < nodeList.length; i++) {
        nodeList[i].style.backgroundColor = "white"

      }
    event.target.style.background = "#f2e357"
    
    if (event.target.classList.contains('cabins')) {
        console.log(event.target.getAttribute('data-id'))
        selectedCabin = event.target.getAttribute('data-id')
        // await window.electron.delNote(event.target.getAttribute('data-id'))

    }
})

document.querySelector('#services').addEventListener('click', async (event) => {
    console.log("this is the selected service target: ")
    console.log(event.target)
    const nodeList = document.querySelectorAll('#servicesElements')
    for (let i = 0; i < nodeList.length; i++) {
        nodeList[i].style.backgroundColor = "white";
      }
    event.target.style.background = "#f2e357"
    
    if (event.target.classList.contains('servicesSelected')) {
        console.log(event.target.getAttribute('data-id'))
        selectedServiceName = event.target.getAttribute('data-name')
        selectedService = event.target.getAttribute('data-id')
        // await window.electron.delNote(event.target.getAttribute('data-id'))

    }
})


document.querySelector('#orders').addEventListener('click', async (event) => {
    console.log("this is the selected order target: ")
    console.log(event.target)
    const nodeList = document.querySelectorAll('#orderElements')
    for (let i = 0; i < nodeList.length; i++) {
        nodeList[i].style.backgroundColor = "white";
      }
    event.target.style.background = "#f2e357"
    
    if (event.target.classList.contains('ordersSelected')) {
        console.log(event.target.getAttribute('data-id'))
        selectedOrder = event.target.getAttribute('data-id')
        updateLocation = event.target.getAttribute('data-location')
        updateServiceName = event.target.getAttribute('data-serviceName')
        // await window.electron.delNote(event.target.getAttribute('data-id'))

    }
})