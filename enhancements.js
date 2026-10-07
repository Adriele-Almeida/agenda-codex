'use strict';

/*
  Camada de inclusoes da Agenda Codex.
  O app.js original permanece intacto; estas funcoes ampliam apenas os fluxos aprovados.
*/
const queryAllEnhanced=function(selector){return Array.from(document.querySelectorAll(selector));};
const weekdaysFullEnhanced=['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado'];
let pickerCursorEnhanced=null;
let pendingDeleteEnhanced=null;

function currentDayEnhanced(){
  const value=new Date();
  value.setHours(12,0,0,0);
  return value;
}
function isTodayEnhanced(value){
  return dateKey(value)===dateKey(currentDayEnhanced());
}
function niceDateEnhanced(value){
  return value.getDate()+' de '+months[value.getMonth()]+' de '+value.getFullYear();
}
function roundedNowEnhanced(){
  const value=new Date();
  value.setSeconds(0,0);
  value.setMinutes(Math.round(value.getMinutes()/5)*5);
  return value;
}
function weekNumberEnhanced(value){
  const first=new Date(value.getFullYear(),value.getMonth(),1,12);
  const gridStart=weekStart(first);
  const activeStart=weekStart(value);
  return Math.floor((activeStart-gridStart)/604800000)+1;
}
function weekRangeEnhanced(start,end){
  if(start.getFullYear()!==end.getFullYear()){
    return pad(start.getDate())+' de '+months[start.getMonth()]+' de '+start.getFullYear()+' a '+pad(end.getDate())+' de '+months[end.getMonth()]+' de '+end.getFullYear();
  }
  if(start.getMonth()!==end.getMonth()){
    return pad(start.getDate())+' de '+months[start.getMonth()]+' a '+pad(end.getDate())+' de '+months[end.getMonth()];
  }
  return pad(start.getDate())+' a '+pad(end.getDate())+' de '+months[start.getMonth()];
}
function updateCurrentMomentEnhanced(){
  const now=new Date();
  $('#current-date').textContent=weekdaysFullEnhanced[now.getDay()]+', '+now.getDate()+' de '+months[now.getMonth()];
  $('#current-time').textContent=pad(now.getHours())+':'+pad(now.getMinutes());
}
function renderHeadingEnhanced(){
  const heading=$('#view-heading');
  if(view==='year'){
    heading.innerHTML='<div class="year-hero"><button class="year-arrow" type="button" data-year-shift="-1" aria-label="Ano anterior">'+svg('left')+'</button><h2 class="year-title">'+cursor.getFullYear()+'</h2><button class="year-arrow" type="button" data-year-shift="1" aria-label="Próximo ano">'+svg('right')+'</button></div>';
    return;
  }
  if(view==='month'){
    heading.innerHTML='<div class="month-heading"><h2>'+months[cursor.getMonth()]+'</h2><span class="year-chip">'+cursor.getFullYear()+'</span></div>';
    return;
  }
  if(view==='week'){
    const start=weekStart(cursor);
    const end=new Date(start);
    end.setDate(start.getDate()+6);
    heading.innerHTML='<div class="week-heading"><span class="week-kicker">'+months[cursor.getMonth()]+' '+cursor.getFullYear()+'</span><h2>Semana '+weekNumberEnhanced(cursor)+'</h2><p class="week-range">'+weekRangeEnhanced(start,end)+'</p></div>';
    return;
  }
  heading.innerHTML='<div class="day-heading"><div class="day-heading-main"><span class="day-number-large">'+pad(cursor.getDate())+'</span><div><h2>'+months[cursor.getMonth()]+'</h2><p>'+weekdaysFullEnhanced[cursor.getDay()]+'</p></div></div><span class="year-chip">'+cursor.getFullYear()+'</span></div>';
}

