const username = document.querySelector('#username')
const password = document.querySelector('#password')
const form     = document.querySelector('form')
const url_connexion = "http://127.0.0.1:5000/connexion"
const message  = document.querySelector('#message')
// const fantasy = document.querySelector('#fantasy')


window.onload = async (e)=>{
}


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
    // console.log(response)
    localStorage.setItem('user', JSON.stringify(response))
    if (response.profil == 'user') window.location.href = 'user.html'
    if (response.profil == 'admin') window.location.href = 'admin.html'
  }
}


function randomData(){
  data = new Array()
  for(let i=1; i<101; i++){
    data.push(Math.ceil(Math.random() * 100))
  }
  return data
}

// Animation with d3js

var colorScale = d3.scaleLinear()
      .domain([0, 100])
      .range(['yellow', 'red'])


let svg = d3.select('#fantasy')
          .append('svg')
          .attr('position', 'relative')
          .attr('top','0')
          .attr('width', '100%')
          .attr('height', '100vh')


let circles = svg.selectAll('circle')
          .data(randomData())
          .enter()
            .append('circle')
            .attr('cy', function(value, ind){
              return Math.random() * value * ind
            })
            .attr('cx', function(value, ind){
              return Math.random() * value * ind
            })
            .attr('r', function(value, ind){
              return Math.random() * value * ind
            })
            .attr('fill', function(value){
              return colorScale(value)
            })
            .attr('opacity', '0.6')

function mouve(){
  circles.transition()
    .duration(2000)
    .attr('r', function(value, i){
        return value * Math.random() * 2
      })
      .attr('cy', function(value, i){
        return Math.random() * value * i
      })
      .attr('cx', function(value, i){
        return Math.random() * value * i
      })
      .attr('opacity', function(value){
        return value * 0.006
      })
      .attr('fill', function(value){
        return colorScale(value * Math.random())
      })
}

setInterval(mouve, 2000)


document.querySelectorAll('circle').forEach((item, i) => {
  item.addEventListener('mouseover', (e)=> {
    console.log('this')

    line = d3.select(e.target)
            .append('rect')
            .attr('fill', 'black')
            .attr('x1', Math.random() * 10)
            .attr('x2', Math.random() * 10)
            .attr('y1', Math.random() * 10)
            .attr('y2', Math.random() * 10)

  })
})
