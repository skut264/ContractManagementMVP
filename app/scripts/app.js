var client;

init();

async function init() {
  client = await app.initialized();
  client.events.on('app.activated', renderAllData);
}

async function renderAllData() {
  await renderText();
}

async function renderText() {
  const nameElement = document.getElementById('nameText');
  const choursElement = document.getElementById('choursText');
  const cexpElement = document.getElementById('chText');
  //const cidElement = document.getElementById('cidText');
  const contactData = await client.data.get('contact');
  const  contacthrs =contactData.contact.custom_fields.chours ;
  const ch = contactData.contact.custom_fields.ch;
  const cid = contactData.contact.company_id;
	
  const {
    contact: {name}
  } = contactData;
console.log(contactData)

   nameElement.innerHTML = `Ticket is created by ${name}`;
  choursElement.innerHTML = `Total Contract hours available for you is ${contacthrs}`;
  cexpElement.innerHTML=`Your Company ID ${cid}`;
  //cidElement.innerHTML=`Your Company Contract Ends on ${cid}`;
  
}
  

  
	

