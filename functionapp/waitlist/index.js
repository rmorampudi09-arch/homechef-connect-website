module.exports = async function (context, req) {
  try {
    const { email, interestType } = req.body || {};

    if (!email || !interestType) {
      context.res = {
        status: 400,
        body: {
          success: false,
          message: "email and interestType are required"
        }
      };
      return;
    }

    const tenantId = process.env.TENANT_ID;
    const clientId = process.env.CLIENT_ID;
    const clientSecret = process.env.CLIENT_SECRET;
    const senderMailbox = process.env.SENDER_MAILBOX;
    const notifyTo = process.env.NOTIFY_TO;
    const siteUrl = process.env.SITE_URL || "https://www.presszo.online";

    const tokenResponse = await fetch(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        scope: "https://graph.microsoft.com/.default",
        grant_type: "client_credentials"
      })
    });

    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
      context.log("Graph token error:", tokenData);
      context.res = {
        status: 500,
        body: {
          success: false,
          message: "Failed to get Graph access token"
        }
      };
      return;
    }

    const accessToken = tokenData.access_token;

    async function sendMail(to, subject, htmlBody) {
      const sendResponse = await fetch(`https://graph.microsoft.com/v1.0/users/${senderMailbox}/sendMail`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: {
            subject,
            body: {
              contentType: "HTML",
              content: htmlBody
            },
            toRecipients: [
              {
                emailAddress: {
                  address: to
                }
              }
            ]
          },
          saveToSentItems: true
        })
      });

      if (!sendResponse.ok) {
        const errText = await sendResponse.text();
        throw new Error(`Graph sendMail failed: ${sendResponse.status} ${errText}`);
      }
    }

    await sendMail(
      notifyTo,
      `New HomeChef Connect interest — ${interestType}`,
      `
        <h2>New HomeChef Connect interest</h2>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Interest Type:</strong> ${interestType}</p>
        <p><strong>Website:</strong> ${siteUrl}</p>
        <p><strong>Submitted At:</strong> ${new Date().toISOString()}</p>
      `
    );

    await sendMail(
      email,
      "Thank you for your interest in HomeChef Connect",
      `
        <p>Hello,</p>
        <p>Thank you for registering your interest in <strong>HomeChef Connect</strong>.</p>
        <p>You registered as: <strong>${interestType}</strong>.</p>
        <p>We’re building a trusted homemade food community for customers and home chefs, and we’ll keep you updated as we move toward launch.</p>
        <p>Website: <a href="${siteUrl}">${siteUrl}</a></p>
        <p>Regards,<br/>HomeChef Connect</p>
      `
    );

    context.res = {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      },
      body: {
        success: true,
        message: "Interest received successfully. Thank-you email sent."
      }
    };

  } catch (error) {
    context.log("ERROR:", error);
    context.res = {
      status: 500,
      headers: {
        "Content-Type": "application/json"
      },
      body: {
        success: false,
        message: error.message
      }
    };
  }
};
