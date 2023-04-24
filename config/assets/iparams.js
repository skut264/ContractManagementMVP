const dropdown = document.querySelector('.management-select');
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
        if (status == 200) return true;
    } catch (error) {
        console.error(error);
        return false;
    }
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

