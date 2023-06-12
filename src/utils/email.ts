import sgMail from "@sendgrid/mail";

const getFrom = (from?: string | null | undefined) => ({
  name: `${from || process.env.SENDGRID_TITLE || ""}`,
  email: process.env.SENDGRID_FROM || "",
});

export const send = async (from: string | null, to: any, subject: string, text: string, html: string) => {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY || "");

  const msg = {
    to,
    from: getFrom(from),
    subject,
    text: text || html,
    html: html || text,
  };
  await sgMail.send(msg);
};

export const sendLoginByCodeEmail = (code: string, hash: string, to: any = {}, title = "") => {
  const codeLoginUrl = `${process.env.BASE_CLIENT_URL}/login-by-code?hash=${hash}&code=${code}`;
  sgMail.setApiKey(process.env.SENDGRID_API_KEY || "");
  const msg = {
    to,
    from: getFrom(),
    templateId: process.env.SENDGRID_LOGIN_BY_CODE_TEMPLATE_ID || "",
    dynamicTemplateData: {
      code,
      buttonUrl: codeLoginUrl,
      subject: title || process.env.SENDGRID_TITLE || "",
    },
  };

  sgMail.send(msg).then(
    () => {},
    (error) => {
      console.error(error);

      if (error.response) {
        console.error(error.response.body);
      }
    },
  );
};

export const sendResetPasswordEmail = (code: string, hash: string, to: any = {}, title = "") => {
  const buttonUrl = `${process.env.BASE_CLIENT_URL}/admin/reset-password?hash=${hash}&code=${code}`;
  sgMail.setApiKey(process.env.SENDGRID_API_KEY || "");
  const msg = {
    to,
    from: getFrom(),
    templateId: process.env.SENDGRID_RESET_PASSWORD_TEMPLATE_ID || "",
    dynamicTemplateData: {
      buttonUrl,
      subject: title || process.env.SENDGRID_TITLE || "",
    },
  };

  sgMail.send(msg).then(
    () => {},
    (error) => {
      console.error(error);

      if (error.response) {
        console.error(error.response.body);
      }
    },
  );
};

export const sendSetupPasswordEmail = (code: string, hash: string, to: any = {}, title = "") => {
  const buttonUrl = `${process.env.BASE_CLIENT_URL}/setup-account?hash=${hash}&code=${code}`;
  sgMail.setApiKey(process.env.SENDGRID_API_KEY || "");
  const msg = {
    to,
    from: getFrom(),
    templateId: process.env.SENDGRID_SETUP_PASSWORD_TEMPLATE_ID || "",
    dynamicTemplateData: {
      buttonUrl,
      subject: title || process.env.SENDGRID_TITLE || "",
    },
  };

  sgMail.send(msg).then(
    () => {},
    (error) => {
      console.error(error);

      if (error.response) {
        console.error(error.response.body);
      }
    },
  );
};

export const sendReminderEmail = (to: any = {}, title = "") => {
  const buttonUrl = `${process.env.BASE_CLIENT_URL}/application`;
  sgMail.setApiKey(process.env.SENDGRID_API_KEY || "");
  const msg = {
    to,
    from: getFrom(),
    templateId: process.env.SENDGRID_REMINDER_TEMPLATE_ID || "",
    dynamicTemplateData: {
      buttonUrl,
      subject: title || process.env.SENDGRID_TITLE || "",
    },
  };

  sgMail.send(msg).then(
    () => {},
    (error) => {
      console.error(error);

      if (error.response) {
        console.error(error.response.body);
      }
    },
  );
};

export const sendWelcomeAboardEmail = (to: any = {}, title = "") => {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY || "");
  const msg = {
    to,
    from: getFrom(),
    templateId: process.env.SENDGRID_WELCOME_ABOARD_TEMPLATE_ID || "",
    dynamicTemplateData: {
      subject: title || process.env.SENDGRID_TITLE || "",
    },
  };

  sgMail.send(msg).then(
    () => {},
    (error) => {
      console.error(error);

      if (error.response) {
        console.error(error.response.body);
      }
    },
  );
};
