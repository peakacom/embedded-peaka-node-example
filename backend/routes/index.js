var {connectToPeaka} = require("@peaka/client")

var express = require('express');
var router = express.Router();

const idGenerator = () => {
  return Math.random().toString(36).slice(6).toUpperCase()
}

const createPeakaProject = async (projectName) => {
  const data = {
    name: projectName
  }
  const resp = await fetch(`${process.env.PEAKA_PARTNER_API_BASE_URL}/projects`,{
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.PEAKA_PARTNER_API_KEY}`,
    },
    body: JSON.stringify(data),
  });
  return resp.json()
}

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


const createApiKey = async (projectId, projectName) => {
  const data = {
    name: projectName
  }
  const resp = await fetch(`${process.env.PEAKA_PARTNER_API_BASE_URL}/projects/${projectId}/apiKeys`,{
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.PEAKA_PARTNER_API_KEY}`,
    },
    body: JSON.stringify(data), // body data type must match "Content-Type" header
  });
  return resp.json()
}

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  
  if (!authHeader) {
    return res.status(403).json({ message: "Auth Error!" });
  }

  const token = authHeader.split(" ")[1]; // "Bearer fake-token-xxx" formatını işler

  if (!token.startsWith("fake-token-")) {
    return res.status(401).json({ message: "Invalid token!" });
  }

  next();
};

const USERS = [
  { username: "admin", password: "admin", role: "admin" },
  { username: "user", password: "user", role: "user" },
];

router.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  const user = USERS.find((u) => u.username === username && u.password === password);
  
  if (!user) {
    return res.status(401).json({ message: "Wrong username or password" });
  }

  const token = `fake-token-${Date.now()}`;
  
  res.json({ token, role: user.role });
});



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

  initPeakaSession(projectId, theme, themeOverride, featureFlags).then(data => {
    console.log(data)
    res.send({sessionUrl: data.sessionUrl, partnerOrigin: data.partnerOrigin})
  })
})

router.get('/create-peaka-project', authenticateToken, function(req, res, next) {
  const projectName = idGenerator();
  createPeakaProject(projectName).then(data => {
    const peakaProjectId = data.id;
    console.log("peakaProjectId", data)
    createApiKey(peakaProjectId, projectName).then(keyData => {
      console.log("res", keyData)
      res.send({projectName: projectName, projectId: peakaProjectId, projectApiKey: keyData.apiKey})
    });
  });
});

router.post("/get-data", authenticateToken, async function(req,res,next){
  const {apiKey, catalogName, schemaName, tableName} = req.body;
  try{
    const connection = connectToPeaka(apiKey, {host: "https://test.peaka.host"});
    const iter = await connection.query(
      `select * from "${catalogName}"."${schemaName}"."${tableName}" limit 100`
    );
    const data = []
    for await (const queryResult of iter) {
      let result = {};
      await queryResult.data?.forEach(async (item, index) => {
        if(Array.isArray(item)){
          await item.forEach((datum, i) => {
            result[queryResult.columns[i].name] = datum
          })
          data.push(result);
        }
      })
      
    }
    res.send(JSON.stringify(data[0]));
  }catch(e){
    console.log("e", e)
    throw Error("Error while getting data")
  }
})

module.exports = router;
