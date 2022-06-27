const user = JSON.parse(localStorage.getItem('user'))
const infouser = document.querySelector('#infouser')
const infouserform = document.querySelector('#infouserform')


infouser.addEventListener('click', (e)=>{
  infouserform.classList.toggle('cache')
})
console.log(user)
