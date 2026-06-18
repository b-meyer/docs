@description('App name — becomes part of the resource name, e.g. tcm or 8fold.')
param appName string

@description('Environment tag.')
param env string = 'prod'

@description('Azure region.')
param location string = resourceGroup().location

resource swa 'Microsoft.Web/staticSites@2023-01-01' = {
  name: 'swa-${appName}-${env}'
  location: location
  sku: {
    name: 'Free'
    tier: 'Free'
  }
  properties: {}
}

output resourceName string = swa.name
