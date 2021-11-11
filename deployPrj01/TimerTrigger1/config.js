// @ts-check

const config = {
  endpoint: "https://happyhack.documents.azure.com:443/",
  key: "9jv9WymtTO6nt5gBLPVLZ6aGj0lAVh44XoFK5jBq8oDSRqA1iUOhE4cpzCEVAUCzNKjxSaxRMLichNmj74acmA==",
  databaseId: "Tasks",
  containerId: "Items",
  partitionKey: { kind: "Hash", paths: ["/category"] }
};

module.exports = config;
