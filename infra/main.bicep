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

var managedIdentityName = 'id-${workloadName}-${environmentType}-${regionCode}-${instanceNumber}'

resource managedIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' = {
  name: managedIdentityName
  location: location
  tags: tags
}

output REGISTRY_NAME string = containerRegistry.name
output REGISTRY_LOGIN_SERVER string = containerRegistry.properties.loginServer
output STORAGE_ACCOUNT_NAME string = storageAccount.name
output STORAGE_ACCOUNT_BLOB_ENDPOINT string = storageAccount.properties.primaryEndpoints.blob
output EXTENSION_CONTAINER_URL string = '${storageAccount.properties.primaryEndpoints.blob}extension'
output MANAGED_IDENTITY_NAME string = managedIdentity.name
output MANAGED_IDENTITY_CLIENT_ID string = managedIdentity.properties.clientId
output MANAGED_IDENTITY_PRINCIPAL_ID string = managedIdentity.properties.principalId
