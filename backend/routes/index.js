var express = require('express');
var router = express.Router();

// Initialize a Peaka session with the provided parameters
// Sends a POST request to initiate a session for the given project with specific themes and feature flags.
const initPeakaSession = async (apiKey, theme, themeOverride, featureFlags) => {
  
  const resp = await fetch(`${process.env.PEAKA_PARTNER_API_BASE_URL}/ui/initSession`,{
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.PEAKA_PARTNER_API_KEY}`,
    },
    body: JSON.stringify({
      projectId: apiKey,
      theme: theme,
      themeOverride: themeOverride,
      featureFlags
    })
  });
  return resp.json()
}

// Middleware to authenticate token in request headers.
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  
  if (!authHeader) {
    return res.status(403).json({ message: "Auth Error!" });
  }

  const token = authHeader.split(" ")[1]; // Handles the "Bearer fake-token-xxx" format.

  if (!token.startsWith("fake-token-")) {
    return res.status(401).json({ message: "Invalid token!" });
  }

  next();
};

// Sample user data with username, password, and role.
const USERS = [
  { username: "admin", password: "admin", role: "admin" },
  { username: "user", password: "user", role: "user" },
];

// POST route to handle user login.
router.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  // Find the user matching the given username and password.
  const user = USERS.find((u) => u.username === username && u.password === password);
  
  if (!user) {
    return res.status(401).json({ message: "Wrong username or password" });
  }

  const token = `fake-token-${Date.now()}`; // Generate a fake token with the current timestamp.
  
  res.json({ token, role: user.role });
});


// POST route to connect to Peaka service and initialize a session.
router.post('/connect', authenticateToken, function(req, res, next){
  const projectId = req.body.projectId
  const theme = req.body.theme ?? "dark"
  const themeOverride = req.body.themeOverride ?? false
  const role = req.headers.role;

  const featureFlags = {}
  if(role === "user"){
    featureFlags.queries = false
    featureFlags.createDataInPeaka = false
  }
  if(role === "admin"){
    featureFlags.createDataInPeaka = false
  }

  // Initialize Peaka session with provided configurations.
  initPeakaSession(projectId, theme, themeOverride, featureFlags).then(data => {
    console.log(data)
    res.send({sessionUrl: data.sessionUrl, partnerOrigin: data.partnerOrigin})
  })
})

module.exports = router;
