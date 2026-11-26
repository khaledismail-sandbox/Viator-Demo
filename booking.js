let holdClock;
const countries = {'New York City':'USA','Las Vegas':'USA','Washington DC':'USA',Oahu:'USA',Barcelona:'Spain',Rome:'Italy',Florence:'Italy',Cancun:'Mexico',Paris:'France',London:'England'};
const cash = n => new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(n);
const dateLabel = (day,full=false) => new Date(day+'T12:00:00').toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric',...(full?{year:'numeric'}:{})});
const escapeHTML = x => String(x??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const getReservation = () => {try{return JSON.parse(sessionStorage.getItem('reservation'))}catch{return null}};
function nextDay(){
 const d=new Date();d.setDate(d.getDate()+1);
 return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');
}
function tourSearch(city){
 const a=document.createElement('a');a.id='tour-search';a.href='#destinations';a.textContent='⌕　 '+city;
 document.querySelector('.bar .nav').before(a);
}
function section(title,content){return '<details class="info"><summary>'+title+'</summary>'+content+'</details>'}
function infoList(items){return '<ul>'+items.map(item=>'<li>'+escapeHTML(item)+'</li>').join('')+'</ul>'}
function renderTour(city){
 const d=tourCatalogue[city], title=escapeHTML(d.title), region=city+', '+countries[city], route=encodeURIComponent(city);
 const fallback='See the selected tour option for its departure and meeting details.';
 const meeting=city==='Paris'||!d.meeting?fallback:d.meeting;
 const rate=Number(d.price.replaceAll(',',''));const previous=getReservation();
 const day=sessionStorage.getItem('visitDate');const initialDate=day&&day>=dateToday?day:nextDay();
 const favKey='wishlist:'+city;
 tourSearch(city);
 const pics=d.photos.map((src,i)=>'<button type="button" class="tile shot'+i+'" data-photo="'+i+'" aria-label="Open tour photo '+(i+1)+'"><img src="'+src+'" alt="'+title+' — photo '+(i+1)+'"></button>');
 main.innerHTML=`<div class="product">
 <div class="crumbs"><a href="#search/${route}">‹　All Experiences in ${city}</a>　 •　 <a href="#home">Home</a> / Things to do in ${countries[city]} / Things to do in ${city} / ${city} Tours</div>
 <h1>${title}</h1><div class="tour-meta"><span class="stars" aria-label="${escapeHTML(d.rating)}">${parseFloat(d.rating)>=5?'★★★★★':'★★★★◐'}</span> <a href="#reviews" data-scroll="reviews">${escapeHTML(d.reviews)} Reviews</a>${d.badge?'　 │　 🏅 Badge of Excellence':''}　 │　 ${region}<span class="guarantee">♢　Lowest Price Guarantee</span></div>
 <div class="product-grid"><article><div class="mosaic ${d.galleryStyle} ${d.award.length?'':'no-award'}">${pics[0]}${pics[1]}<div class="best"><small>${escapeHTML(d.award[0])}</small><strong>${escapeHTML(d.award[1])}</strong></div>${pics[2]}${pics[3]}<div class="photo-actions"><button id="share" aria-label="Share tour">↥</button><button id="wish" aria-label="Save to wishlist" aria-pressed="${localStorage.getItem(favKey)==='1'}">♡</button></div></div>
 <div class="features">${d.features.map((v,i)=>'<span><b>'+['◷','◇','▣','▤'][i%4]+'</b> '+escapeHTML(v)+'</span>').join('')}</div>
 <section class="opinion" id="reviews"><h2>Why travelers loved this <small>ⓘ</small></h2><span>★　${escapeHTML(d.rating?.match(/[\d.]+/)?.[0])}　·　${escapeHTML(d.reviews)} Reviews</span></section>
 <h2>Overview</h2><p>${escapeHTML(d.overview)}</p>
 ${section("What's Included",infoList(d.included))}
 <details class="info" id="pickup"><summary>Meeting and Pickup</summary><h3>Meeting point</h3><p>${escapeHTML(meeting)}</p></details>
 ${section('Itinerary',d.itinerary.length?infoList(d.itinerary):'<p>'+title+' · '+region+'</p>')}
 ${section('Additional Info',infoList(d.additional))}
 ${section('Cancellation Policy',d.cancel?'<p>Cancel up to 24 hours before the experience starts for a full refund.</p>':'<p>Cancellation terms depend on the selected option.</p>')}
 </article><aside><form class="availability"><h2>From <strong>${cash(rate)}</strong> <small>per person</small></h2><div class="tags">◇　Lowest Price Guarantee</div>
 <div class="date-party"><label>Date<input type="date" id="date" required min="${dateToday}" value="${initialDate}"></label><label>Travelers<select id="party">${[1,2,3,4,5,6].map(n=>'<option '+(n===(previous?.city===city?previous.party:2)?'selected':'')+'>'+n+'</option>').join('')}</select></label></div>
 <button class="green" id="availability">Check Availability</button><div id="options" hidden><h3>Select a start time</h3><div class="times">${['8:00 AM','9:00 AM','10:30 AM','2:30 PM'].map((t,i)=>'<label><input type="radio" name="time" value="'+t+'" '+(i===0?'checked':'')+'><span>'+t+'</span></label>').join('')}</div><p id="option-total"></p><button type="button" class="green" id="book">Book Now</button></div>
 <div class="terms">${d.cancel?'<p>✓　<u>Free cancellation</u> up to 24 hours before the experience starts (local time)</p>':''}${d.payLater?'<p>✓　<u>Reserve Now and Pay Later</u> - Secure your spot while staying flexible</p>':''}</div></form>${d.bookAhead?'<div class="ahead">♨　 Book ahead!<br>　　 On average, this is booked '+Number(d.bookAhead)+' days in advance.</div>':''}</aside></div></div>
 <dialog id="photo-dialog"><button type="button" class="close-photo" aria-label="Close gallery">×</button><img alt="Tour photo"><div><button id="prev">‹ Previous</button><span id="counter"></span><button id="next">Next ›</button></div></dialog>`;
 const form=document.querySelector('.availability'),options=document.querySelector('#options'),date=form.querySelector('#date'),party=form.querySelector('#party');
 const availability=form.querySelector('#availability');
 form.onsubmit=e=>{e.preventDefault();options.hidden=false;availability.hidden=true;document.querySelector('#option-total').textContent=party.value+' travelers · '+cash(rate*Number(party.value));track('Availability Checked',{destination:city})};
 for(const el of [date,party])el.onchange=()=>{options.hidden=true;availability.hidden=false};
 document.querySelector('#book').onclick=()=>{let record={city,date:date.value,party:Number(party.value),time:form.elements.time.value,confirmed:false,holdUntil:Date.now()+900000};sessionStorage.setItem('reservation',JSON.stringify(record));sessionStorage.setItem('visitDate',record.date);go('checkout/'+route)};
 document.querySelector('#pickup').ontoggle=e=>{if(e.target.open)track('Pickup Details Viewed',{destination:city})};
 document.querySelector('[data-scroll]').onclick=e=>{e.preventDefault();document.querySelector('#reviews').scrollIntoView()};
 const wish=document.querySelector('#wish');wish.onclick=()=>{let selected=wish.getAttribute('aria-pressed')!=='true';wish.setAttribute('aria-pressed',String(selected));localStorage.setItem(favKey,selected?'1':'0')};
 document.querySelector('#share').onclick=async e=>{try{await navigator.clipboard.writeText(location.href);e.target.textContent='✓'}catch{window.prompt('Copy tour link',location.href)}};
 const dialog=document.querySelector('#photo-dialog');let current=0;
 function photo(n){current=(n+d.photos.length)%d.photos.length;dialog.querySelector('img').src=d.photos[current];dialog.querySelector('#counter').textContent=(current+1)+' / '+d.photos.length}
 document.querySelectorAll('[data-photo]').forEach(b=>b.onclick=()=>{photo(Number(b.dataset.photo));dialog.showModal()});dialog.querySelector('.close-photo').onclick=()=>dialog.close();dialog.querySelector('#prev').onclick=()=>photo(current-1);dialog.querySelector('#next').onclick=()=>photo(current+1);
 track('Tour Viewed',{destination:city});
}
function renderCheckout(city,page){
 const r=getReservation(),route=encodeURIComponent(city);
 if(!r||r.city!==city||!/^\d{4}-\d{2}-\d{2}$/.test(r.date)||!Number.isInteger(r.party)||r.party<1||r.party>6){location.replace('#tour/'+route);return}
 if(r.confirmed!==(page==='confirmation')){location.replace('#'+(r.confirmed?'confirmation/':'checkout/')+route);return}
 const d=tourCatalogue[city],title=escapeHTML(d.title),total=cash(Number(d.price.replaceAll(',',''))*r.party);
 const time=escapeHTML(r.time||'8:00 AM'),date=dateLabel(r.date,true);
 if(r.confirmed){main.innerHTML=`<section class="wrap summary"><h1>Booking confirmed</h1><p>Practice reservation · No payment taken</p><div class="box"><h2>${title}</h2><p>${date} · ${time} · ${r.party} travelers</p><strong>Total ${total}</strong></div><p><a href="#home">Continue exploring</a></p></section>`;return}
 const contact=`<p>We'll use this information to send you confirmation and updates about your booking</p><button type="button" id="sample" class="quick"><b>Use sample contact details</b> for a faster practice checkout</button><div class="contact-grid amp-mask">${['First name','Last name','Email','Confirm Email','Country code','Phone number'].map((v,i)=>'<div class="field f'+i+'"><input readonly aria-label="'+v+'" placeholder="'+(i===4?'(+1) United States':v)+'">'+(i===2?'<small>We’ll send booking confirmation emails here</small>':i===3?'<small>Just to ensure we got the right email.</small>':'')+'</div>').join('')}</div><label class="opt"><input type="checkbox"> Get emails with special offers, inspiration, tips, and other updates from Viator. You can unsubscribe at any time.</label>`;
 main.innerHTML=`<div class="checkout-wrap"><section class="steps">${['Contact details','Activity details','Payment details'].map((name,i)=>'<section class="step"><h2><span>'+ (i+1)+'</span> '+name+'</h2><div class="step-body" '+(i?'hidden':'')+'>'+[contact,'<p>'+title+'</p><p>'+date+' · '+time+' · '+r.party+' travelers</p><p><b>Meeting and Pickup</b><br>'+escapeHTML(city==='Paris'||!d.meeting?'See the selected tour option for departure details.':d.meeting)+'</p>','<p>Practice reservation. No payment is collected and no tour will be booked.</p><p><b>Total '+total+'</b></p>'][i]+'<button type="button" class="green advance">'+(i===2?'Confirm practice reservation':'Next')+'</button></div></section>').join('')}</section><aside class="checkout-aside"><div class="order"><div class="timer">◴　Holding your spot for <b id="hold">15:00</b> minutes</div><div class="order-pad"><div class="ordered"><img src="${d.photos[0]}" alt=""><b>${title}</b></div><p>♙　${r.party} ${r.party===1?'Adult':'Adults'} <strong class="right">${total}</strong></p><p>▣　${date} · ${time}</p>${d.cancel?'<p>✓　<u>Free cancellation</u> + <u>Unlimited rescheduling</u></p>':''}</div><details class="promo"><summary>◇　Enter Promo Code</summary><p>Promo codes are unavailable for practice reservations.</p></details><div class="order-total">Total price <u>(USD)</u>: <strong>${total}</strong></div></div><div class="confidence"><h3>Book with confidence</h3><b>Exceptional flexibility</b><p>Free cancellation and lowest price guarantee</p><b>24/7 global support</b><p>Our award-winning customer service team is here to help</p></div></aside></div>`;
 const steps=[...document.querySelectorAll('.step')];function openStep(i){steps.forEach((s,k)=>{s.querySelector('.step-body').hidden=k!==i;s.classList.toggle('current',k===i)});steps[i].scrollIntoView({block:'nearest'})}
 const sample=()=>{document.querySelectorAll('.contact-grid input').forEach((el,i)=>el.value=['Alex','Traveler','alex@example.com','alex@example.com','(+1) United States','202-555-0147'][i])};
 document.querySelector('#sample').onclick=sample;
 steps.forEach((s,i)=>s.querySelector('.advance').onclick=()=>{if(i<2){if(i===0)sample();openStep(i+1)}else{r.confirmed=true;sessionStorage.setItem('reservation',JSON.stringify(r));track('Booking Completed',{destination:city,party_size:r.party});go('confirmation/'+route)}});
 const until=r.holdUntil||Date.now()+900000;
 function tick(){const left=Math.max(0,Math.ceil((until-Date.now())/1000));document.querySelector('#hold').textContent=Math.floor(left/60)+':'+String(left%60).padStart(2,'0');if(!left){clearInterval(holdClock);document.querySelector('.timer').innerHTML='<a href="#tour/'+route+'">Time expired · Check availability again</a>';steps.forEach(s=>s.querySelector('.advance').disabled=true)}}
 holdClock=setInterval(tick,1000);tick();track('Checkout Started',{destination:city});
}
