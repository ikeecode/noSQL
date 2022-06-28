const user = JSON.parse(localStorage.getItem('user'))
const infouser = document.querySelector('#infouser')
const infouserform = document.querySelector('#infouserform')


infouser.addEventListener('click', (e)=>{
  infouserform.classList.toggle('cache')
  inputs = infouserform.querySelectorAll('input')
  if (!infouserform.classList.contains('cache')) {
    sexe = infouserform.querySelector('select')
    sexe_value = sexe.options[sexe.selectedIndex].value
    console.log(sexe_value)
    inputs.forEach((item, i) => {
      console.log(item.name)
    })

  }

})
console.log(user)
