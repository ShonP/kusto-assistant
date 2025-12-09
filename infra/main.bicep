@description('Primary location for all resources')
param location string = resourceGroup().location

@description('The environment type')
@allowed(['dev', 'test', 'prod'])
param environmentType string = 'prod'

@description('The name of the workload')
param workloadName string = 'kustoassistant'

@description('Instance number for resources')
param instanceNumber string = '001'

var regionCode = {
  eastus2: 'eus2'
}[location]

var registryName = 'cr${workloadName}${environmentType}${regionCode}${instanceNumber}'

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

output registryName string = containerRegistry.name
output registryLoginServer string = containerRegistry.properties.loginServer
