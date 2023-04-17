var client;

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
  const nameElement = document.getElementById('nameText');
  const choursElement = document.getElementById('choursText');
  const finalElement = document.getElementById('finalText');
  const cidElement = document.getElementById('cidText');
  const contactData = await client.data.get('contact');
  const tData = await client.data.get('ticket');
  const tcreated = tData.ticket.created_at;
  const buttonElement = document.getElementById('replyButton');

  const {
    contact: { name }
  } = contactData;
  console.log(contactData);
  console.log(tData);

  nameElement.innerHTML = `Ticket is created by ${name}`;
  choursElement.innerHTML = `Ticket created on ${tcreated}`;

  try {
    const renewalDate = await getCompanyRenewalDate();
    cidElement.innerHTML = `Your Company Dash Ends on ${renewalDate}`;
    if (tcreated < renewalDate){
      finalElement.innerHTML = `Contract Valid, Continue Working`;
	  buttonElement.style.display = 'none';
	}
    else
	{
      finalElement.innerHTML = `Ticket la kai vecha Setha`;
	  buttonElement.style.display = 'block';
      buttonElement.addEventListener('click', sendTicketReply);
	}
  } catch (error) {
    console.error(error);
    cidElement.innerHTML = 'Could not retrieve company details.';
  }
}


async function sendTicketReply() {
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
    body: 'Content of the reply goes here'
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
      console.log('Ticket reply sent successfully');
      // Call the update API
      const updateResponse = await fetch(updateUrl, {
        method: 'PUT',
        headers,
        body: JSON.stringify(updatePayload)
      });
      if (updateResponse.ok) {
        console.log('Ticket updated successfully');
      } else {
        throw new Error(`Failed to update ticket. Status: ${updateResponse.status}`);
      }
    } else {
      throw new Error(`Failed to send ticket reply. Status: ${response.status}`);
    }
  } catch (error) {
    console.error(error);
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
    console.error(error);
    throw error;
  }
}

