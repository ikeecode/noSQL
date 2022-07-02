const user              = JSON.parse(localStorage.getItem('user'))
const complete_url      = "http://127.0.0.1:5000/user/infos/"
const create_member_url = "http://127.0.0.1:5000/create/member"
const relations_url     = "http://127.0.0.1:5000/all/relations/"
const infouser          = document.querySelector('#infouser')
const infouserform      = document.querySelector('#infouserform')
const submitbtn         = document.querySelector('#submitbtn')
const name              = infouserform.querySelector('input#name')
const username          = infouserform.querySelector('input#username')
const age               = infouserform.querySelector('input#age')
const phone             = infouserform.querySelector('input#phone')
const address           = infouserform.querySelector('input#address')
const prenom            = infouserform.querySelector('input#prenom')
const profession        = infouserform.querySelector('input#profession')
const sexe              = infouserform.querySelector('select')
const addmember         = document.querySelector('#addmember')
const logout            = document.querySelector('#logout')
const admform           = document.querySelector('#admform')
const admprenom         = admform.querySelector('#prenom')
const admnom            = admform.querySelector('#nom')
const parente           = admform.querySelector('#parente')
const darkmode          = document.querySelector('i')
const genealogy         = document.querySelector('#genealogy')
const parents           = genealogy.querySelector('#parents')
const children          = genealogy.querySelector('#children')
const siblings          = genealogy.querySelector('#siblings')
const chatbtn           = document.querySelector('#chatbtn')
const member_display    = document.querySelector('section.member_display ul')
const chat_screen       = document.querySelector('aside.chat_screen section.screen_head figcaption')
const sendingBtn        = document.querySelector('#sendingBtn')


if(!user){
  window.location.href = 'index.html'
}


// remplir le formulaire avec les infos disponible du user
infouser.addEventListener('click', (e)=>{
  infouserform.classList.toggle('cache')
  infouserform.classList.toggle('xcache')
  inputs = infouserform.querySelectorAll('input')
  if (!infouserform.classList.contains('cache')) {
    inputs.forEach((item, i) => {
      if(Object.keys(user).includes(item.name)){
        item.value = user[item.name]
        // console.log(user[item.name])
      }
    })
  }
})


submitbtn.addEventListener('click', async (e)=>{
  e.preventDefault()
  data = {}
  data.sexe = sexe.options[sexe.selectedIndex].value
  data.name = name.value
  data.username = username.value
  data.prenom = prenom.value
  data.address = address.value
  data.age = age.value
  data.profession = profession.value
  data.phone = phone.value
  // console.log(data)
  localStorage.setItem('user', JSON.stringify(data))
  infouserform.classList.toggle('cache')

  response = await fetch(complete_url + username.value, {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
            "Content-type": "application/json charset=UTF-8",
            "Access-Control-Allow-Origin" : "*"
        }
  })
  if(response.status == 200){
    window.location.reload()
  }

  received = await response.json()

  console.log(received)

})

// permet de renseigner les infos des users sur la partie gauche de notre application
document.querySelector('span#prenom_value').innerHTML     = (user.prenom != undefined) ? user.prenom : 'XXXXXXXXXX'
document.querySelector('span#name_value').innerHTML       = (user.name != undefined) ? user.name : 'XXXXXXXXXX'
document.querySelector('span#username_value').innerHTML   = (user.username != undefined) ? user.username : 'XXXXXXXXXX'
document.querySelector('span#phone_value').innerHTML      = (user.phone != undefined) ? user.phone : 'XXXXXXXXXX'
document.querySelector('span#address_value').innerHTML    = (user.address != undefined) ? user.address : 'XXXXXXXXXX'
document.querySelector('span#profession_value').innerHTML = (user.profession != undefined) ? user.profession : 'XXXXXXXXXX'
document.querySelector('span#age_value').innerHTML        = (user.age != undefined) ? user.age : 'XXXXXXXXXX'
document.querySelector('span#sexe_value').innerHTML       = (user.sexe != undefined) ? user.sexe : 'XXXXXXXXXX'

