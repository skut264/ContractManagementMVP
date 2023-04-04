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
  const finalElement = document.getElementById('finalText');
  const cidElement = document.getElementById('cidText'); // added this line
  const contactData = await client.data.get('contact');
  const tData = await client.data.get('ticket');
  const tcreated = tData.ticket.created_at;
  const ch = contactData.contact.custom_fields.ch;
  //const cid = contactData.contact.company_id;

  const {
    contact: { name }
  } = contactData;
  console.log(contactData);
  console.log(tData);

  nameElement.innerHTML = `Ticket is created by ${name}`;
  choursElement.innerHTML = `Ticket created on  ${tcreated}`;
  //cexpElement.innerHTML = `Your Company Contract Ends on ${ch}`;
  
  try {
    const renewalDate = await getCompanyRenewalDate(); // Retrieve renewal date using the new function
    cidElement.innerHTML = `Your Company Dash Ends on ${renewalDate}`;
	if(tcreated<renewalDate)
		finalElement.innerHTML = ` Contract Valid, Continue Working`
	else
		finalElement.innerHTML = ` Ticket la kai vecha Setha`
		
  } catch (error) {
    console.error(error);
    cidElement.innerHTML = 'Could not retrieve company details.';
  }
}

async function getCompanyRenewalDate() {
	const contactData = await client.data.get('contact');
  const cid = contactData.contact.company_id;
  const companyID = cid; // Replace with actual company ID
  const apiKey = 'iy4J35AI0aJRCSxzAmc8'; // Replace with actual API key
  const baseUrl = `https://benjaminsquare.freshdesk.com/api/v2/companies/${companyID}`;
  const headers = {
    'Authorization': `Basic ${btoa(apiKey + ':x')}`
  };
  try {
    const response = await fetch(baseUrl, { headers });
    if (response.ok) {
      const companyData = await response.json();
      const renewalDate = companyData.custom_fields.ch;
      return renewalDate;
    } else {
      throw new Error(`Could not retrieve company details. Status : ${response.status}`);
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
}