renderMonth=function(){
  const first=new Date(cursor.getFullYear(),cursor.getMonth(),1,12);
  const last=new Date(cursor.getFullYear(),cursor.getMonth()+1,0,12);
  const start=new Date(first);
  start.setDate(1-first.getDay());
  const count=Math.ceil((first.getDay()+last.getDate())/7)*7;
  let html='<div class="weekdays">'+weekdays.map(function(day){return '<span>'+day+'</span>';}).join('')+'</div><div class="month-grid">';
  for(let index=0;index<count;index++){
    const value=new Date(start);
    value.setDate(start.getDate()+index);
    const key=dateKey(value);
    const outside=value.getMonth()!==cursor.getMonth()||value.getFullYear()!==cursor.getFullYear();
    html+='<div class="day-cell '+(outside?'outside ':'')+(key===dateKey(cursor)?'selected':'')+'" data-date="'+key+'"><div class="cell-date-line"><button class="day-number '+(isTodayEnhanced(value)?'today':'')+'" type="button" data-date="'+key+'" aria-label="'+niceDateEnhanced(value)+'" '+(isTodayEnhanced(value)?'aria-current="date"':'')+'>'+value.getDate()+'</button><span class="cell-weekday">'+weekdays[value.getDay()]+'</span></div><div class="day-entries">'+sortedFor(key).map(entryMarkup).join('')+'</div></div>';
  }
  $('#calendar').innerHTML=html+'</div>';
};
renderYear=function(){
  let html='<div class="year-grid">';
  for(let month=0;month<12;month++){
    const first=new Date(cursor.getFullYear(),month,1,12);
    const last=new Date(cursor.getFullYear(),month+1,0,12);
    html+='<button class="mini-month '+(month===cursor.getMonth()?'current':'')+'" type="button" data-month="'+month+'" aria-label="'+months[month]+' de '+cursor.getFullYear()+'"><span class="mini-title">'+months[month]+'</span><span class="mini-grid">';
    html+=weekdays.map(function(day){return '<span class="mini-week">'+day.charAt(0)+'</span>';}).join('');
    html+='<span></span>'.repeat(first.getDay());
    for(let day=1;day<=last.getDate();day++){
      const value=new Date(cursor.getFullYear(),month,day,12);
      const key=dateKey(value);
      html+='<span class="'+(isTodayEnhanced(value)?'today ':'')+(records.some(function(record){return record.date===key;})?'has-entry':'')+'">'+day+'</span>';
    }
    html+='</span></button>';
  }
  $('#calendar').innerHTML=html+'</div>';
};
renderWeek=function(start){
  let html='<div class="week-stack">';
  for(let index=0;index<7;index++){
    const value=new Date(start);
    value.setDate(start.getDate()+index);
    const key=dateKey(value);
    const outside=value.getMonth()!==cursor.getMonth()||value.getFullYear()!==cursor.getFullYear();
    html+='<section class="week-card '+(outside?'outside':'')+'"><div class="week-date"><button class="week-date-button" type="button" data-week-date="'+key+'" aria-label="'+niceDateEnhanced(value)+'"><strong>'+pad(value.getDate())+'</strong><span>'+weekdaysFullEnhanced[value.getDay()]+'</span></button><button class="day-add" type="button" data-add-date="'+key+'" aria-label="Criar postagem em '+niceDateEnhanced(value)+'">'+svg('plus')+'</button></div><div class="week-entries">'+sortedFor(key).map(entryMarkup).join('')+'</div></section>';
  }
  $('#calendar').innerHTML=html+'</div>';
};
renderDay=function(){
  const items=sortedFor(dateKey(cursor));
  let html='<div class="timeline">';
  for(let hour=0;hour<24;hour++){
    const hourItems=items.filter(function(record){return Number(record.time.split(':')[0])===hour;}).map(entryMarkup).join('');
    html+='<div class="hour-row"><button class="hour-select" type="button" data-hour="'+hour+'" aria-label="Criar postagem às '+pad(hour)+' horas">'+pad(hour)+':00</button><div class="hour-body" data-hour="'+hour+'">'+hourItems+'</div></div>';
  }
  $('#calendar').innerHTML=html+'</div>';
};
render=function(){
  const hiddenHint=document.querySelector('#calendar-hint');
  if(hiddenHint)hiddenHint.textContent='';
  queryAllEnhanced('.view-navigator').forEach(function(group){
    group.setAttribute('aria-current',String(group.dataset.activeView===view));
  });
  $('#month-label').textContent=months[cursor.getMonth()];
  renderHeadingEnhanced();
  if(view==='year')renderYear();
  if(view==='month')renderMonth();
  if(view==='week')renderWeek(weekStart(cursor));
  if(view==='day')renderDay();
};

