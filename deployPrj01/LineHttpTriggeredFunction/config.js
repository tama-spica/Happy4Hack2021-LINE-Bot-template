// @ts-check

const config = {
  endpoint: "https://line-test.documents.azure.com:443/",
  key: "qxomrXYidiCow0kA8wPVK4Atro5DnCyPWtD6GRMc6DLIvgrPv2EkB8L8vFY1G7PIBujtE8R5LRSVYyGrRcBkYA==",
  databaseId: "Tasks",
  containerId: "Items",
  partitionKey: { kind: "Hash", paths: ["/category"] }
};

module.exports = config;