darkmode.onclick = ()=>{
  document.body.classList.toggle('night')
  if(document.body.classList.contains('night')){
    darkmode.style.color = 'white'
  }
  else {
    darkmode.style.color = 'green'

  }
}

logout.addEventListener('click', (e)=>{
  window.location.href = 'index.html'
})

addmember.addEventListener('click', (e)=>{
  admform.classList.toggle('indexed')
  admnom.value = admprenom.value = ''
})

// permet d'ajouter un membre à l'utilisateur actuelle
admform.onsubmit = async (e) =>{
  e.preventDefault()
  data = {}
  data.from = user
  data.lien = parente.options[parente.selectedIndex].value
  data.prenom = admprenom.value
  data.username = admprenom.value + admnom.value + '@gmail.com'
  data.nom = admnom.value
  console.log(data)

  response = await fetch(create_member_url, {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
        "Content-type": "application/json charset=UTF-8",
        "Access-Control-Allow-Origin" : "*"
    }
  })
  console.log(response.status)
  if(response.status == 201){
    admform.classList.toggle('indexed')
    relations()
  }
}


// recueillir tous les relations d'un utilisateur

async function relations(){
  response = await fetch(relations_url + user.username, {
    method: 'GET',
    headers: {
      "Content-type" : "application/json charset=UTF-8",
      "Access-Control-Allow-Origin" : "*"
    }
  })
  parents.innerHTML = siblings.innerHTML = children.innerHTML =''
  data = await response.json()
  data_parents = data.relations.parents
  data_siblings = data.relations.siblings
  data_children = data.relations.children
  member_display.innerHTML = ''
  data_parents.forEach((item, i) => {
      card = memberCard(item.p)
      li = make_member(item.p)
      parents.appendChild(card)
      member_display.appendChild(li)
  })

  data_children.forEach((item, i) => {
      card = memberCard(item.p)
      li = make_member(item.p)
      member_display.appendChild(li)
      children.appendChild(card)
  })

  data_siblings.forEach((item, i) => {
      card = memberCard(item.p)
      li = make_member(item.p)
      siblings.appendChild(card)
      member_display.appendChild(li)

  })

  lis = member_display.querySelectorAll('li')
  lis.forEach((item, i) => {
    item.addEventListener('click', ()=> {
      chat_screen.innerHTML = item.querySelector('figcaption').innerHTML
    })
  })

}

genealogy.onload = relations()


function memberCard(member){
  aside = document.createElement('aside')
  aside.innerHTML = `
              <p>${member.lien}</p>
              <figure>
                <img src="./static/avatar.svg" alt="">
                <figcaption>${member.prenom}</figcaption>
              </figure>
  `

  return aside
}

function make_member(member){
  li = document.createElement('li')
  li.innerHTML = `
        <figure>
          <img src="./static/avatar.svg" alt="">
          <figcaption>${member.prenom}</figcaption>
        </figure>
  `
  return li
}

chatbtn.addEventListener('click', ()=>{
  document.querySelector('div.innerChat').classList.toggle('xshow')
  document.querySelector('div.innerChat').classList.toggle('show')
})


// sendingBtn.addEventListener('click', ()=>{
//   message = document.querySelector('#message_input')
//   if (message.value){
//     p = document.createElement('p')
//     p.setAttribute('class', 'sent')
//     p.innerHTML = message.value
//     document.querySelector('section.message_display').appendChild(p)
//     message.value = ''
//   }
// })

$(document).ready(function(){
  var socket = io.connect('http://127.0.0.1:5000');

  socket.on('connect', function(){
    socket.send(user.username + ' is in the ROOM');
  })

  socket.on('message', function(msg){
    $('#messages').append('<li> <p class="instant">' + msg + '</p></li>')
  })

  $('#sendingBtn').on('click', function(){
    socket.send($('#message_input').val());
    $('#message_input').val('');
  })
});