function shiftViewEnhanced(target,direction){
  view=target;
  if(target==='month')shiftMonth(direction);
  if(target==='week')cursor.setDate(cursor.getDate()+direction*7);
  if(target==='day')cursor.setDate(cursor.getDate()+direction);
  render();
}
$('.view-toolbar').addEventListener('click',function(event){
  const viewButton=event.target.closest('[data-view-control]');
  if(viewButton){
    view=viewButton.dataset.viewControl;
    render();
    return;
  }
  const shiftButton=event.target.closest('[data-shift]');
  if(shiftButton)shiftViewEnhanced(shiftButton.dataset.shift,Number(shiftButton.dataset.direction));
});
$('#view-heading').addEventListener('click',function(event){
  const button=event.target.closest('[data-year-shift]');
  if(!button)return;
  const year=cursor.getFullYear()+Number(button.dataset.yearShift);
  const month=cursor.getMonth();
  const day=Math.min(cursor.getDate(),new Date(year,month+1,0).getDate());
  cursor=new Date(year,month,day,12);
  render();
});
$('#calendar').addEventListener('click',function(event){
  const addButton=event.target.closest('[data-add-date]');
  if(addButton){
    const chosen=parseDate(addButton.dataset.addDate);
    const now=roundedNowEnhanced();
    editRecord(null,isTodayEnhanced(chosen)?now.getHours():0,addButton.dataset.addDate,isTodayEnhanced(chosen)?now.getMinutes():0);
    return;
  }
  const weekDate=event.target.closest('[data-week-date]');
  if(weekDate){
    cursor=parseDate(weekDate.dataset.weekDate);
    view='week';
    render();
  }
});
$('#home-calendar').addEventListener('click',function(){
  cursor=currentDayEnhanced();
  view='month';
  render();
});
$('#open-calendar').addEventListener('click',function(){
  view='year';
  render();
});
$('#go-today').addEventListener('click',function(){
  cursor=currentDayEnhanced();
  render();
});
$('#new-record').addEventListener('click',function(){
  const now=roundedNowEnhanced();
  editRecord(null,now.getHours(),dateKey(now),now.getMinutes());
});
updateCurrentMomentEnhanced();
setInterval(updateCurrentMomentEnhanced,30000);

closeDialog=function(){
  if(busy)return;
  queryAllEnhanced('.wheel-column').forEach(function(column){
    clearTimeout(column._wheelTimer);
    column._wheelTimer=null;
  });
  $('#record-dialog').close();
  draft=null;
  imagePending=null;
  pickerCursorEnhanced=null;
  if(lastFocus&&lastFocus.focus)lastFocus.focus();
};
$('#close-dialog').onclick=closeDialog;

