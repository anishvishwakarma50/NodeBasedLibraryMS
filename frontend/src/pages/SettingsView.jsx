import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

function SettingsView() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage library settings and preferences</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Library Settings</CardTitle>
          <CardDescription>Configure library parameters</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Settings functionality coming soon...</p>
        </CardContent>
      </Card>
    </div>
  )
}

export default SettingsView