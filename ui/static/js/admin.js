const addbtn   = document.querySelector('#addbtn')
const form     = document.querySelector('form')
const closeBtn = document.querySelector('#closeBtn')
const body     = document.querySelector('.body')
const name     = form.querySelector('#name')
const username = form.querySelector('#username')
const password = form.querySelector('#password')
const user_url = "http://127.0.0.1:5000/add/user"
const all_users = "http://127.0.0.1:5000/all/users"
const update_url = "http://127.0.0.1:5000/update/"
const delete_url = "http://127.0.0.1:5000/delete/"
const tbody = document.querySelector('tbody')
const warning = document.querySelector('#warning')
const submitbtn = document.querySelector('#submitbtn')
const deconnexion = document.querySelector('#deconnexion')

deconnexion.addEventListener('click', (e)=>{
  window.location.href = 'index.html'
})


window.onload = async (e)=>{
  response = await fetch(all_users, {
    method: 'GET',
    headers: {
        "Content-type": "application/json charset=UTF-8",
        "Access-Control-Allow-Origin" : "*"
    }
  })
  data = await response.json()
  data.forEach((item, i) => {
    tr = itemBuilder(item)
    tbody.appendChild(tr)
  })

  supprimers = document.querySelectorAll('button.supprimer')
  supprimers.forEach((item, i) => {
    item.onclick = async (e)=>{
      xusername = item.parentNode.parentNode.querySelector('input[name="username"]').value
      console.log(delete_url + xusername)

      response = await fetch(delete_url + xusername, {
        methods: 'GET',
        headers: {
            "Content-type": "application/json charset=UTF-8",
            "Access-Control-Allow-Origin" : "*"
        }
      })

      if (response.status == 200){
        window.location.reload()
      }
    }
  })


  modifiers = document.querySelectorAll('button.modifier')
  modifiers.forEach((item, i) => {
    item.onclick = (e)=>{
      form.classList.add('modifier')
      form.classList.remove('ajouter')
      form.querySelector('#submitbtn').innerText = 'Modifier'
      parentItem = item.parentNode.parentNode
      inputs = parentItem.querySelectorAll('input[type="text"]')
      obj = {}
      inputs.forEach((inputItem, i) => {
        obj[inputItem.name] = inputItem.value
      })
      username_key = obj['username']
      inputs_in_form = form.querySelectorAll('input')
      inputs_in_form.forEach((itemForm, i) => {
          if (itemForm.id =='password') {
            itemForm.type = 'text'
          }
          if(itemForm.id =='profil'){
            itemForm.disabled = false
          }
          itemForm.value = obj[itemForm.id]
      })

      submitbtn.onclick = async (e)=>{
        e.preventDefault()
        if (form.classList.contains('modifier')) {
          data = await fetch(update_url + username_key, {
            method: 'PUT',
            body: JSON.stringify({
              'name' : name.value,
              'username' : username.value,
              'profil' : 'user',
              'password' : password.value,
            }),
            headers: {
                "Content-type": "application/json charset=UTF-8",
                "Access-Control-Allow-Origin" : "*"
            }
          })
          if (data.status == 201){
            window.location.reload()
          }
          response = await data.json()
          console.log(response)
        }
      }

      form.style.left = '5%'
      body.classList.add('blur')
      warning.style.color = '#20bf6b'
      warning.innerHTML = 'Vous pouvez effectuer une modification !'
    }
  })


}

addbtn.addEventListener('click', (e)=>{
  form.classList.remove('modifier')
  form.classList.add('ajouter')
  form.querySelector('#profil').disabled = true
  form.querySelector('#submitbtn').innerText = 'Ajouter'
  name.value = username.value = password.value = ''
  form.style.left = '5%'
  body.classList.add('blur')
  warning.style.color = '#20bf6b'
  warning.innerHTML = 'Ne pas mettre un mail qui existe deja !'
})


closeBtn.addEventListener('click', (e)=>{
  form.style.left = '-50%'
  body.classList.remove('blur')
  warning.innerHTML =''
})


submitbtn.onclick = async (e)=>{
  e.preventDefault()
  if (form.classList.contains('ajouter')) {
    data = await fetch(user_url, {
      method: 'POST',
      body: JSON.stringify({
        'name' : name.value,
        'username' : username.value,
        'profil' : 'user',
        'password' : password.value,
      }),
      headers: {
          "Content-type": "application/json charset=UTF-8",
          "Access-Control-Allow-Origin" : "*"
      }
    })

    if (data.status == 201){
      window.location.reload()
    }
    if (data.status == 409){
      warning.innerHTML = 'Ce mail est déjà utilisé !'
      warning.style.color =  '#eb3b5a'
    }
  }
}


function itemBuilder(item){
  tr = document.createElement('tr')

  tr.innerHTML = `
      <td><input type="text" name="username" value="${item.username}" disabled></td>
      <td><input type="text" name="name" value="${item.name}" disabled></td>
      <td><input type="text" name="password" value="${item.password}" disabled></td>
      <td><input type="text" name="profil" value="${item.profil}" disabled></td>
      <td><button class="btn btn-outline-primary modifier" type="button" name="button">Modifier</button></td>
      <td><button class="btn btn-outline-danger supprimer" type="button" name="button">Supprimer</button></td>
  `
  return tr
}
