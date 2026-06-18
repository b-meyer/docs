targetScope = 'subscription'

@description('Azure region.')
param location string = 'centralus'

@description('Resource group name.')
param resourceGroupName string = 'rg-docs-prod'

resource rg 'Microsoft.Resources/resourceGroups@2021-04-01' = {
  name: resourceGroupName
  location: location
}

module tcm 'swa.bicep' = {
  name: 'swa-tcm'
  scope: rg
  params: {
    appName: 'tcm'
    location: location
  }
}

module eightfold 'swa.bicep' = {
  name: 'swa-8fold'
  scope: rg
  params: {
    appName: '8fold'
    location: location
  }
}
