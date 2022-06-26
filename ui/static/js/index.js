const username = document.querySelector('#username')
const password = document.querySelector('#password')
const form     = document.querySelector('form')
const url_connexion = "http://127.0.0.1:5000/connexion"
const message  = document.querySelector('#message')




form.onsubmit = async (e)=>{
  message.innerHTML =''
  message.classList.remove('message')

  e.preventDefault()
  data = await fetch(url_connexion, {
        method: "POST",
        body: JSON.stringify({
          'username' : username.value,
          'password' : password.value
        }),
        headers: {
            "Content-type": "application/json charset=UTF-8",
            "Access-Control-Allow-Origin" : "*"
        }
  })
  if (data.status != 302) {
    message.classList.add('message')
    message.innerHTML = 'login ou mot de passe incorrect !'
    // alert('You are not allowed !')
  }
  else if (data.status == 302) {
    response = await data.json()
    if (response.profil == 'user') window.location.href = 'user.html'
    if (response.profil == 'admin') window.location.href = 'admin.html'
  }
}
