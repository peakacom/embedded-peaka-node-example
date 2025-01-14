import {
  Text,
  Button,
  Box,
  TextField,
  Blockquote,
  Heading,
  Table,
} from "@radix-ui/themes";
import { useState } from "react";

const BASE_URL = "https://vercel-node-chi-ten.vercel.app";

function App() {
  const [step, setStep] = useState(0);
  const [isFetching, setIsFetching] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectId, setProjectId] = useState();
  const [projectAPIKey, setProjectAPIKey] = useState("");
  const [catalogName, setCatalogName] = useState("");
  const [schemaName, setSchemaName] = useState("");
  const [tableName, setTableName] = useState("");
  const [result, setResult] = useState<{ [key: string]: unknown }>({});
  const [iframeUrl, setIframeUrl] = useState<string | undefined>();
  const [isNewTab, setIsNewTab] = useState<boolean|undefined>();

  return (
    <div className="w-full h-full flex flex-col justify-center items-center gap-8">
      <Heading>Welcome to Embedded Peaka Demo Project.</Heading>
      <Blockquote>
        First create a Peaka Project by clicking Create Project button.
      </Blockquote>
      <Button
        disabled={isFetching}
        onClick={async () => {
          setIsFetching(true);
          const response = await fetch(`${BASE_URL}/create-peaka-project`);
          if (response.ok) {
            const respJSON = await response.json();
            setProjectAPIKey(respJSON.projectApiKey);
            setProjectName(respJSON.projectName);
            setProjectId(respJSON.projectId)
            setStep(1);
            setIsFetching(false);
          }
        }}
      >
        Create Project
      </Button>
      {(step === 1 || step === 2 || step === 3) && (
        <>
          <Blockquote>
            Your project is created with a project name and API Key. Now click
            Connect button to add your catalog on Peaka.
          </Blockquote>
          <div className="flex justify-center items-center gap-4">
            <Box maxWidth="300px">
              <Text>Project Name</Text>
              <TextField.Root size="3" disabled value={projectName} />
            </Box>
            <Box maxWidth="300px">
              <Text>Project API Key</Text>
              <TextField.Root size="3" disabled value={projectAPIKey} />
            </Box>
            <div className="mt-6">
              <Button
                disabled={isFetching}
                onClick={async () => {
                  setIsFetching(true);
                  setIsNewTab(true)
                  const data = {
                    apiKey: projectAPIKey,
                    projectId: projectId
                  };
                  const response = await fetch(`${BASE_URL}/connect`, {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify(data),
                  });
                  if (response.ok) {
                    const respJSON = await response.json();
                    setTimeout(() => {
                      window.open(respJSON.sessionUrl, "_blank");
                    });

                    setStep(2);
                    setIsFetching(false);
                  }
                }}
              >
                Connect Peaka UI in new tab
              </Button>
              <Button
                disabled={isFetching}
                style={{marginLeft:"0.5rem"}}
                onClick={async () => {
                  setIsNewTab(false)
                  setIsFetching(true);
                  const data = {
                    apiKey: projectAPIKey,
                    projectId: projectId
                  };
                  const response = await fetch(`${BASE_URL}/connect`, {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify(data),
                  });
                  if (response.ok) {
                    const respJSON = await response.json();
                    setIframeUrl(respJSON.sessionUrl);
                    setIsFetching(false);
                  }
                }}
              >
                Connect Peaka UI in an iframe
              </Button>
            </div>
          </div>
        </>
      )}

      {((step === 2 || step === 3) && isNewTab) && (
        <>
          <Blockquote>
            Enter catalog name and schema name and click Get Data button.
          </Blockquote>
          <div className="flex justify-center items-center gap-4">
            <Box maxWidth="300px">
              <Text>Catalog Name</Text>
              <TextField.Root
                size="3"
                value={catalogName}
                onChange={(e) => {
                  setCatalogName(e.target.value as string);
                }}
              />
            </Box>
            <Box maxWidth="300px">
              <Text>Schema Name</Text>
              <TextField.Root
                size="3"
                value={schemaName}
                onChange={(e) => {
                  setSchemaName(e.target.value as string);
                }}
              />
            </Box>
            <Box maxWidth="300px">
              <Text>Table Name</Text>
              <TextField.Root
                size="3"
                value={tableName}
                onChange={(e) => {
                  setTableName(e.target.value as string);
                }}
              />
            </Box>
            <div className="mt-6">
              <Button
                disabled={isFetching}
                onClick={async () => {
                  setIsFetching(true);
                  const data = {
                    apiKey: projectAPIKey,
                    catalogName: catalogName,
                    schemaName: schemaName,
                    tableName: tableName,
                  };

                  const response = await fetch(`${BASE_URL}/get-data`, {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify(data),
                  });
                  if (response.ok) {
                    const respJSON = await response.json();
                    setResult(respJSON);
                    setIsFetching(false);
                    setStep(3);
                  }
                }}
              >
                Get Data
              </Button>
            </div>
          </div>
        </>
      )}
      {step === 3 && isNewTab && (
        <>
          <Blockquote>
            Successfully got the data. Showing sample data 1 row and 10 columns.
          </Blockquote>
          <Table.Root>
            <Table.Header>
              <Table.Row>
                {Object.keys(result).map((key) => (
                  <Table.ColumnHeaderCell>{key}</Table.ColumnHeaderCell>
                ))}
              </Table.Row>
            </Table.Header>

            <Table.Body>
              <Table.Row>
                {Object.keys(result).map((key) => (
                  <Table.Cell>{JSON.stringify(result[key])}</Table.Cell>
                ))}
              </Table.Row>
            </Table.Body>
          </Table.Root>
        </>
      )}

      {iframeUrl && !isNewTab && (
        <iframe
          src={`${iframeUrl}`}
          width={"100%"}
          style={{height: "100vh"} }
        />
      )}
    </div>
  );
}

export default App;
