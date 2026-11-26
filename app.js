const main = document.querySelector('#main');
const destinations = ['Las Vegas','Washington DC','Rome','Cancun','Paris','Florence','London','Barcelona','New York City','Oahu'];
const dateToday = new Date().toLocaleDateString('en-CA');
const heroes = [['07','Do more with Viator'],['7a','Read the Viator blog'],['dd','Trip inspo for every kind of traveler']];
const imageFor = city => 'images/'+city.replaceAll(' ','')+'.webp';
const titleFor = city => tourCatalogue[city].title;
function go(page) { location.hash = page; }
function track(name, props = {}) { window.trackTravel?.(name, props); }
function showHome() {
  main.innerHTML = '<section class="hero"><h1>Do more with Viator</h1><p>Plan better with 400,000+ travel experiences.</p><form class="search"><label>Where to?<input id="place" list="cities" placeholder="Search for a place or activity" autocomplete="off"></label><datalist id="cities">'+destinations.map(x=>'<option>'+x+'</option>').join('')+'</datalist><label>When<input aria-label="Select dates" id="when" type="date"></label><button aria-label="Search"><span class="magnifier"></span></button></form><div class="dots">'+heroes.map((h,i)=>'<button aria-label="Show image '+(i+1)+'" aria-pressed="'+(i===2)+'"></button>').join('')+'</div><span class="caption">'+heroes[2][1]+'</span></section><section class="benefits"><h2>Why book with Viator?</h2><div class="perks">'+[['♧','24/7 customer support','No matter the time zone, we’re here to help.'],['♢','Earn rewards','Explore, earn, redeem, and repeat with our loyalty program.'],['☆','Millions of reviews','Plan and book with confidence using reviews from fellow travelers.'],['▢','Plan your way','Stay flexible with free cancellation and the option to reserve now and pay later at no additional cost.']].map(x=>'<article><i>'+x[0]+'</i><h3>'+x[1]+'</h3><p>'+x[2]+'</p></article>').join('')+'</div></section><section class="panel"><h2>Log in to manage bookings &amp; Viator Rewards</h2><a href="https://www.viator.com/login">Log in</a></section>'+catalogue('Top Destinations',destinations,true);
  main.insertAdjacentHTML('beforeend', '<section class="panel"><h2>Keep things flexible</h2><p>Reserve now and pay later on eligible experiences.</p></section>'+catalogue('Top Tours',['New York City','Barcelona','Rome','Florence'])+'<section class="panel"><h2>Free cancellation</h2><p>Cancel at least 24 hours before most experiences for a full refund.</p></section>');
  document.querySelector('#when').min=dateToday;
  document.querySelector('.search').onsubmit=e=>{
    e.preventDefault(); const query=document.querySelector('#place').value.trim();
    const chosenDate=document.querySelector('#when').value;sessionStorage.setItem('visitDate',chosenDate);
    const match=destinations.find(c=>c.toLowerCase()===query.toLowerCase());
    track('Destination Searched',{destination:match||'Other'});
    go('search/'+encodeURIComponent(query));
  };
  document.querySelectorAll('.dots button').forEach((b,i)=>b.onclick=()=>{
    document.querySelector('.hero').style.backgroundImage='linear-gradient(#0004,#0005),url("images/hero-'+heroes[i][0]+'.webp")';
    document.querySelector('.caption').textContent=heroes[i][1];
    document.querySelectorAll('.dots button').forEach((el,j)=>el.setAttribute('aria-pressed',String(i===j)));
  });
}
function catalogue(heading,cities,byCity=false){
 return '<section class="wrap"><h2>'+heading+'</h2><div class="grid">'+cities.map(city=>'<a class="card" href="#'+(byCity?'search':'tour')+'/'+encodeURIComponent(city)+'"><img src="'+(byCity?imageFor(city):tourCatalogue[city].photos[0])+'" alt="'+city+'"><strong>'+(byCity?city:titleFor(city))+'</strong>'+(byCity?'':'<span class="muted">Guided experience · '+city+'</span>')+'</a>').join('')+'</div>'+(cities.length?'':'<p>No matching tours. Try browsing a destination below.</p><a href="#destinations">Browse destinations</a>')+'</section>';
}
function render(){
 const [page,encoded='']=location.hash.slice(1).split('/');
 let value;try{value=decodeURIComponent(encoded)}catch{value=''}
 document.body.dataset.page=page;
 document.querySelector('#tour-search')?.remove();
 clearInterval(holdClock);
 const city=destinations.find(c=>c===value);
 if(page==='destinations')main.innerHTML=catalogue('Top Destinations',destinations,true);
 else if(page==='search')main.innerHTML=catalogue('Tours and activities',destinations.filter(c=>(c+' '+titleFor(c)).toLowerCase().includes(value.toLowerCase())));
 else if(page==='tour' && city) renderTour(city);
 else if((page==='checkout'||page==='confirmation') && city) renderCheckout(city,page);
 else showHome();
 window.scrollTo(0,0);
}
window.addEventListener('hashchange',render);render();
