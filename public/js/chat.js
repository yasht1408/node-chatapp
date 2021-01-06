const socket = io()

//Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationmessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//Options
const { username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true })

const autoscroll = ()=> {
    //New message element 
    const $newMessage = $messages.lastElementChild

    //Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin
    
    //Visible height 
    const visibleHeight = $messages.offsetHeight

    //Height of the messages container
    const containerHeight = $messages.scrollHeight

    //How far I have scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('message',(message)=>{
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})
socket.on('locationMessage',(message) =>{
    console.log(message)
    const location = Mustache.render(locationmessageTemplate,{
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('h: mm a')
    })
    $messages.insertAdjacentHTML('beforeend',location)
    autoscroll()
})
$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()
    //disable the send button 
    $messageFormButton.setAttribute('disabled','disabled')

    const message = e.target.elements.message.value
    socket.emit('sendMesage',message,(error)=>{
        if(error){
            return console.log(error)
        }

        console.log('Yes client your message is delivered')
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
    })

})

$sendLocationButton.addEventListener('click',()=>{
    if(!navigator.geolocation){
        return alert('Please upgrade the version of your browser')
    }
    $sendLocationButton.setAttribute('disabled','disabled')
    navigator.geolocation.getCurrentPosition(position=>{
        //console.log(position)
        socket.emit('sendLocation',{
            latitide: position.coords.latitude,
            longitude: position.coords.longitude
        }, ()=>{
            console.log('Location Shared!!')
            $sendLocationButton.removeAttribute('disabled')
        })
    })
})
socket.on('roomData',({room , users})=>{
    const html = Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
    // console.log(room)
    // console.log(users)
})
socket.emit('join',{ username, room }, (error)=>{
    if(error){
        alert(error)
        location.href = '/'
    }
})

// socket.on('countupdated',(count)=>{
//     console.log('The count has been updated!:  ', count)
// })

// document.querySelector('#increment').addEventListener('click',()=>{
//     console.log('Clicked')
//     socket.emit('increment')
// })