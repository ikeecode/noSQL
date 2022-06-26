const addbtn   = document.querySelector('#addbtn')
const form     = document.querySelector('form')
const closeBtn = document.querySelector('#closeBtn')
const body     = document.querySelector('.body')
const name     = form.querySelector('#name')
const username = form.querySelector('#username')
const password = form.querySelector('#password')
const user_url = "http://127.0.0.1:5000/add/user"
const all_users = "http://127.0.0.1:5000/all/users"
const tbody = document.querySelector('tbody')


window.onload = async (e)=>{
  response = await fetch(all_users, {
    method: 'GET',
    headers: {
        "Content-type": "application/json charset=UTF-8",
        "Access-Control-Allow-Origin" : "*"
    }
  })
  data = await response.json()
  console.log(data)
  data.forEach((item, i) => {
    tr = itemBuilder(item)
    tbody.appendChild(tr)
  })

}

addbtn.addEventListener('click', (e)=>{
  form.style.left = '5%'
  body.classList.add('blur')
})


closeBtn.addEventListener('click', (e)=>{
  form.style.left = '-50%'
  body.classList.remove('blur')

})


form.onsubmit = async (e)=>{
  e.preventDefault()
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

}


function itemBuilder(item){
  tr = document.createElement('tr')

  tr.innerHTML = `
      <td><input type="text" name="username" value="${item.username}" disabled></td>
      <td><input type="text" name="name" value="${item.name}" disabled></td>
      <td><input type="text" name="email" value="${item.password}" disabled></td>
      <td><input type="text" name="phone" value="${item.profil}" disabled></td>
      <td><button class="btn btn-outline-primary" type="button" name="button">Modifier</button></td>
      <td><button class="btn btn-outline-danger" type="button" name="button">Supprimer</button></td>
  `
  return tr
}
