@description('Primary location for all resources')
param location string = resourceGroup().location

@description('The environment type')
@allowed(['dev', 'test', 'prod'])
param environmentType string = 'prod'

@description('The name of the workload')
param workloadName string = 'kassist'

@description('Instance number for resources')
param instanceNumber string = '001'

var regionCode = {
  eastus2: 'eus2'
}[location]

var registryName = 'cr${workloadName}${environmentType}${regionCode}${instanceNumber}'
var storageAccountName = 'st${workloadName}${environmentType}${regionCode}${instanceNumber}'

var tags = {
  workload: workloadName
  environment: environmentType
}

resource containerRegistry 'Microsoft.ContainerRegistry/registries@2023-01-01-preview' = {
  name: registryName
  location: location
  tags: tags
  sku: {
    name: 'Standard'
  }
  properties: {
    adminUserEnabled: false
    anonymousPullEnabled: true
    publicNetworkAccess: 'Enabled'
  }
}

resource storageAccount 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: storageAccountName
  location: location
  tags: tags
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
  properties: {
    accessTier: 'Hot'
    allowBlobPublicAccess: true
    minimumTlsVersion: 'TLS1_2'
    supportsHttpsTrafficOnly: true
  }
}

resource blobService 'Microsoft.Storage/storageAccounts/blobServices@2023-01-01' = {
  parent: storageAccount
  name: 'default'
}

resource extensionContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-01-01' = {
  parent: blobService
  name: 'extension'
  properties: {
    publicAccess: 'Blob'
  }
}

output registryName string = containerRegistry.name
output registryLoginServer string = containerRegistry.properties.loginServer
output storageAccountName string = storageAccount.name
output storageAccountBlobEndpoint string = storageAccount.properties.primaryEndpoints.blob
output extensionContainerUrl string = '${storageAccount.properties.primaryEndpoints.blob}extension'
