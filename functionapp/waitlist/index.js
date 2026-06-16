module.exports = async function (context, req) {
  let body = req.body;

  if (!body && req.rawBody) {
    try {
      body = JSON.parse(req.rawBody);
    } catch (e) {
      body = {};
    }
  }

  const email = body && body.email ? String(body.email).trim() : "";
  const interestType = body && body.interestType ? String(body.interestType).trim() : "";

  context.log("waitlist function hit", { email, interestType });

  context.res = {
    status: 200,
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      success: true,
      message: "Waitlist API is working",
      email,
      interestType
    })
  };
};
