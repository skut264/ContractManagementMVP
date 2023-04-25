const dropdown = document.getElementById('management-select');
let apiKey = document.querySelector('.secure-field');
let domain = document.querySelector('.domain');


function postConfigs() {
    return {
      __meta: {
        secure: ['apiKey']
      },
      api_key: apiKey.value,
      domain_url: domain.value,
     
    };
  }

function getConfigs(configs) {
  let { api_key, transformation, domain_url, name, date } = configs;
  selectedVal.value = transformation;
  apiKey.value = api_key;
  domain.value = domain_url;
  return;
}

async function validate() {
    let URL = `https://${domain.value}/api/v2/tickets`;
    let base64Encoded = btoa(apiKey.value);
    let options = {
        headers: {
            Authorization: `Basic ${base64Encoded}`,
            "Content-Type": "application/json"
        }
    };

    try {
        let {
            status
        } = await client.request.get(URL, options);
        if (dropdown.value === 'contract_hours') {
                await createChourField(apiKey.value, domain.value);
            } else if (dropdown.value === 'expiry_date') {
                await createCompanyField(apiKey.value, domain.value);
            }
            return true;
        
    } catch (error) {
        console.error(error);
        return false;
    }
}

async function createCompanyField(apiKey, domain) {
  const URL = `https://${domain}/api/v2/company_fields`;
  const base64Encoded = btoa(apiKey);
  const options = {
    method: 'POST',
    headers: {
      Authorization: `Basic ${base64Encoded}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      label: "ch",
      type: "custom_date"
    })
  };

  const response = await fetch(URL, options);
  const responseData = await response.json();
  console.log(responseData);
}


async function createChourField(apiKey, domain) {
  const URL = `https://${domain}/api/v2/company_fields`;
  const base64Encoded = btoa(apiKey);
  const options = {
    method: 'POST',
    headers: {
      Authorization: `Basic ${base64Encoded}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      label: "chours",
      type: "custom_number"
    })
  };

  const response = await fetch(URL, options);
  const responseData = await response.json();
  console.log(responseData);
}

document.onreadystatechange = function () {
  if (document.readyState === 'interactive') renderApp();
  async function renderApp() {
    try {
      let client = await app.initialized();
      window.client = client;
    } catch (error) {
      return console.error(error);
    }
  }
};
