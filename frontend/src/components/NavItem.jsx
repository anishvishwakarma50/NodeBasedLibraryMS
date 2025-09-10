import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import * as Icons from 'lucide-react'

function NavItem({ icon, label, to }) {
  const location = useLocation()
  const isActive = location.pathname === to
  const IconComponent = Icons[icon]

  return (
    <Button 
      variant={isActive ? "secondary" : "ghost"} 
      className="w-full justify-start"
      asChild
    >
      <Link to={to}>
        {IconComponent && <IconComponent className="mr-2 h-4 w-4" />}
        {label}
      </Link>
    </Button>
  )
}

export default NavItem