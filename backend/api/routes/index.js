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
    body: JSON.stringify(data), // body data type must match "Content-Type" header
  });
  return resp.json()
}

const initPeakaSession = async (apiKey) => {
  
  const resp = await fetch(`${process.env.PEAKA_PARTNER_API_BASE_URL}/ui/initSession?${new URLSearchParams({
    projectId: apiKey
}).toString()}`,{
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.PEAKA_PARTNER_API_KEY}`,
    },
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

/* GET home page. */
router.get('/create-peaka-project', function(req, res, next) {
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

router.post('/connect', function(req, res, next){
  const apiKey = req.body.apiKey;
  const projectId = req.body.projectId
  initPeakaSession(projectId).then(data => {
    console.log(data)
    res.send({sessionUrl: data.sessionUrl})
  })
})

router.post("/get-data", async function(req,res,next){
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