function buildWheelEnhanced(kind){
  const values=kind==='hour'?Array.from({length:24},function(_,index){return index;}):Array.from({length:12},function(_,index){return index*5;});
  return '<div class="wheel-column" data-wheel="'+kind+'">'+values.map(function(value){return '<button class="wheel-option" type="button" data-wheel-value="'+value+'">'+pad(value)+'</button>';}).join('')+'</div>';
}
editRecord=function(id,hour,chosenDate,minute){
  const existing=records.find(function(record){return record.id===id;});
  const initialDate=chosenDate||dateKey(cursor);
  const initialHour=Number.isFinite(hour)?hour:0;
  const initialMinute=Number.isFinite(minute)?minute:0;
  draft=existing?Object.assign({},existing):{
    id:crypto.randomUUID?crypto.randomUUID():Date.now()+'-'+Math.random().toString(36).slice(2),
    date:initialDate,
    time:pad(initialHour)+':'+pad(initialMinute),
    title:'',
    client:'',
    instagram:'',
    link:'',
    caption:'',
    status:'',
    type:'',
    image:'',
    thumbnail:'',
    created:Date.now()
  };
  imagePending=null;
  pickerCursorEnhanced=parseDate(draft.date);
  $('#dialog-title').textContent=existing?'Editar postagem':'Nova postagem';
  $('#dialog-subtitle').textContent=niceDateEnhanced(parseDate(draft.date));
  let form='<form id="record-form" class="fields" novalidate>';
  form+='<div class="date-time">';
  form+='<div class="field"><span>Data</span><button class="picker-trigger" id="date-trigger" type="button" aria-expanded="false"><span id="date-value">'+niceDateEnhanced(parseDate(draft.date))+'</span>'+svg('calendar')+'</button></div>';
  form+='<div class="field"><span>Horário</span><button class="picker-trigger" id="time-trigger" type="button" aria-expanded="false"><span id="time-value">'+escapeHTML(draft.time)+'</span>'+svg('clock')+'</button></div>';
  form+='<div class="picker-panel" id="date-picker" hidden></div>';
  form+='<div class="picker-panel time-panel" id="time-picker" hidden><div class="time-wheel"><div class="wheel-selection"></div>'+buildWheelEnhanced('hour')+buildWheelEnhanced('minute')+'<span class="time-colon">:</span></div></div>';
  form+='</div>';
  form+=textField('field-title','Título',draft.title);
  form+=textField('field-client','Cliente',draft.client);
  form+=textField('field-instagram','Link do Instagram',draft.instagram);
  form+='<div class="field"><span>Imagem</span><label class="upload-area" id="upload-area">'+svg('image')+'<span>Anexar imagem</span><input type="file" id="field-image" accept="image/*" aria-label="Anexar imagem"></label><div class="image-preview" id="image-preview" hidden><img id="preview-image" alt="Imagem anexada"><div class="image-tools"><button class="small-btn" type="button" id="replace-image">'+svg('image')+'Trocar</button><button class="small-btn" type="button" id="remove-image">'+svg('trash')+'Remover</button></div></div></div>';
  form+=textField('field-link','Link',draft.link);
  form+='<div class="field"><div class="caption-heading"><label class="group-title" for="field-caption">Legenda</label><div class="caption-actions"><button class="small-btn" type="button" data-caption="paste">'+svg('paste')+'Colar</button><button class="small-btn" type="button" data-caption="copy">'+svg('copy')+'Copiar</button><button class="small-btn" type="button" data-caption="clear">'+svg('trash')+'Limpar</button></div></div><textarea id="field-caption" spellcheck="true"></textarea></div>';
  form+='<div><span class="group-title" id="status-label">Status</span><div class="choice-group" role="group" aria-labelledby="status-label">';
  ['Publicado','Programado'].forEach(function(value){form+='<button type="button" class="choice" data-status="'+value+'" aria-pressed="'+(draft.status===value)+'">'+svg(value==='Publicado'?'check':'clock')+value+'</button>';});
  form+='</div></div><div><span class="group-title" id="type-label">Tipo</span><div class="choice-group" role="group" aria-labelledby="type-label">';
  Object.keys(icons).forEach(function(value){form+='<button type="button" class="choice" data-type="'+value+'" aria-pressed="'+(draft.type===value)+'">'+svg(icons[value])+value+'</button>';});
  form+='</div></div></form>';
  $('#dialog-body').innerHTML=form;
  $('#field-caption').value=draft.caption||'';
  $('#dialog-actions').innerHTML='<button class="primary" type="submit" form="record-form" id="save-record">'+svg('check')+'Salvar</button>';
  wireEditorEnhanced();
  renderDatePickerEnhanced();
  renderImage();
  openDialog();
};
function togglePickerEnhanced(kind){
  const datePanel=$('#date-picker');
  const timePanel=$('#time-picker');
  const openPanel=kind==='date'?datePanel:timePanel;
  const otherPanel=kind==='date'?timePanel:datePanel;
  const opening=openPanel.hidden;
  openPanel.hidden=!opening;
  otherPanel.hidden=true;
  $('#date-trigger').setAttribute('aria-expanded',String(kind==='date'&&opening));
  $('#time-trigger').setAttribute('aria-expanded',String(kind==='time'&&opening));
  if(kind==='date'&&opening)renderDatePickerEnhanced();
  if(kind==='time'&&opening)requestAnimationFrame(function(){requestAnimationFrame(syncWheelEnhanced);});
}
function renderDatePickerEnhanced(){
  const panel=$('#date-picker');
  if(!panel||!draft||!pickerCursorEnhanced)return;
  const first=new Date(pickerCursorEnhanced.getFullYear(),pickerCursorEnhanced.getMonth(),1,12);
  const last=new Date(pickerCursorEnhanced.getFullYear(),pickerCursorEnhanced.getMonth()+1,0,12);
  let html='<div class="date-picker-head"><button type="button" data-picker-month="-1" aria-label="Mês anterior">'+svg('left')+'</button><strong>'+months[first.getMonth()]+' '+first.getFullYear()+'</strong><button type="button" data-picker-month="1" aria-label="Próximo mês">'+svg('right')+'</button></div>';
  html+='<div class="date-picker-week">'+weekdays.map(function(day){return '<span>'+day+'</span>';}).join('')+'</div><div class="date-picker-grid">';
  html+='<span class="date-blank"></span>'.repeat(first.getDay());
  for(let day=1;day<=last.getDate();day++){
    const value=new Date(first.getFullYear(),first.getMonth(),day,12);
    const key=dateKey(value);
    html+='<button class="date-option '+(key===draft.date?'selected ':'')+(isTodayEnhanced(value)?'today':'')+'" type="button" data-picker-date="'+key+'">'+day+'</button>';
  }
  panel.innerHTML=html+'</div>';
  panel.querySelectorAll('[data-picker-month]').forEach(function(button){
    button.addEventListener('click',function(){
      pickerCursorEnhanced=new Date(pickerCursorEnhanced.getFullYear(),pickerCursorEnhanced.getMonth()+Number(button.dataset.pickerMonth),1,12);
      renderDatePickerEnhanced();
    });
  });
  panel.querySelectorAll('[data-picker-date]').forEach(function(button){
    button.addEventListener('click',function(){
      if(!draft)return;
      draft.date=button.dataset.pickerDate;
      pickerCursorEnhanced=parseDate(draft.date);
      $('#date-value').textContent=niceDateEnhanced(pickerCursorEnhanced);
      $('#dialog-subtitle').textContent=niceDateEnhanced(pickerCursorEnhanced);
      renderDatePickerEnhanced();
    });
  });
}
function syncWheelEnhanced(){
  if(!draft)return;
  const parts=draft.time.split(':').map(Number);
  const hourColumn=$('[data-wheel="hour"]');
  const minuteColumn=$('[data-wheel="minute"]');
  if(!hourColumn||!minuteColumn)return;
  hourColumn.scrollTop=parts[0]*44;
  minuteColumn.scrollTop=Math.round(parts[1]/5)*44;
  updateWheelEnhanced();
}
function updateWheelEnhanced(){
  if(!draft)return;
  const parts=draft.time.split(':').map(Number);
  queryAllEnhanced('[data-wheel="hour"] .wheel-option').forEach(function(option){option.classList.toggle('selected',Number(option.dataset.wheelValue)===parts[0]);});
  queryAllEnhanced('[data-wheel="minute"] .wheel-option').forEach(function(option){option.classList.toggle('selected',Number(option.dataset.wheelValue)===parts[1]);});
}
function acceptWheelEnhanced(column){
  if(!draft||!column||!document.documentElement.contains(column))return;
  const max=column.dataset.wheel==='hour'?23:11;
  const index=Math.max(0,Math.min(max,Math.round(column.scrollTop/44)));
  const parts=draft.time.split(':').map(Number);
  if(column.dataset.wheel==='hour')parts[0]=index;
  else parts[1]=index*5;
  draft.time=pad(parts[0])+':'+pad(parts[1]);
  const timeValue=$('#time-value');
  if(timeValue)timeValue.textContent=draft.time;
  updateWheelEnhanced();
}
function wireEditorEnhanced(){
  $('#record-form').addEventListener('submit',saveRecord);
  $('#date-trigger').addEventListener('click',function(){togglePickerEnhanced('date');});
  $('#time-trigger').addEventListener('click',function(){togglePickerEnhanced('time');});
  queryAllEnhanced('.wheel-column').forEach(function(column){
    column.addEventListener('scroll',function(){
      clearTimeout(column._wheelTimer);
      column._wheelTimer=setTimeout(function(){acceptWheelEnhanced(column);},90);
    },{passive:true});
    column.addEventListener('click',function(event){
      const option=event.target.closest('[data-wheel-value]');
      if(!option)return;
      const index=column.dataset.wheel==='hour'?Number(option.dataset.wheelValue):Number(option.dataset.wheelValue)/5;
      column.scrollTo({top:index*44,behavior:'smooth'});
    });
  });
  $('#field-image').addEventListener('change',loadImage);
  $('#replace-image').addEventListener('click',function(){$('#field-image').click();});
  $('#remove-image').addEventListener('click',function(){
    if(!draft)return;
    draft.image='';
    draft.thumbnail='';
    $('#field-image').value='';
    renderImage();
  });
  queryAllEnhanced('[data-status],[data-type]').forEach(function(button){
    button.addEventListener('click',function(){
      if(!draft)return;
      const key=button.dataset.status?'status':'type';
      const value=button.dataset[key];
      draft[key]=draft[key]===value?'':value;
      queryAllEnhanced('[data-'+key+']').forEach(function(item){item.setAttribute('aria-pressed',String(item.dataset[key]===draft[key]));});
    });
  });
  queryAllEnhanced('[data-caption]').forEach(function(button){
    button.addEventListener('pointerdown',function(event){
      event.preventDefault();
      if(document.activeElement instanceof HTMLElement)document.activeElement.blur();
    });
    button.addEventListener('click',function(){captionAction(button.dataset.caption);});
  });
}
captionAction=async function(action){
  const field=$('#field-caption');
  field.blur();
  dialogMessage('');
  if(action==='clear'){
    field.value='';
    return;
  }
  try{
    if(action==='paste'){
      field.value=await navigator.clipboard.readText();
      announce('Colado');
      return;
    }
    if(navigator.clipboard&&navigator.clipboard.writeText){
      await navigator.clipboard.writeText(field.value);
    }else{
      const helper=document.createElement('textarea');
      helper.value=field.value;
      helper.readOnly=true;
      helper.inputMode='none';
      helper.style.cssText='position:fixed;opacity:0;pointer-events:none';
      $('#record-dialog').append(helper);
      helper.select();
      const copied=document.execCommand('copy');
      helper.remove();
      if(!copied)throw new Error('Cópia indisponível');
    }
    announce('Copiado');
  }catch(error){
    dialogMessage(action==='paste'?'O navegador não permitiu colar.':'O navegador não permitiu copiar.');
  }
};
saveRecord=async function(event){
  event.preventDefault();
  if(busy||!draft)return;
  busy=true;
  const button=$('#save-record');
  button.setAttribute('aria-busy','true');
  try{
    if(imagePending)await imagePending;
    const timePicker=$('#time-picker');
    if(timePicker&&!timePicker.hidden)queryAllEnhanced('.wheel-column').forEach(acceptWheelEnhanced);
    const saved=Object.assign({},draft,{
      title:$('#field-title').value,
      client:$('#field-client').value,
      instagram:$('#field-instagram').value,
      link:$('#field-link').value,
      caption:$('#field-caption').value
    });
    await persist('put',saved);
    const index=records.findIndex(function(record){return record.id===saved.id;});
    if(index>=0)records[index]=saved;
    else records.push(saved);
    cursor=parseDate(saved.date);
    busy=false;
    closeDialog();
    render();
    announce('Salvo');
  }catch(error){
    dialogMessage('Não foi possível salvar no navegador.');
  }finally{
    busy=false;
    if(button)button.removeAttribute('aria-busy');
  }
};
function normalizedURLEnhanced(text){
  let value=String(text||'').trim();
  if(!value)return '';
  if(!/^[a-z][a-z0-9+.-]*:/i.test(value))value='https://'+value;
  try{
    const url=new URL(value);
    return url.protocol==='http:'||url.protocol==='https:'?url.href:'';
  }catch(error){
    return '';
  }
}
function readFieldEnhanced(label,value){
  return value?'<div class="read-field"><span class="read-label">'+label+'</span><p class="read-value">'+escapeHTML(value)+'</p></div>':'';
}
function linkPairEnhanced(label,value){
  if(!value)return '';
  const href=normalizedURLEnhanced(value);
  const open=href?'<a class="open-link" href="'+escapeHTML(href)+'" target="_blank" rel="noopener noreferrer">'+svg('external')+label+'</a>':'<button class="open-link" type="button" disabled>'+label+'</button>';
  return '<span class="link-pair">'+open+'<button class="copy-link" type="button" data-copy-link="'+escapeHTML(value)+'" aria-label="Copiar '+label.toLowerCase()+'">'+svg('copy')+'</button></span>';
}
async function copySavedLinkEnhanced(value){
  try{
    if(navigator.clipboard&&navigator.clipboard.writeText){
      await navigator.clipboard.writeText(value);
    }else{
      const helper=document.createElement('textarea');
      helper.value=value;
      helper.readOnly=true;
      helper.inputMode='none';
      helper.style.cssText='position:fixed;opacity:0;pointer-events:none';
      document.body.append(helper);
      helper.select();
      const copied=document.execCommand('copy');
      helper.remove();
      if(!copied)throw new Error('Cópia indisponível');
    }
    announce('Copiado');
  }catch(error){
    dialogMessage('O navegador não permitiu copiar.');
  }
}
showRecord=function(id){
  const record=records.find(function(item){return item.id===id;});
  if(!record)return;
  $('#dialog-title').textContent='Postagem';
  $('#dialog-subtitle').textContent=niceDateEnhanced(parseDate(record.date))+' · '+record.time;
  let html='<div class="fields">';
  html+=readFieldEnhanced('Título',record.title);
  html+=readFieldEnhanced('Cliente',record.client);
  if(record.image)html+='<img class="read-image" src="'+escapeHTML(record.image)+'" alt="Imagem anexada">';
  if(record.instagram||record.link)html+='<div class="link-actions">'+linkPairEnhanced('Abrir Instagram',record.instagram)+linkPairEnhanced('Abrir imagem',record.link)+'</div>';
  if(record.caption)html+='<div class="read-field"><span class="read-label">Legenda</span><p class="read-caption">'+escapeHTML(record.caption)+'</p></div>';
  if(record.status||record.type)html+='<div class="read-tags">'+[record.status,record.type].filter(Boolean).map(function(value){return '<span class="tag">'+escapeHTML(value)+'</span>';}).join('')+'</div>';
  html+='</div>';
  $('#dialog-body').innerHTML=html;
  $('#dialog-actions').innerHTML='<button class="secondary delete-btn" id="delete-record" type="button">'+svg('trash')+'Excluir</button><button class="primary" id="edit-record" type="button">'+svg('edit')+'Editar</button>';
  $('#edit-record').addEventListener('click',function(){editRecord(id);});
  $('#delete-record').addEventListener('click',function(){confirmDelete(id);});
  queryAllEnhanced('#dialog-body [data-copy-link]').forEach(function(button){
    button.addEventListener('click',function(){copySavedLinkEnhanced(button.dataset.copyLink);});
  });
  openDialog();
};
confirmDelete=function(id){
  pendingDeleteEnhanced=id;
  $('#cancel-delete').onclick=function(){
    pendingDeleteEnhanced=null;
    $('#confirm-dialog').close();
    announce('Cancelado');
  };
  $('#confirm-delete').onclick=async function(){
    if(busy||!pendingDeleteEnhanced)return;
    busy=true;
    const selectedId=pendingDeleteEnhanced;
    try{
      await persist('delete',selectedId);
      records=records.filter(function(record){return record.id!==selectedId;});
      pendingDeleteEnhanced=null;
      $('#confirm-dialog').close();
      busy=false;
      closeDialog();
      render();
      announce('Excluído');
    }catch(error){
      $('#confirm-dialog').close();
      dialogMessage('Não foi possível excluir.');
    }finally{
      busy=false;
    }
  };
  $('#confirm-dialog').showModal();
};
$('#confirm-dialog').addEventListener('cancel',function(){
  if(!busy&&pendingDeleteEnhanced){
    pendingDeleteEnhanced=null;
    announce('Cancelado');
  }
});

render();
