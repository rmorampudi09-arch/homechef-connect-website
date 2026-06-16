const https = require("https");

function httpsPost(url, headers, body) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);

    const options = {
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      method: "POST",
      headers
    };

    const req = https.request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        resolve({
          statusCode: res.statusCode,
          body: data
        });
      });
    });

    req.on("error", (err) => {
      reject(err);
    });

    req.write(body);
    req.end();
  });
}

module.exports = async function (context, req) {
  try {
    context.log("waitlist function started");

    let body = req.body;

    if (!body && req.rawBody) {
      try {
        body = JSON.parse(req.rawBody);
      } catch (e) {
        context.log("Failed to parse rawBody:", e.message);
      }
    }

    const email = body && body.email ? String(body.email).trim() : "";
    const interestType = body && body.interestType ? String(body.interestType).trim() : "";

    context.log("Parsed request:", { email, interestType });

    if (!email || !interestType) {
      context.res = {
        status: 400,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          success: false,
          message: "email and interestType are required"
        })
      };
      return;
    }

    const tenantId = process.env.TENANT_ID;
    const clientId = process.env.CLIENT_ID;
    const clientSecret = process.env.CLIENT_SECRET;
    const senderMailbox = process.env.SENDER_MAILBOX;
    const notifyTo = process.env.NOTIFY_TO;
    const siteUrl = process.env.SITE_URL || "https://www.presszo.online";

    context.log("Loaded environment variables");

    if (!tenantId || !clientId || !clientSecret || !senderMailbox || !notifyTo) {
      context.res = {
        status: 500,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          success: false,
          message: "Missing one or more required environment variables"
        })
      };
      return;
    }

    // 1) Get Microsoft Graph token
    const tokenBody = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      scope: "https://graph.microsoft.com/.default",
      grant_type: "client_credentials"
    }).toString();

    context.log("Requesting Graph token...");

    const tokenResponse = await httpsPost(
      `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
      {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": Buffer.byteLength(tokenBody)
      },
      tokenBody
    );

    context.log("Graph token response status:", tokenResponse.statusCode);

    let tokenData = {};
    try {
      tokenData = JSON.parse(tokenResponse.body || "{}");
    } catch (e) {
      context.log("Failed to parse token response:", tokenResponse.body);
    }

    if (!tokenData.access_token) {
      context.res = {
        status: 500,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          success: false,
          message: `Failed to get Graph access token: ${tokenResponse.body}`
        })
      };
      return;
    }

    const accessToken = tokenData.access_token;

    // 2) Send email helper
    async function sendMail(to, subject, htmlBody) {
      const payload = JSON.stringify({
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
      });

      const response = await httpsPost(
        `https://graph.microsoft.com/v1.0/users/${senderMailbox}/sendMail`,
        {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(payload)
        },
        payload
      );

      context.log(`sendMail to ${to} status:`, response.statusCode);

      if (response.statusCode < 200 || response.statusCode >= 300) {
        throw new Error(`Graph sendMail failed (${response.statusCode}): ${response.body}`);
      }
    }

    // 3) Send notification to you
    context.log("Sending owner notification...");
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

    // 4) Send thank-you email to the user
    context.log("Sending thank-you email...");
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

    // 5) Return success
    context.res = {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        success: true,
        message: "Interest received successfully. Thank-you email sent."
      })
    };
  } catch (error) {
    const errorMessage = error && error.message ? error.message : "Unknown server error";
    context.log("waitlist function error:", errorMessage);

    context.res = {
      status: 500,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        success: false,
        message: errorMessage
      })
    };
  }
};
