init();

async function init() {
  client = await app.initialized();
  client.events.on('app.activated', renderAllData);
}

async function renderAllData() {
  await renderText();
  //await renderButton();
}


async function renderText() {
	//const nameElement = document.getElementById('nameText');
  //const choursElement = document.getElementById('choursText');
  const finalElement = document.getElementById('finalText');
  const cidElement = document.getElementById('cidText');
  const contactData = await client.data.get('contact');
  const tData = await client.data.get('ticket');
  const cData = await client.data.get('company');
  const tcreated = tData.ticket.created_at;
  let crenewaldate = cData.company.custom_fields.ch;
  let formattedDate = new Date(crenewaldate).toISOString().split('T')[0];
  //console.log(formattedDate);
  
  let chourss = cData.company.custom_fields.chours;
  const buttonElement = document.getElementById('replyButton');

const timeEntries = await client.data.get('time_entry');

  // Map over the time entry objects and return an array of time spent values
  //const timeSpentArr = timeEntries.map(timeEntry => timeEntry.time_spent);
  /*const timeSpent = timeEntries.time_entry.time_entries[0].time_spent;
  console.log(timeSpent);*/
  let timeSpent = 0;
  
	for (let i = 0; i < timeEntries.time_entry.time_entries.length; i++) {
  timeSpent += parseInt(timeEntries.time_entry.time_entries[i].time_spent);
}
timeSpent = timeSpent/3600;
    
  
  const {
    //contact: { name }
  } = contactData;
  

  // nameElement.innerHTML = `Ticket is created by ${name}`;
  //choursElement.innerHTML = `Ticket created on ${tcreated}`;

  try {
    if (!formattedDate && chourss) {
      // If renewal date is not available but chourss is, make an API call to get time entries for the company
   
	  const companyID = cData.company.id;
      const timeEntriesUrl = `https://developingmyessentials.freshdesk.com/api/v2/time_entries?company_id=${companyID}`;
      const apiKey = 'ciwV7bDL8Nohc71eA7i';
  const headers = {
    'Authorization': `Basic ${btoa(apiKey + ':x')}`
  };

      const timeEntriesResponse = await fetch(timeEntriesUrl, { headers });
      const timeEntriesData = await timeEntriesResponse.json();
	 

    
	   	   
let timeSpentt = 0;
for (let i = 0; i < timeEntriesData.length; i++) {
  timeSpentt += timeEntriesData[i].time_spent_in_seconds;
}
		
		timeSpentt= timeSpentt/3600;
		
	  timeSpent=timeSpent+timeSpentt;
	
	  
      if (timeSpent > chourss) {
        finalElement.innerHTML = 'Error: Company has exceeded allotted hours';
        buttonElement.style.display = 'none';
		client.interface.trigger("showNotify", {
    type: "danger",
    message: "Contract Hours of this client has Expired. Don't work on this ticket"
  /* The "message" should be plain text */
  })
  buttonElement.style.display = 'block';
        buttonElement.addEventListener('click', sendTicketReply);
      } else {
        cidElement.innerHTML = `Your Company has ${chourss} hours allotted`;
        finalElement.innerHTML = `Company has ${timeSpent} hours spent`;
		buttonElement.style.display = 'none';
        
      }
    } else if (formattedDate) {
      // If renewal date is available, check if ticket was created before the renewal date
      cidElement.innerHTML = `Your Company Contract Ends on ${formattedDate}`;
      if (tcreated < formattedDate) {
        finalElement.innerHTML = 'Contract Valid, Continue Working';
        buttonElement.style.display = 'none';

      } else {
		  client.interface.trigger("showNotify", {
    type: "danger",
    message: "Contract Expired  for this client. Don't work on this ticket"
  /* The "message" should be plain text */
  })
        finalElement.innerHTML = `Contract over! Don't work on this ticket.`;
        buttonElement.style.display = 'block';
        buttonElement.addEventListener('click', sendTicketReply);
      }
    } else {
      // If both renewal date and chourss are not available
      cidElement.innerHTML = 'Could not retrieve company details.';
      finalElement.innerHTML = '';
      buttonElement.style.display = 'none';
    }
  } catch (error) {
    console.error(error);
    cidElement.innerHTML = 'Could not retrieve company details.';
  }
}


async function sendTicketReply() {
	 //let apiKey = document.querySelector('.secure-field');
	//apiKey.value = api_key;
	
  const tData = await client.data.get('ticket');
  const ticketId = tData.ticket.id;
  const apiKey = 'ciwV7bDL8Nohc71eA7i'; // Replace with actual API key



  const replyUrl = `https://developingmyessentials.freshdesk.com/api/v2/tickets/${ticketId}/reply`;
  const updateUrl = `https://developingmyessentials.freshdesk.com/api/v2/tickets/${ticketId}`;
  const headers = {
    'Authorization': `Basic ${btoa(apiKey + ':x')}`,
    'Content-Type': 'application/json'
  };
  const payload = {
    body: 'Contract Over, Contact Contractor Nesamani'
  };
  const updatePayload = {
    priority: 1,
    status: 5,
	tags:['contractover']
  };
  try {
    const response = await fetch(replyUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });
    if (response.ok) {
      
      // Call the update API
      const updateResponse = await fetch(updateUrl, {
        method: 'PUT',
        headers,
        body: JSON.stringify(updatePayload)
      });
      if (updateResponse.ok) {
        
      } else {
        throw new Error(`Failed to update ticket. Status: ${updateResponse.status}`);
      }
    } else {
      throw new Error(`Failed to send ticket reply. Status: ${response.status}`);
    }
  } catch (error) {
    
  }
}


async function getCompanyRenewalDate() {
  const contactData = await client.data.get('contact');
  const cid = contactData.contact.company_id;
  const companyID = cid;

  const apiKey = 'ciwV7bDL8Nohc71eA7i';
  const headers = {
    'Authorization': `Basic ${btoa(apiKey + ':x')}`
  };

  try {
    // Try the first API endpoint
    const companyBaseUrl = `https://developingmyessentials.freshdesk.com/api/v2/companies/${companyID}`;
    const ticketsBaseUrl = `https://developingmyessentials.freshdesk.com/api/v2/tickets?company_id=${companyID}`;

    const [companyResponse, ticketsResponse] = await Promise.all([
      fetch(companyBaseUrl, { headers }),
      fetch(ticketsBaseUrl, { headers })
    ]);

    if (companyResponse.ok && ticketsResponse.ok) {
      const companyData = await companyResponse.json();
      const renewalDate = companyData.custom_fields.ch;
      const chours = companyData.custom_fields.chours;
      if (!renewalDate) {
        if (!chours) {
          throw new Error('Renewal date and company hours are missing values');
        } else {
          return chours;
        }
      } else {
        return renewalDate;
      }
    } else {
      // Try second API endpoint
      const baseUrl = `https://developingmyessentials.freshdesk.com/api/v2/companies/${companyID}`;
      const response = await fetch(baseUrl, { headers });
      if (response.ok) {
        const companyData = await response.json();
        const renewalDate = companyData.custom_fields.ch;
        const chours = companyData.custom_fields.chours;
        if (!renewalDate) {
          if (!chours) {
            throw new Error('Renewal date and company hours are missing values');
          } else {
            return chours;
          }
        } else {
          return renewalDate;
        }
      } else {
        throw new Error(`Could not retrieve company details. Status: ${response.status}`);
      }
    }
  } catch (error) {
   
    throw error;
  }
}
