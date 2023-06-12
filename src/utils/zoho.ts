import FormData from "form-data";
import axios from "axios";
import fs from "fs";
import * as stream from "stream";
import { promisify } from "util";

export const sendSignDocument = async (
  requestId: string,
  accessToken: string,
  providerActionId: string,
  clientActionId: string,
  applicationUuid: string,
) => {
  const form = new FormData();

  const payload = {
    requests: {
      actions: [
        {
          is_embedded: true,
          verify_recipient: false,
          action_id: providerActionId,
          action_type: "SIGN",
          private_notes: "",
          signing_order: -1,
        },
        {
          is_embedded: true,
          verify_recipient: false,
          action_id: clientActionId,
          action_type: "SIGN",
          private_notes: "",
          signing_order: -1,
        },
      ],
      request_name: `Test Sign for Application ${applicationUuid}`,
    },
  };

  form.append("data", JSON.stringify(payload));

  const config = {
    method: "post",
    url: `https://sign.zoho.com/api/v1/requests/${requestId}/submit`,
    headers: {
      Authorization: `Zoho-oauthtoken ${accessToken}`,
      ...form.getHeaders(),
    },
    data: form,
  };

  const { data } = await axios(config);

  return data;
};

export const createDocument = async (
  accessToken: string,
  user: any,
  applicationUuid: string,
  provider?: any,
): Promise<any> => {
  // Create document
  // @ts-ignore
  const form = new FormData();

  const fileStream = fs.createReadStream("public/ERC-Sign.pdf");
  // Pass file stream directly to form
  form.append("file", fileStream, "ERC-Sign.pdf");

  const payload = {
    requests: {
      request_name: `Test Sign for Application ${applicationUuid}`,
      expiration_days: 10,
      is_sequential: true,
      actions: [
        {
          action_type: "SIGN",
          recipient_email: provider ? provider.email : process.env.ZOHO_DEFAULT_PROVIDER_EMAIL,
          recipient_name: provider
            ? `${provider.firstName} ${provider.lastName}`
            : process.env.ZOHO_DEFAULT_PROVIDER_NAME,
          verify_recipient: false,
          is_embedded: true,
        },
        {
          action_type: "SIGN",
          recipient_email: user.email,
          recipient_name: `${user.firstName} ${user.lastName}`,
          verify_recipient: false,
          is_embedded: true,
        },
      ],
    },
  };

  form.append("data", JSON.stringify(payload));

  const config = {
    method: "post",
    url: "https://sign.zoho.com/api/v1/requests",
    headers: {
      Authorization: `Zoho-oauthtoken ${accessToken}`,
      ...form.getHeaders(),
    },
    data: form,
  };

  const { data } = await axios(config);

  return data;
};

export const getSignUrl = async (accessToken: string, requestId: string, actionId: string) => {
  const { data } = await axios.post(
    `https://sign.zoho.com/api/v1/requests/${requestId}/actions/${actionId}/embedtoken?host=https://app.refundagents.com`,
    {},
    {
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
      },
    },
  );

  return data;
};

// Get zoho folder Url, just using to check authentication
export const getFolderUrl = async (accessToken: string) => {
  return axios
    .get(`https://sign.zoho.com/api/v1/folders`, {
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
      },
    })
    .then((data) => {
      return data;
    })
    .catch((err) => {
      console.log(`Zoho Auth Error`);
      console.log(err.response.data);
      return null;
    });
};

export const getAccessToken = async (): Promise<string> => {
  const refreshToken = process.env.ZOHO_REFRESH_TOKEN;
  const clientId = process.env.ZOHO_CLIENT_ID;
  const clientSecret = process.env.ZOHO_CLIENT_SECRET;
  const redirectUrl = process.env.ZOHO_REDIRECT_URL;

  const {
    data: { access_token },
  } = await axios.post(
    `https://accounts.zoho.com/oauth/v2/token?refresh_token=${refreshToken}&client_id=${clientId}&client_secret=${clientSecret}&redirect_uri=${redirectUrl}&grant_type=refresh_token`,
    {},
  );

  return access_token;
};

export const updateRecipient = async (
  accessToken: string,
  requestId: string,
  providerActionId: string,
  clientActionId: string,
  provider: any,
  client: any,
): Promise<any> => {
  // Create document
  // @ts-ignore
  const form = new FormData();

  const payload = {
    requests: {
      actions: [
        {
          action_id: providerActionId,
          action_type: "SIGN",
          recipient_email: provider.email,
          recipient_name: `${provider.firstName} ${provider.lastName}`,
          verify_recipient: false,
          is_embedded: true,
        },
        {
          action_id: clientActionId,
          action_type: "SIGN",
          recipient_email: client.email,
          recipient_name: `${client.firstName} ${client.lastName}`,
          verify_recipient: false,
          is_embedded: true,
        },
      ],
    },
  };

  form.append("data", JSON.stringify(payload));

  const config = {
    method: "put",
    url: `https://sign.zoho.com/api/v1/requests/${requestId}`,
    headers: {
      Authorization: `Zoho-oauthtoken ${accessToken}`,
      ...form.getHeaders(),
    },
    data: form,
  };

  const { data } = await axios(config);

  return data.requests.actions;
};

export const getSavedAccessToken = async () => {
  let accessToken =
    global["zohoAccessToken"] || "1000.40882b4606d9a824eaf4f68e533aa150.2085bbeb4f66dd93651cf31ba52a1750";

  const validAccessToken = await getFolderUrl(accessToken);
  // Token expire
  if (!validAccessToken) {
    accessToken = await getAccessToken();

    if (!accessToken) {
      return null;
    }

    global["zohoAccessToken"] = accessToken;
  }

  return accessToken;
};

export async function downloadFile(accessToken: string, requestId: string, outputLocationPath: string): Promise<any> {
  const finished = promisify(stream.finished);

  const writer = fs.createWriteStream(outputLocationPath);
  return axios({
    method: "get",
    url: `https://sign.zoho.com/api/v1/requests/${requestId}/pdf`,
    headers: {
      Authorization: `Zoho-oauthtoken ${accessToken}`,
    },
    responseType: "stream",
  }).then((response: any) => {
    response.data.pipe(writer);
    return finished(writer); //this is a Promise
  });
}
