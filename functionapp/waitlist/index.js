module.exports = async function (context, req) {
  try {
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

    context.log("waitlist minimal function hit", { email, interestType });

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
  } catch (error) {
    context.log("waitlist minimal error:", error);

    context.res = {
      status: 500,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        success: false,
        message: error && error.message ? error.message : "Unknown server error"
      })
    };
  }
};
